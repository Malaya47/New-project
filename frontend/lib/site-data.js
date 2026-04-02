export const services = [
  {
    title: "Wash",
    description: "Thoughtful everyday cleaning for regular weekly laundry and home essentials.",
  },
  {
    title: "Dry",
    description: "Handled gently as part of the full-service flow before return and packing.",
  },
  {
    title: "Iron",
    description: "Shirts and blouses can be added as a separate item-based finishing service.",
  },
  {
    title: "Fold",
    description: "Returned neatly folded so the bag feels ready to unpack the moment it arrives.",
  },
];

export const rules = [
  {
    title: "Prepare your laundry",
    items: [
      "Separate white, dark, and colored items.",
      "Use the bag for normal everyday laundry only.",
      "Do not overfill the bag.",
    ],
  },
  {
    title: "Important to know",
    items: [
      "Laundry is washed as handed over.",
      "Individual garments are not re-sorted.",
      "Mixed bags are washed together.",
    ],
  },
  {
    title: "Not accepted",
    items: [
      "Silk, wool, leather, or delicate specialty care pieces.",
      "Curtains, bulky bedding, and oversized home textiles.",
      "Very dirty garments that need stain-by-stain treatment.",
    ],
  },
];

export const processSteps = [
  {
    title: "Scan your bag",
    description: "Your QR-linked laundry bag identifies your account in seconds.",
  },
  {
    title: "Choose a time window",
    description: "Select the pickup date and slot that fits your routine.",
  },
  {
    title: "Place it by the door",
    description: "Leave the bag outside in the morning for scheduled collection.",
  },
  {
    title: "Receive it back clean",
    description: "Your laundry returns washed, finished, and folded within 48 hours.",
  },
];

export const bookingSlots = ["08:00 - 10:00", "10:00 - 12:00", "12:00 - 13:00"];

export const laundryTypes = [
  { value: "white", label: "White" },
  { value: "dark", label: "Dark" },
  { value: "color", label: "Color" },
];

