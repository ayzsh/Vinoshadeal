import { MessageCircle } from "lucide-react";
import { SITE_CONTACT } from "@/lib/site";

// The number comes from lib/site.ts (SITE_CONTACT.whatsapp: digits with country code, no + or spaces).
// While it is empty the button is not shown at all, so nobody is sent to a number that is not ours.
export default function WhatsAppButton() {
  const number = SITE_CONTACT.whatsapp.replace(/\D/g, "");
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}?text=${encodeURIComponent("Hi Vinoshadeal, I need help with...")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#128C7E] text-white shadow-lift transition hover:scale-110 md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
