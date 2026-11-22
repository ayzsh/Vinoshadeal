import { MessageCircle } from "lucide-react";

// TODO: replace with your real WhatsApp number (country code, no + or spaces).
const WHATSAPP_NUMBER = "910000000000";

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi Vinoshadeal, I need help with...")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#128C7E] text-white shadow-lift transition hover:scale-110 md:bottom-6 md:right-6"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
