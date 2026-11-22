import {
  BookOpen,
  CookingPot,
  Dumbbell,
  Gamepad2,
  Headphones,
  Plug,
  ShoppingBasket,
  Shirt,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  headphones: Headphones,
  shirt: Shirt,
  "cooking-pot": CookingPot,
  sparkles: Sparkles,
  basket: ShoppingBasket,
  plug: Plug,
  book: BookOpen,
  gamepad: Gamepad2,
  dumbbell: Dumbbell,
};

export default function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] ?? Sparkles;
  return <Icon className={className} aria-hidden="true" />;
}
