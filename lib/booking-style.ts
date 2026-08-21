import {
  Plane,
  BedDouble,
  Ticket,
  UtensilsCrossed,
  Car,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { BookingType } from "./trip-types";

export type BookingStyle = {
  Icon: LucideIcon;
  label: string;
  bg: string;
  fg: string;
  ring: string;
  dot: string;
};

export const BOOKING_STYLE: Record<BookingType, BookingStyle> = {
  flight: {
    Icon: Plane,
    label: "Flight",
    bg: "bg-sky-100",
    fg: "text-sky-700",
    ring: "ring-sky-200",
    dot: "bg-sky-500",
  },
  hotel: {
    Icon: BedDouble,
    label: "Stay",
    bg: "bg-purple-100",
    fg: "text-purple-700",
    ring: "ring-purple-200",
    dot: "bg-purple-500",
  },
  activity: {
    Icon: Ticket,
    label: "Activity",
    bg: "bg-pink-100",
    fg: "text-pink-700",
    ring: "ring-pink-200",
    dot: "bg-pink-500",
  },
  restaurant: {
    Icon: UtensilsCrossed,
    label: "Dining",
    bg: "bg-amber-100",
    fg: "text-amber-700",
    ring: "ring-amber-200",
    dot: "bg-amber-500",
  },
  transport: {
    Icon: Car,
    label: "Transport",
    bg: "bg-emerald-100",
    fg: "text-emerald-700",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
  },
  other: {
    Icon: Sparkles,
    label: "Note",
    bg: "bg-slate-100",
    fg: "text-slate-700",
    ring: "ring-slate-200",
    dot: "bg-slate-500",
  },
};
