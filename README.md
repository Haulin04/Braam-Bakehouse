[README.md](https://github.com/user-attachments/files/34242027/README.md)
# Braam Bakehouse – Website (Part 3)

A website for **Braam Bakehouse**, a fictional student bakery at 100 Jorissen Street, Braamfontein, Johannesburg.
Built with plain **HTML, CSS and JavaScript** (no frameworks), so it runs on any free static host such as Netlify or GitHub Pages.

## Pages

| Page | File | What it does |
|------|------|--------------|
| Homepage | `index.html` | Welcome, live "open / closed" status, featured categories, opening-hours accordion |
| About us | `pages/about.html` | Story, mission, values, FAQ accordion |
| Services | `pages/services.html` | All 12 products, built by JavaScript; search, category tabs, sort, add to cart / wishlist |
| Gallery | `pages/gallery.html` | Photo grid with filter buttons and a lightbox (click, arrows, keyboard, Esc) |
| Enquiry | `pages/enquiry.html` | Ask about products/services – shows estimated cost and date availability |
| Contact | `pages/contact.html` | General message form compiled into an email, interactive map, directions |
| Wishlist | `pages/wishlist.html` | Saved products |
| Checkout | `pages/checkout.html` | Collection/delivery, time slots in opening hours, validation, order number |
| 404 | `404.html` | Friendly "page not found" page |

## How to run it

* **On your computer:** open `index.html` in a browser (Chrome, Edge, Firefox). Everything works offline except the map and form sending.
* **Deploy to Netlify (free):** sign in at https://app.netlify.com → *Add new site* → *Deploy manually* → drag this whole folder in. Netlify reads `_headers` (security headers) and serves `404.html` automatically.
* **Deploy to GitHub Pages (free):** push this folder to a repository → *Settings* → *Pages* → *Deploy from branch* → `main` / root.

After deploying, replace `https://braam-bakehouse.netlify.app/` with your real site address in every page's `<link rel="canonical">` / `og:url`, in `sitemap.xml` and in `robots.txt`.

## Receiving form messages (important)

Both forms send in the background (AJAX with `fetch()`) to **FormSubmit** (https://formsubmit.co), a free service that forwards form messages to an email inbox.

1. Open `JS/products.js` and change `email: "info@braambakehouse.co.za"` to **your real email address** (the bakery address is fictional, so nothing will arrive there).
2. Deploy the site, submit the enquiry form once, and click the **activation link** FormSubmit emails you.
3. From then on every enquiry and contact message arrives in your inbox.

If sending fails (no internet, or not activated yet) the contact form offers an **"Open in my email app"** button that opens a pre-filled email instead.

## Changelog

### Part 3 (this version)

**Corrections from Part 2**
* Fixed the misspelt `Assests` folder → pages now live in `pages/` with clean, lower-case file names (`about.html`, not `About.html`).
* Fixed enquiry form labels that did not match their inputs (e.g. `for="Enquiry type"` – ids cannot contain spaces) and the "Email adress" spelling.
* Search bar, "Add to cart" and quantity boxes now actually work (they did nothing before).
* Images renamed descriptively (`braam-bakehouse-cupcakes.webp`) and converted to WebP – images went from about 12.8 MB to 0.7 MB, so pages load faster.
* Every image now has meaningful `alt` text.
* Consistent navigation, footer and "Go back to top" on every page; the current page is highlighted.
* Layout is responsive – checked at phone (390 px) and desktop (1280 px) widths with no sideways scrolling.

*(If your lecturer gave specific Part 2 feedback, add each point here with what you changed.)*

**New – JavaScript & interactivity**
* `JS/products.js` – product data in one place; pages are built from it (DOM manipulation).
* `JS/script.js` – cart drawer, wishlist, live search with suggestions, category tabs, sorting, checkout; saved in `localStorage` so they survive page reloads.
* `JS/interactive.js` – fade-in animations on scroll, accordions, gallery lightbox and filters, live opening-status badge, Leaflet map with "how far am I?" and directions.
* `JS/forms.js` – validation with an error message under each field, enquiry cost estimate and availability, contact message compiled into an email, AJAX sending.

**New – forms (two different purposes)**
* **Enquiry form:** about products/services – type, product, quantity, date needed. Responds with estimated cost and whether the date is available.
* **Contact form:** general message – name, email, phone, message type and message, compiled into an email to the bakery.

**New – SEO**
* Unique `<title>`, meta description and keywords on every page (local keywords: "bakery Braamfontein", "custom cakes Johannesburg").
* Open Graph and Twitter tags for nice previews when shared; share links in the footer.
* One `<h1>` per page with logical `<h2>`/`<h3>` headings; semantic `<header>`, `<nav>`, `<main>`, `<footer>`.
* Local SEO: `Bakery` structured data (address, phone, hours, map coordinates) on the About and Contact pages.
* `robots.txt` and `sitemap.xml` added. Internal links between pages.

**New – performance & security**
* WebP images, `loading="lazy"`, width/height set to stop layout jumping.
* `_headers` file adds security headers on Netlify (no framing, no MIME sniffing, strict referrer policy).
* Map library loaded with Subresource Integrity (SRI) hashes; all user text is escaped before being shown on the page.

### Part 2
* Five static HTML/CSS pages: Home, About, Services, Enquiry, Contact. Google Maps embed on Contact.

### Part 1
* Proposal (`webdevelopment proposal 1.docx`, `proposal 2.docx`) and wireframes (`Image/wireframes.png`).

## Things to replace before handing in

* Recipient email in `JS/products.js` (see above).
* Site address `https://braam-bakehouse.netlify.app/` (see "How to run it").
* Instagram/Facebook links (`@braambakehouse`) in the footer are examples – point them to real pages or remove them.
* `JS/forms.js` → `NOTICE_DAYS` (custom cakes 3 days, bulk orders 2 days) is an **example rule**; set your own.
* Checkout shows an order number but does not send or store orders and takes no payment.

## References

* Leaflet 1.9.4 – interactive maps. https://leafletjs.com
* OpenStreetMap contributors – map tiles. https://www.openstreetmap.org/copyright
* FormSubmit – form-to-email service. https://formsubmit.co
* MDN Web Docs – Fetch API, Constraint Validation, localStorage, Intersection Observer, Geolocation. https://developer.mozilla.org
* Google Search Central – SEO starter guide, robots.txt and sitemaps. https://developers.google.com/search/docs
* Schema.org – Bakery type. https://schema.org/Bakery
* W3C – HTML validator. https://validator.w3.org
* Netlify Docs – custom headers and 404 pages. https://docs.netlify.com
* Product and banner images: created for this project (AI-generated).

## Folder layout

Only `index.html`, `README.md` and the proposal documents sit at the top level. Everything else is in `CSS/`, `JS/` or `pages/` (pictures are in the top-level `Image/` folder; `404.html`, `robots.txt`, `sitemap.xml` and `_headers` are in `pages/`).

Note: hosts like Netlify only use `404.html`, `robots.txt` and `sitemap.xml` automatically when they are at the top level, so move them back up when deploying if you want those features to work.
