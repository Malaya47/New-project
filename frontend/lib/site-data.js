import { t } from "./translations";

export const services = [
  {
    title: t("Washing"),
    description: t(
      "Deep cleaning for your daily clothes. We sort by color and fabric type to ensure perfect results.",
    ),
  },
  {
    title: t("Drying"),
    description: t(
      "Gentle drying, ready for the day. Temperature-controlled cycles protect your garments from shrinking.",
    ),
  },
  {
    title: t("Ironing"),
    description: t(
      "Perfectly pressed for a professional look. Hand-finished detailing for crisp collars and cuffs.",
    ),
  },
  {
    title: t("Folding"),
    description: t(
      "Neatly folded and ready to be put away. Marie Kondo-style folding available upon request.",
    ),
  },
];

export const rules = [
  {
    title: t("Prepare Your Laundry"),
    type: "check",
    items: [
      t("Not sorted, but pre-washed if needed"),
      t("Remove delicate items"),
      t("Check pockets for loose items"),
    ],
  },
  {
    title: t("What You Should Know"),
    type: "check",
    items: [
      t("No liability for valuables left in pockets"),
      t("Report special care instructions beforehand"),
      t("Check clothing labels for washability"),
    ],
  },
  {
    title: t("Not Accepted"),
    type: "cross",
    items: [
      t("Silk, wool, leather garments"),
      t("Curtains, carpets, large bedding"),
      t("Heavily stained or damaged items"),
    ],
  },
];

export const processSteps = [
  {
    title: t("Scan your bag"),
    description: t(
      "Your QR-linked laundry bag identifies your account in seconds.",
    ),
  },
  {
    title: t("Choose a time window"),
    description: t("Select the pickup date and slot that fits your routine."),
  },
  {
    title: t("Place it by the door"),
    description: t(
      "Leave the bag outside in the morning for scheduled collection.",
    ),
  },
  {
    title: t("Receive it back clean"),
    description: t(
      "Your laundry returns washed, finished, and folded within 48 hours.",
    ),
  },
];

export const bookingSlots = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 13:00"];

export const laundryTypes = [
  { value: "white", label: t("White") },
  { value: "dark", label: t("Dark") },
  { value: "color", label: t("Color") },
];
