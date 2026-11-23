// Small shared settings. Change a value here and the whole site follows.

/**
 * DEMO MODE. While true, every checkout page shows a "Demo mode" banner and the
 * confirmation page labels the order as a DEMO ORDER. No real order is placed and
 * no payment is taken. Round 2 (Supabase + Razorpay): set this to false only when
 * real orders and real payments are switched on.
 */
export const DEMO_MODE = true;

/**
 * Extra charge for Express delivery, added ON TOP of the standard delivery charge
 * (which is free from ₹499, otherwise ₹40: see lib/coupons.ts). SAMPLE value.
 */
export const EXPRESS_DELIVERY_FEE = 60;

/** localStorage keys */
export const ADDRESS_STORAGE_KEY = "vinoshadeal-address-v1";
export const ORDERS_STORAGE_KEY = "vinoshadeal-orders-v1";

/** Indian states and union territories for the address form. */
export const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // union territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
