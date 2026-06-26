# PocketCart 🛒✨

Welcome to PocketCart, a browser extension + MERN dashboard that helps you save products from anywhere on the internet into one cute, searchable wishlist.

No more scattered wishlists, random screenshots, endless tabs, or "wait, where did I see that?" moments. Just click the extension, log in, save the product, and find it later in your PocketCart dashboard — from any device.

**Live dashboard:** [pocketcart-beta.vercel.app](https://pocketcart-beta.vercel.app/)

## 🌐 What It Does

PocketCart lets you save products while browsing online, tied to your own account.

The extension captures:
- product/page title
- URL
- website source
- product image
- notes
- collection

Then the dashboard lets you:
- log in / sign up
- search saved products
- filter by collection or source
- edit product details
- delete products
- open the original product page

Since products are scoped to your account, saving something on one device and checking the dashboard from another shows the same saved list — no shared or anonymous data.

## 🧃 Why I Built This

I wanted to build something more useful than a basic todo app while learning the MERN stack.

PocketCart helped me understand how a real full-stack project works, including authentication and deployment:

```
Chrome Extension -> Express API (JWT-protected) -> MongoDB -> React Dashboard
```

## 💻 Tech Stack

- React + Vite
- Node.js + Express
- MongoDB Atlas + Mongoose
- JWT authentication + bcrypt password hashing
- Chrome Extension Manifest V3
- CSS

## 🚀 Deployment

- **Backend** — Render (Express API)
- **Database** — MongoDB Atlas
- **Dashboard** — Vercel
- **Extension** — loads locally via Chrome's "Load unpacked" (Chrome Web Store listing planned)

## 📁 Project Structure

```
pocketcart/
  client/      React dashboard
  server/      Express backend
  extension/   Chrome extension
```

## ✨ Current Features

- Email/password authentication with JWT, scoped per user
- One-click product saving through the extension, logged in independently from the dashboard
- Auto image capture using page metadata
- Search and filters
- Edit/delete saved products
- Duplicate URL prevention (per user)
- Retro pixel-inspired dashboard UI
- Fully deployed — usable from any browser, not just localhost

## 🛠️ Future Plans

- Publish the extension to the Chrome Web Store
- Product comparison
- Better price extraction
- Cleaner extension popup
- Rate limiting & additional input validation on the API
