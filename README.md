# Chops Barbers — Website

Built for: Chops Barbers, Al Bidaa, Salmiya, Kuwait
Stack: HTML5, CSS3, vanilla JS — no build step, no dependencies.
**Structure: fully FLAT.** Every file sits directly in the repo root — no
subfolders anywhere, on purpose (mobile GitHub uploads keep flattening
nested folders, so the site no longer depends on any).

---

## 🔧 What was fixed in this version

**1. The "empty space" bug (the big one).**
`main.js` didn't make it into the repo the last two uploads. Every
scroll-reveal section on the site (services list, reviews, "why choose
us" points) is designed to fade in via JavaScript — with no JS running,
that content stayed invisible at `opacity:0` forever. It wasn't empty
space, it was your actual content with no way to become visible.

Fixed two ways:
- **Structurally, in `style.css`:** content is now visible *by default*.
  The fade-in-on-scroll effect only activates once JavaScript confirms
  it's actually running (`html.has-js`). If `main.js` is ever missing
  again for any reason, nothing on the site can go invisible — you'd
  just lose the animation, not the content.
- **Please still upload `main.js` this time** — it also drives the mobile
  menu, the 3D logo effect, and the entire booking system below.

**2. Mobile menu not clickable.**
Same root cause — no JS, no click handler. Fixed by the above; also
cleaned up a real bug where two separate "Book Now" buttons were both
rendering in the header at once. There's now exactly one, always.

**3. Booking moved from WhatsApp to email.**
See below — a full new feature, not just a bug fix.

---

## 📁 Files (14 total — upload every single one into the repo root)

```
index.html                Home
about.html                Our Story / Why Choose Chops
services.html             Full menu — browse and select, then continue to booking
book.html                 NEW — the actual booking form (email delivery via Formspree)
contact.html              General inquiries, location, map
404.html                  On-brand error page
style.css                 All site styling
main.js                   Nav, reveals, 3D emblem, service selector, both forms
logo.png / favicon-32.png / apple-touch-icon.png
interior-hero.jpg / interior-warm.jpg
README.md
```

---

## 📬 How booking works now

- **Services page** — browse the full menu, check off what you want, see a
  running total. Clicking "Continue to Booking" carries your selections
  into the Book page automatically (no re-selecting).
- **Book page** — the real booking form: name, email, phone, preferred
  date/time, the same service menu (pre-filled if you came from Services),
  a live running total, and a notes field. Submitting sends everything to
  your inbox via Formspree.
- **WhatsApp and phone still exist** — in the footer and Contact page — as
  quick contact options, just no longer positioned as the primary way to
  book, per your instruction.

---

## ⚠️ Before this goes fully live: connect Formspree (two forms now)

Both `contact.html` and `book.html` need a real Formspree endpoint. You
can use the **same form ID for both**, or create two separate Formspree
forms if you'd rather keep general inquiries and bookings in separate
inboxes/threads.

1. Create a free account at formspree.io and a new form.
2. Copy the endpoint (looks like `https://formspree.io/f/abcdwxyz`).
3. In **`contact.html`**, replace `YOUR_FORM_ID`:
   ```html
   <form id="contactForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
4. In **`book.html`**, replace `YOUR_FORM_ID` the same way:
   ```html
   <form id="bookingForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
Until each is connected, that specific form will show a clear message
instead of silently failing.

**What arrives in your email from a booking:** name, email, phone,
preferred date/time, notes, and three summary fields — the exact list of
selected services, total estimated duration, and total estimated price —
so you have everything needed to confirm without back-and-forth.

---

## 🚀 Deploying (GitHub → Cloudflare Pages, from mobile)

1. Delete the old files in your repo (or overwrite each by uploading the
   same filename again).
2. Upload **all 14 files above directly into the repo root** — no folders.
3. Commit → Cloudflare Pages redeploys automatically.
4. Give it a minute, reload https://chops-barbers.pages.dev/

---

## 📝 Still-open items (unchanged from before)

- **Opening hours** — not in the original brief, left out rather than guessed.
- **Mangaf location** — the About copy mentions a second location, but
  only the Al Bidaa address was provided, so only Al Bidaa appears
  anywhere. Send the address if it's real and I'll add it properly.
- Treatment pricing ("Scalp Care", "Beard Care") — no exact KD given, so
  marked "Ask in-store" rather than invented.
