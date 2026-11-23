// Site-wide facts and switches for the static pages (About, Contact, Help, and later Shipping, Returns, Privacy, Terms).
// Change a value here and every page follows.

/**
 * DRAFT SWITCH. While true, every static page shows a "Draft" note and is kept out of search engines.
 * Set it to false only after the page texts have been reviewed (the legal pages by a lawyer).
 */
export const CONTENT_IS_DRAFT = true;

/** The parent company website. */
export const PARENT_SITE_URL = "https://vinosha.in";

/**
 * Real contact details. Leave a value empty ("") and it is simply not shown anywhere:
 * we never show made-up contact details. Fill these in before launch.
 */
export const SITE_CONTACT = {
  /** e.g. "support@example.com" */
  email: "",
  /** shown as written, e.g. "+91 98765 43210" */
  phone: "",
  /** digits only with country code, e.g. "919876543210" (used for the WhatsApp link) */
  whatsapp: "",
  /** postal address, one line */
  address: "",
  /** e.g. "Monday to Saturday, 10 am to 6 pm" */
  hours: "",
};
