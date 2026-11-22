# Vinoshadeal

Every deal. Every day. — A Vinosha Group company.

Next.js (App Router) + TypeScript + Tailwind CSS. Round 1: frontend with sample data.

## Run it on your computer (first time only: steps 1-3)

1. **Install Node.js.** Go to https://nodejs.org and download the button that says **LTS**. Install it like any normal program (keep clicking Next). Restart your computer afterwards if it asks.
2. **Open the project folder in a terminal.**
   - Windows: open the `vinoshadeal` folder, click the address bar at the top, type `cmd` and press Enter.
   - Mac: right-click the folder, choose "New Terminal at Folder".
3. **Install the project's parts** (takes 1-3 minutes, needs internet). Type this and press Enter:

   ```
   npm install
   ```

4. **Start the website.** Type this and press Enter:

   ```
   npm run dev
   ```

5. Open your browser and go to **http://localhost:3000**. You will see Vinoshadeal.
6. To stop it, click the terminal and press `Ctrl + C`.

Next time you only need steps 2, 4 and 5.

## Where things are

| Folder / file | What it does |
|---|---|
| `tailwind.config.ts` | Brand colors, fonts, rounded corners. Change a color here and the whole site updates. |
| `app/globals.css` | Light and dark mode colors, button and card styles. |
| `app/layout.tsx` | The frame around every page (header, footer, mobile bottom bar, WhatsApp button). |
| `app/page.tsx` | The home page. It just lists the sections in order. |
| `components/layout/` | Header, Footer, BottomNav, ThemeToggle, WhatsAppButton. |
| `components/home/` | One file per home page section. |
| `components/ProductCard.tsx` | The product card used everywhere. |
| `components/Logo.tsx` | The Vinoshadeal wordmark (V + dot). |
| `data/products.json`, `data/categories.json` | Sample data. 14 products for now; we add more in the next steps. |
| `lib/types.ts` | Data shapes (Product, Category, CartItem, Order, User). Round 2 database tables copy these. |
| `lib/data.ts` | The only file that reads the data. In Round 2 it will read from Supabase instead. |
| `public/` | Images. Your Vinosha Group logo is here. |

## Things to change later

- WhatsApp number: `components/layout/WhatsAppButton.tsx` (top of file).
- Real product photos: put them in `public/products/` and list them in `images` in `products.json`.
- Brand names and review text on the home page are samples.

## Known for now

- Links to pages that are not built yet (product, cart, category, account...) show a "404" page. We build them next.
- Cart and wishlist counts in the header are demo numbers.
