import type { Endpoint } from "../handler";
import { loginEndpoint } from "./auth";
import { createBookingEndpoint, deleteBookingEndpoint } from "./bookings";
import { chainEndpoint, listChainsEndpoint } from "./chains";
import { classEndpoint } from "./classes";
import { scheduleEndpoint } from "./schedule";
import { sessionsEndpoint } from "./sessions";

export {
  chainEndpoint,
  classEndpoint,
  createBookingEndpoint,
  deleteBookingEndpoint,
  listChainsEndpoint,
  loginEndpoint,
  scheduleEndpoint,
  sessionsEndpoint,
};

/** Every provider endpoint, in the order they appear in the OpenAPI document. */
export const allEndpoints: Endpoint[] = [
  listChainsEndpoint,
  chainEndpoint,
  loginEndpoint,
  scheduleEndpoint,
  sessionsEndpoint,
  createBookingEndpoint,
  deleteBookingEndpoint,
  classEndpoint,
];
