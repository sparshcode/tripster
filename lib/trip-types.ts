export type BookingType =
  | "flight"
  | "hotel"
  | "activity"
  | "restaurant"
  | "transport"
  | "other";

export type Booking = {
  id: string;
  type: BookingType;
  title: string;
  provider?: string;
  confirmationNumber?: string;
  startDatetime?: string;
  endDatetime?: string;
  location?: string;
  address?: string;
  cancellationPolicy?: string;
  paymentStatus?: string;
  people?: string[];
  actionsRequired?: string[];
  notes?: string;
  createdAt: string;
};

export type Trip = {
  id: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  bookings: Booking[];
};

export type ExtractPayload = {
  text?: string;
  images?: { mediaType: string; base64: string }[];
  pdf?: { base64: string };
};

export const BOOKING_ICON: Record<BookingType, string> = {
  flight: "✈️",
  hotel: "🏨",
  activity: "🎟️",
  restaurant: "🍣",
  transport: "🚕",
  other: "📌",
};
