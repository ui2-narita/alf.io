/**
 * This file is part of alf.io.
 *
 * alf.io is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * alf.io is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with alf.io.  If not, see <http://www.gnu.org/licenses/>.
 */
package alfio.manager;

import alfio.controller.form.UpdateTicketOwnerForm;
import alfio.manager.support.*;
import alfio.manager.system.ConfigurationManager;
import alfio.manager.system.Mailer;
import alfio.model.*;
import alfio.model.SpecialPrice.Status;
import alfio.model.Ticket.TicketStatus;
import alfio.model.TicketReservation.TicketReservationStatus;
import alfio.model.modification.TicketReservationWithOptionalCodeModification;
import alfio.model.modification.TicketWithStatistic;
import alfio.model.system.ConfigurationKeys;
import alfio.repository.*;
import alfio.repository.user.OrganizationRepository;
import alfio.util.MonetaryUtil;
import com.lowagie.text.DocumentException;
import lombok.Data;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Validate;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.lang3.tuple.Triple;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static alfio.util.MonetaryUtil.formatCents;
import static alfio.util.OptionalWrapper.optionally;

@Component
@Transactional
@Log4j2
public class TicketReservationManager {
	
	public static final int RESERVATION_MINUTE = 25;
    public static final String STUCK_TICKETS_MSG = "there are stuck tickets for the event %s. Please check admin area.";
    public static final String STUCK_TICKETS_SUBJECT = "warning: stuck tickets found";

    private final EventRepository eventRepository;
	private final OrganizationRepository organizationRepository;
    private final TicketRepository ticketRepository;
	private final TicketReservationRepository ticketReservationRepository;
	private final TicketCategoryRepository ticketCategoryRepository;
	private final ConfigurationManager configurationManager;
    private final PaymentManager paymentManager;
    private final SpecialPriceRepository specialPriceRepository;
    private final Mailer mailer;
    private final TransactionRepository transactionRepository;
	private final NotificationManager notificationManager;
	private final MessageSource messageSource;

	public static class NotEnoughTicketsException extends RuntimeException {
		
	}

	public static class MissingSpecialPriceTokenException extends RuntimeException {
	}

	public static class InvalidSpecialPriceTokenException extends RuntimeException {

	}
	
	@Data
	public static class TotalPrice {
		private final int priceWithVAT;
		private final int VAT;
	}
	
	@Autowired
	public TicketReservationManager(EventRepository eventRepository,
									OrganizationRepository organizationRepository,
									TicketRepository ticketRepository,
									TicketReservationRepository ticketReservationRepository,
									TicketCategoryRepository ticketCategoryRepository,
									ConfigurationManager configurationManager,
									PaymentManager paymentManager,
									SpecialPriceRepository specialPriceRepository,
									TransactionRepository transactionRepository,
									Mailer mailer,
									NotificationManager notificationManager,
									MessageSource messageSource) {
		this.eventRepository = eventRepository;
        this.organizationRepository = organizationRepository;
        this.ticketRepository = ticketRepository;
		this.ticketReservationRepository = ticketReservationRepository;
		this.ticketCategoryRepository = ticketCategoryRepository;
		this.configurationManager = configurationManager;
        this.paymentManager = paymentManager;
        this.specialPriceRepository = specialPriceRepository;
        this.mailer = mailer;
        this.transactionRepository = transactionRepository;
		this.notificationManager = notificationManager;
		this.messageSource = messageSource;
	}
	
    /**
     * Create a ticket reservation. It will create a reservation _only_ if it can find enough tickets. Note that it will not do date/validity validation. This must be ensured by the
     * caller.
     * 
     * @param eventId
     * @param list
     * @param reservationExpiration
     * @return
     */
    public String createTicketReservation(int eventId, List<TicketReservationWithOptionalCodeModification> list, Date reservationExpiration, Optional<String> specialPriceSessionId) throws NotEnoughTicketsException, MissingSpecialPriceTokenException, InvalidSpecialPriceTokenException {
        String transactionId = UUID.randomUUID().toString();
        ticketReservationRepository.createNewReservation(transactionId, reservationExpiration);
		list.forEach(t -> reserveTicketsForCategory(eventId, specialPriceSessionId, transactionId, t));
    	return transactionId;
    }

	private void reserveTicketsForCategory(int eventId, Optional<String> specialPriceSessionId, String transactionId, TicketReservationWithOptionalCodeModification ticketReservation) {
		List<Integer> reservedForUpdate = ticketRepository.selectTicketInCategoryForUpdate(eventId, ticketReservation.getTicketCategoryId(), ticketReservation.getAmount());
		int requested = ticketReservation.getAmount();
		if (reservedForUpdate.size() != requested) {
            throw new NotEnoughTicketsException();
        }

		Optional<SpecialPrice> specialPrice = fixToken(ticketReservation.getSpecialPrice(), ticketReservation.getTicketCategoryId(), eventId, specialPriceSessionId, ticketReservation);
		if (specialPrice.isPresent()) {
			if(reservedForUpdate.size() != 1) {
				throw new NotEnoughTicketsException();
			}
            SpecialPrice sp = specialPrice.get();
            ticketRepository.reserveTicket(transactionId, reservedForUpdate.stream().findFirst().orElseThrow(IllegalStateException::new),sp.getId());
            specialPriceRepository.updateStatus(sp.getId(), Status.PENDING.toString(), sp.getSessionIdentifier());
        } else {
            ticketRepository.reserveTickets(transactionId, reservedForUpdate);
        }
	}

	private Optional<SpecialPrice> fixToken(Optional<SpecialPrice> token, int ticketCategoryId, int eventId, Optional<String> specialPriceSessionId, TicketReservationWithOptionalCodeModification ticketReservation) {

		TicketCategory ticketCategory = ticketCategoryRepository.getById(ticketCategoryId, eventId);
		if(!ticketCategory.isAccessRestricted()) {
			return Optional.empty();
		}

		Optional<SpecialPrice> specialPrice = renewSpecialPrice(token, specialPriceSessionId);

		if(token.isPresent() && !specialPrice.isPresent()) {
			//there is a special price in the request but this isn't valid anymore
			throw new InvalidSpecialPriceTokenException();
		}

		boolean canAccessRestrictedCategory = specialPrice.isPresent()
				&& specialPrice.get().getStatus() == SpecialPrice.Status.FREE
				&& specialPrice.get().getTicketCategoryId() == ticketCategoryId;


		if (canAccessRestrictedCategory && ticketReservation.getAmount() > 1) {
			throw new NotEnoughTicketsException();
		}

		if (!canAccessRestrictedCategory && ticketCategory.isAccessRestricted()) {
			throw new MissingSpecialPriceTokenException();
		}

		return specialPrice;
	}

    public PaymentResult confirm(String gatewayToken, Event event, String reservationId,
								 String email, String fullName, String billingAddress,
								 TotalPrice reservationCost, Optional<String> specialPriceSessionId) {
        try {
            PaymentResult paymentResult;
            if(reservationCost.getPriceWithVAT() > 0) {
                transitionToInPayment(reservationId, email, fullName, billingAddress);
                paymentResult = paymentManager.processPayment(reservationId, gatewayToken, reservationCost.getPriceWithVAT(), event, email, fullName, billingAddress);
                if(!paymentResult.isSuccessful()) {
                    reTransitionToPending(reservationId);
                    return paymentResult;
                }
            } else {
                paymentResult = PaymentResult.successful("not-paid");
            }
            completeReservation(reservationId, email, fullName, billingAddress, specialPriceSessionId);
            return paymentResult;
        } catch(Exception ex) {
            //it is guaranteed that in this case we're dealing with "local" error (e.g. database failure),
            //thus it is safer to not rollback the reservation status
            log.error("unexpected error during payment confirmation", ex);
            return PaymentResult.unsuccessful("error.STEP2_STRIPE_unexpected");
        }

    }

    private void transitionToInPayment(String reservationId, String email, String fullName, String billingAddress) {
    	int updatedReservation = ticketReservationRepository.updateTicketReservation(reservationId, TicketReservationStatus.IN_PAYMENT.toString(), email, fullName, billingAddress, null);
		Validate.isTrue(updatedReservation == 1, "expected exactly one updated reservation, got "+updatedReservation);
    }
    
	private void reTransitionToPending(String reservationId) {
		int updatedReservation = ticketReservationRepository.updateTicketStatus(reservationId, TicketReservationStatus.PENDING.toString());
		Validate.isTrue(updatedReservation == 1, "expected exactly one updated reservation, got "+updatedReservation);
		
	}
    
	//check internal consistency between the 3 values
    public Optional<Triple<Event, TicketReservation, Ticket>> from(String eventName, String reservationId, String ticketIdentifier) {
    	return optionally(() -> Triple.of(eventRepository.findByShortName(eventName), 
				ticketReservationRepository.findReservationById(reservationId), 
				ticketRepository.findByUUID(ticketIdentifier))).flatMap((x) -> {
					
					Ticket t = x.getRight();
					Event e = x.getLeft();
					TicketReservation tr = x.getMiddle();
					
					if(tr.getId().equals(t.getTicketsReservationId()) && e.getId() == t.getEventId()) {
						return Optional.of(x);
					} else {
						return Optional.empty();
					}
					
				});
    }

    /**
     * Set the tickets attached to the reservation to the ACQUIRED state and the ticket reservation to the COMPLETE state. Additionally it will save email/fullName/billingaddress.
     *  @param reservationId
     * @param email
	 * @param fullName
	 * @param billingAddress
	 * @param specialPriceSessionId
	 */
	private void completeReservation(String reservationId, String email, String fullName, String billingAddress, Optional<String> specialPriceSessionId) {
		int updatedTickets = ticketRepository.updateTicketStatus(reservationId, TicketStatus.ACQUIRED.toString());
		Validate.isTrue(updatedTickets > 0, "no tickets have been updated");
		specialPriceRepository.updateStatusForReservation(Collections.singletonList(reservationId), Status.TAKEN.toString());
        ZonedDateTime timestamp = ZonedDateTime.now(ZoneId.of("UTC"));
		int updatedReservation = ticketReservationRepository.updateTicketReservation(reservationId, TicketReservationStatus.COMPLETE.toString(), email, fullName, billingAddress, timestamp);
		Validate.isTrue(updatedReservation == 1, "expected exactly one updated reservation, got "+updatedReservation);
		//cleanup unused special price codes...
		specialPriceSessionId.ifPresent(specialPriceRepository::unbindFromSession);
	}


	public void cleanupExpiredPendingReservation(Date expirationDate) {
		List<String> expiredReservationIds = ticketReservationRepository.findExpiredReservation(expirationDate);
		if(expiredReservationIds.isEmpty()) {
			return;
		}
		
		specialPriceRepository.updateStatusForReservation(expiredReservationIds, Status.FREE.toString());
		ticketRepository.freeFromReservation(expiredReservationIds);
		ticketReservationRepository.remove(expiredReservationIds);
	}

    /**
     * Finds all the reservations that are "stuck" in payment status.
     * This could happen when there is an internal error after a successful credit card charge.
     *
     * @param expirationDate expiration date
     */
    public void markExpiredInPaymentReservationAsStuck(Date expirationDate) {
        final List<String> stuckReservations = ticketReservationRepository.findStuckReservations(expirationDate);
        stuckReservations.forEach(reservationId -> ticketReservationRepository.updateTicketStatus(reservationId, TicketReservationStatus.STUCK.name()));
        stuckReservations.stream()
                .map(id -> ticketRepository.findTicketsInReservation(id).stream().findFirst())
                .filter(Optional::isPresent)
                .map(Optional::get)
                .mapToInt(Ticket::getEventId)
                .distinct()
                .mapToObj(eventRepository::findById)
                .map(e -> Pair.of(e, organizationRepository.getById(e.getOrganizationId())))
                .forEach(pair -> mailer.send(pair.getRight().getEmail(),
                                    STUCK_TICKETS_SUBJECT,
                                    String.format(STUCK_TICKETS_MSG, pair.getLeft().getShortName()),
                                    Optional.empty())
                );
    }

    public List<TicketWithStatistic> loadModifiedTickets(int eventId, int categoryId) {
        Event event = eventRepository.findById(eventId);
        return ticketRepository.findAllModifiedTickets(eventId, categoryId).stream()
                .map(t -> new TicketWithStatistic(t, ticketReservationRepository.findReservationById(t.getTicketsReservationId()),
						event.getZoneId(), optionally(() -> transactionRepository.loadByReservationId(t.getTicketsReservationId()))))
				.sorted()
                .collect(Collectors.toList());
    }

	private int totalFrom(List<Ticket> tickets) {
    	return tickets.stream().mapToInt(Ticket::getPaidPriceInCents).sum();
    }

	/**
	 * Get the total cost with VAT if it's not included in the ticket price.
	 * 
	 * @param reservationId
	 * @return
	 */
    public TotalPrice totalReservationCostWithVAT(String reservationId) {
    	Event event = eventRepository.findByReservationId(reservationId);
		List<Ticket> tickets = ticketRepository.findTicketsInReservation(reservationId);
		int net = totalFrom(tickets);
		int vat = totalVat(tickets, event.getVat());
    	return new TotalPrice(net + vat, vat);
    }

	private int totalVat(List<Ticket> tickets, BigDecimal vat) {
		return tickets.stream().mapToInt(Ticket::getPaidPriceInCents).map(p -> MonetaryUtil.calcVat(p, vat)).sum();
	}
    
    public OrderSummary orderSummaryForReservationId(String reservationId, Event event) {
    	TotalPrice reservationCost = totalReservationCostWithVAT(reservationId);
    	List<SummaryRow> summary = extractSummary(reservationId, event);
    	return new OrderSummary(reservationCost, summary, reservationCost.getPriceWithVAT() == 0, formatCents(reservationCost.getPriceWithVAT()), formatCents(reservationCost.getVAT()));
    }
    
    private List<SummaryRow> extractSummary(String reservationId, Event event) {
    	List<SummaryRow> summary = new ArrayList<>();
    	List<Ticket> tickets = ticketRepository.findTicketsInReservation(reservationId);
    	tickets.stream().collect(Collectors.groupingBy(Ticket::getCategoryId)).forEach((categoryId, ticketsByCategory) -> {
            int paidPriceInCents = ticketsByCategory.get(0).getPaidPriceInCents();
            if(event.isVatIncluded()) {
                paidPriceInCents = MonetaryUtil.addVAT(paidPriceInCents, event.getVat());
            }
    		String categoryName = ticketCategoryRepository.getById(categoryId, event.getId()).getName();
            final int subTotal = paidPriceInCents * ticketsByCategory.size();
            summary.add(new SummaryRow(categoryName, formatCents(paidPriceInCents), ticketsByCategory.size(), formatCents(subTotal), subTotal));
    	});
    	return summary;
    } 
    
    public String reservationUrl(String reservationId) {
    	Event event = eventRepository.findByReservationId(reservationId);
		return StringUtils.removeEnd(configurationManager.getRequiredValue(ConfigurationKeys.BASE_URL), "/")
				+ "/event/" + event.getShortName() + "/reservation/" + reservationId;
    }


	public int maxAmountOfTickets() {
        return configurationManager.getIntConfigValue(ConfigurationKeys.MAX_AMOUNT_OF_TICKETS_BY_RESERVATION, 5);
	}
	
	public Optional<TicketReservation> findById(String reservationId) {
		return optionally(() -> ticketReservationRepository.findReservationById(reservationId));
	}



	public void cancelPendingReservation(String reservationId) {

		Validate.isTrue(ticketReservationRepository.findReservationById(reservationId).getStatus() == TicketReservationStatus.PENDING, "status is not PENDING");

		List<String> reservationIdsToRemove = Collections.singletonList(reservationId);
		specialPriceRepository.updateStatusForReservation(reservationIdsToRemove, Status.FREE.toString());
		int updatedTickets = ticketRepository.freeFromReservation(reservationIdsToRemove);
		Validate.isTrue(updatedTickets > 0, "no tickets have been updated");
		int removedReservation = ticketReservationRepository.remove(reservationIdsToRemove);
		Validate.isTrue(removedReservation == 1, "expected exactly one removed reservation, got "+removedReservation);
	}

	public SpecialPrice getSpecialPriceByCode(String code) {
		return specialPriceRepository.getByCode(code);
	}

	public Optional<SpecialPrice> renewSpecialPrice(Optional<SpecialPrice> specialPrice, Optional<String> specialPriceSessionId) {
		Validate.isTrue(specialPrice.isPresent(), "special price is not present");

		SpecialPrice price = specialPrice.get();

		if(!specialPriceSessionId.isPresent()) {
			log.warn("cannot renew special price {}: session identifier not found or not matching", price.getCode());
			return Optional.empty();
		}

		if(price.getStatus() == Status.PENDING && !StringUtils.equals(price.getSessionIdentifier(), specialPriceSessionId.get())) {
			log.warn("cannot renew special price {}: session identifier not found or not matching", price.getCode());
			return Optional.empty();
		}

		if(price.getStatus() == Status.FREE) {
			specialPriceRepository.bindToSession(price.getId(), specialPriceSessionId.get());
			return Optional.of(getSpecialPriceByCode(price.getCode()));
		} else if(price.getStatus() == Status.PENDING) {
			Optional<Ticket> optionalTicket = optionally(() -> ticketRepository.findBySpecialPriceId(price.getId()));
			if(optionalTicket.isPresent()) {
				cancelPendingReservation(optionalTicket.get().getTicketsReservationId());
				return Optional.of(getSpecialPriceByCode(price.getCode()));
			}
		}

		return specialPrice;
	}

	public List<Ticket> findTicketsInReservation(String reservationId) {
		return ticketRepository.findTicketsInReservation(reservationId);
	}

	public int countUnsoldTicket(int eventId, int categoryId) {
		return ticketRepository.countUnsoldTicket(eventId, categoryId);
	}
	
	public Optional<String> getVAT() {
		return configurationManager.getStringConfigValue(ConfigurationKeys.VAT_NR);
	}

	public void updateTicketOwner(Ticket ticket,
								  Locale locale,
								  Event event,
								  UpdateTicketOwnerForm updateTicketOwner,
								  TextTemplateBuilder confirmationTextBuilder,
								  TextTemplateBuilder ownerChangeTextBuilder,
								  PDFTemplateBuilder pdfTemplateBuilder) {

		String newEmail = updateTicketOwner.getEmail().trim();
		String newFullName = updateTicketOwner.getFullName().trim();
		ticketRepository.updateTicketOwner(ticket.getUuid(), newEmail, newFullName);
		//
		ticketRepository.updateOptionalTicketInfo(ticket.getUuid(), updateTicketOwner.getJobTitle(),
				updateTicketOwner.getCompany(),
				updateTicketOwner.getPhoneNumber(),
				updateTicketOwner.getAddress(),
				updateTicketOwner.getCountry(),
				updateTicketOwner.getTShirtSize(),
				updateTicketOwner.getNotes(),
				locale.getLanguage());

		if (!StringUtils.equalsIgnoreCase(newEmail, ticket.getEmail()) || !StringUtils.equalsIgnoreCase(newFullName, ticket.getFullName())) {
			sendTicketByEmail(ticket, locale, event, confirmationTextBuilder, pdfTemplateBuilder);
		}

		if (StringUtils.isNotBlank(ticket.getEmail()) && !StringUtils.equalsIgnoreCase(newEmail, ticket.getEmail())) {
			String subject = messageSource.getMessage("ticket-has-changed-owner-subject", new Object[] {event.getShortName()}, locale);
			notificationManager.sendSimpleEmail(ticket.getEmail(), subject, ownerChangeTextBuilder);
		}
	}

	private void sendTicketByEmail(Ticket ticket, Locale locale, Event event, TextTemplateBuilder confirmationTextBuilder, PDFTemplateBuilder pdfTemplateBuilder) {
		try {
            notificationManager.sendTicketByEmail(ticket, event, locale, confirmationTextBuilder, pdfTemplateBuilder);
        } catch (DocumentException e) {
            throw new IllegalStateException(e);
        }
	}

	public Optional<Triple<Event, TicketReservation, Ticket>> fetchComplete(String eventName, String reservationId, String ticketIdentifier) {
		return from(eventName, reservationId, ticketIdentifier).flatMap((t) -> {
			if(t.getMiddle().getStatus() == TicketReservationStatus.COMPLETE) {
				return Optional.of(t);
			} else {
				return Optional.empty();
			}
		});
	}

	/**
	 * Return a fully present triple only if the values are present (obviously) and the the reservation has a COMPLETE status and the ticket is considered assigned.
	 *
	 * @param eventName
	 * @param reservationId
	 * @param ticketIdentifier
	 * @return
	 */
	public Optional<Triple<Event, TicketReservation, Ticket>> fetchCompleteAndAssigned(String eventName, String reservationId, String ticketIdentifier) {
		return fetchComplete(eventName, reservationId, ticketIdentifier).flatMap((t) -> {
			if(t.getRight().getAssigned()) {
				return Optional.of(t);
			} else {
				return Optional.empty();
			}
		});
	}
}