"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Info } from "lucide-react";
import Breadcrumbs from "@/components/listing/Breadcrumbs";
import { DEMO_MODE } from "@/lib/constants";
import { ACCOUNT_SECTIONS, isActiveSection } from "@/components/account/nav";

/**
 * Frame for every /account page: page title, breadcrumbs, a menu
 * (tabs you can swipe on phones, a side menu from tablet width up) and the demo note.
 */
export default function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLUListElement>(null);

  // On phones the menu scrolls sideways: bring the current section into view.
  useEffect(() => {
    const active = menuRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    active?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);
  const current = ACCOUNT_SECTIONS.find((s) => isActiveSection(s.href, pathname) && s.href !== "/account");
  const overview = ACCOUNT_SECTIONS[0];

  return (
    <div className="container-page py-6 pb-24 md:pb-10">
      <Breadcrumbs
        items={
          current
            ? [{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, { label: current.label }]
            : [{ label: "Home", href: "/" }, { label: "My account" }]
        }
      />
      <h1 className="mt-3 font-heading text-2xl font-bold text-heading">{(current ?? overview).title}</h1>

      {DEMO_MODE && (
        <div
          role="note"
          className="mt-4 flex items-start gap-2 rounded-field border border-line bg-tint px-4 py-3 text-sm font-semibold text-ink"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            Demo mode: accounts are not switched on yet. Your orders, wishlist and details are saved on this
            device only.
          </p>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[14rem_minmax(0,1fr)] md:items-start">
        <nav aria-label="Account sections" className="min-w-0">
          <ul
            ref={menuRef}
            className="no-scrollbar flex snap-x gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
          >
            {ACCOUNT_SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = isActiveSection(s.href, pathname);
              const base = "flex items-center gap-2 whitespace-nowrap rounded-field px-4 py-2.5 text-sm font-semibold";
              return (
                <li key={s.href} className="shrink-0 snap-start md:shrink">
                  {s.available ? (
                    <Link
                      href={s.href}
                      aria-current={active ? "page" : undefined}
                      className={`${base} ${
                        active ? "bg-brand-purple text-white" : "border border-line text-ink hover:bg-tint md:border-0"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {s.label}
                    </Link>
                  ) : (
                    <span
                      aria-disabled="true"
                      className={`${base} border border-dashed border-line text-muted md:border-0`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {s.label} <span className="text-xs font-normal">(soon)</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
