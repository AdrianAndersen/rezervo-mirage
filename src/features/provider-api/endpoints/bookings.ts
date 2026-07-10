import { defineEndpoint, HttpError, requireChain, requireUser } from "../handler";
import {
  bookingResultSchema,
  chainParamsSchema,
  classParamsSchema,
  createBookingRequestSchema,
} from "../schemas";
import { registrationRank } from "../serialize";

export const createBookingEndpoint = defineEndpoint({
  method: "POST",
  path: "/api/chains/{chainIdentifier}/bookings",
  summary: "Book a class for the authenticated member",
  tags: ["Bookings"],
  auth: true,
  params: chainParamsSchema,
  body: createBookingRequestSchema,
  successStatus: 201,
  response: bookingResultSchema,
  handler: async ({ params, body, request }) => {
    const chain = await requireChain(params.chainIdentifier);
    const userId = requireUser(request, chain.id);
    const classId = Number.parseInt(body.classId, 10);
    if (Number.isNaN(classId)) {
      throw new HttpError(400, "Invalid class id");
    }
    const repo = await import("../repository");
    const existing = await repo.findClassInChain(chain.id, classId);
    if (existing === null) {
      throw new HttpError(404, "Class not found");
    }
    if (existing.isCancelled) {
      throw new HttpError(409, "Class is cancelled");
    }
    if (!existing.isBookable) {
      throw new HttpError(409, "Class is not bookable");
    }
    const { cls, registrationId } = await repo.createBooking(userId, existing);
    const rank = registrationRank(cls, registrationId);
    const onWaitingList = rank > cls.totalSlots;
    return {
      status: onWaitingList ? ("WAITLIST" as const) : ("BOOKED" as const),
      positionInWaitList: onWaitingList ? rank - cls.totalSlots : null,
    };
  },
});

export const deleteBookingEndpoint = defineEndpoint({
  method: "DELETE",
  path: "/api/chains/{chainIdentifier}/bookings/{classId}",
  summary: "Cancel the authenticated member's booking for a class",
  tags: ["Bookings"],
  auth: true,
  params: classParamsSchema,
  successStatus: 204,
  handler: async ({ params, request }) => {
    const chain = await requireChain(params.chainIdentifier);
    const userId = requireUser(request, chain.id);
    const classId = Number.parseInt(params.classId, 10);
    if (Number.isNaN(classId)) {
      throw new HttpError(400, "Invalid class id");
    }
    const { deleteBooking } = await import("../repository");
    const deleted = await deleteBooking(userId, classId);
    if (!deleted) {
      throw new HttpError(404, "Booking not found");
    }
    return undefined;
  },
});
