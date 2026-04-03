export const services = [
  {
    title: "Washing",
    description:
      "Deep cleaning for your daily clothes. We sort by color and fabric type to ensure perfect results.",
  },
  {
    title: "Drying",
    description:
      "Gentle drying, ready for the day. Temperature-controlled cycles protect your garments from shrinking.",
  },
  {
    title: "Ironing",
    description:
      "Perfectly pressed for a professional look. Hand-finished detailing for crisp collars and cuffs.",
  },
  {
    title: "Folding",
    description:
      "Neatly folded and ready to be put away. Marie Kondo-style folding available upon request.",
  },
];

export const rules = [
  {
    title: "Prepare Your Laundry",
    type: "check",
    items: [
      "Not sorted, but pre-washed if needed",
      "Remove delicate items",
      "Check pockets for loose items",
    ],
  },
  {
    title: "What You Should Know",
    type: "check",
    items: [
      "No liability for valuables left in pockets",
      "Report special care instructions beforehand",
      "Check clothing labels for washability",
    ],
  },
  {
    title: "Not Accepted",
    type: "cross",
    items: [
      "Silk, wool, leather garments",
      "Curtains, carpets, large bedding",
      "Heavily stained or damaged items",
    ],
  },
];

export const processSteps = [
  {
    title: "Scan your bag",
    description:
      "Your QR-linked laundry bag identifies your account in seconds.",
  },
  {
    title: "Choose a time window",
    description: "Select the pickup date and slot that fits your routine.",
  },
  {
    title: "Place it by the door",
    description:
      "Leave the bag outside in the morning for scheduled collection.",
  },
  {
    title: "Receive it back clean",
    description:
      "Your laundry returns washed, finished, and folded within 48 hours.",
  },
];

export const bookingSlots = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 13:00"];

export const laundryTypes = [
  { value: "white", label: "White" },
  { value: "dark", label: "Dark" },
  { value: "color", label: "Color" },
];
