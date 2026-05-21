# MeNem CRM — Full-Stack Customer Management System

A complete **Customer Relationship Management (CRM)** application built with the **MERN stack** (MongoDB, Express.js, React, Node.js). It allows an admin to manage their customer database with full CRUD operations, real-time search with autocomplete, smart filtering, sorting, pagination, PDF export, URL-based routing, and a beautiful fully responsive UI.

This README is a **complete implementation guide**. Read it top to bottom and you'll understand exactly how every part of the app works, how to run it locally, how to deploy it, and how to extend it with your own features.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features Implemented](#2-features-implemented)
3. [Tech Stack](#3-tech-stack)
4. [Architecture Diagram](#4-architecture-diagram)
5. [Complete Folder Structure](#5-complete-folder-structure)
6. [URL Routes](#6-url-routes)
7. [Prerequisites](#7-prerequisites)
8. [Step-by-Step Setup](#8-step-by-step-setup)
9. [Environment Variables](#9-environment-variables)
10. [Running the App Locally](#10-running-the-app-locally)
11. [How the Backend Works](#11-how-the-backend-works)
12. [How the Frontend Works](#12-how-the-frontend-works)
13. [Component Breakdown](#13-component-breakdown)
14. [API Endpoints Reference](#14-api-endpoints-reference)
15. [Customer Data Model](#15-customer-data-model)
16. [Request Flow Examples](#16-request-flow-examples)
17. [Common Tasks](#17-common-tasks--how-to-change-things)
18. [Mobile Responsiveness](#18-mobile-responsiveness)
19. [Deployment Guide](#19-deployment-guide)
20. [Troubleshooting](#20-troubleshooting)
21. [Assignment Checklist](#21-assignment-checklist)
22. [Author](#22-author)

---

## 1. Project Overview

### What is this project?

**MeNem CRM** is a single-page web application that helps a business admin keep track of all their customers in one place. Think of it like a digital address book on steroids — every customer has a profile with their company, email, phone, role, tier (Platinum/Gold/Silver/Standard), and a timeline of recent activities.

### Who is it for?

- **Admin users** who need to manage many customer records
- **Sales teams** wanting a quick dashboard view
- **Founders / Small businesses** needing a lightweight CRM without paying for Salesforce

### What problem does it solve?

Most CRMs are expensive or bloated. This one is:
- ✅ **Lightweight** — loads in under a second
- ✅ **Self-hosted** — your data stays in your own MongoDB cluster
- ✅ **Customizable** — open-source code, change anything
- ✅ **Modern UI** — built with React 19, Tailwind CSS v4, and the Outfit Google Font

---

## 2. Features Implemented

### ✅ Core CRUD Features

- **Create Customer** — Form to register a new customer with validation
- **Read All Customers** — Paginated table view with search, filter, sort
- **Read Single Customer** — Dedicated profile page with activity timeline
- **Update Customer** — Edit form with all fields editable
- **Delete Customer** — Confirmation prompt + soft delete

### 🚀 Additional Features (Beyond Requirements)

#### Dashboard Page
- Welcome banner with active/total counts
- **4 Clickable Stat Cards** — Total / Active / Inactive / Premium customers (click to filter the customer list)
- Tier Distribution bars (animated, percentage-based)
- Recent Activity Feed (live updates across all customers)

#### Customers Page
- **Live Search** with autocomplete suggestions (top 5 matches in a dropdown)
- **Status Filter** (All / Active / Inactive)
- **Tier Filter** badge (clearable, appears when filter is active)
- **Sort** — Newest / Alphabetical / Company
- **Pagination** — 10 / 25 / 50 rows per page
- **Save as PDF** — Exports the full list to a downloadable PDF
- **Row click** — Opens the read-only customer profile
- **Edit icon** — Opens the edit form

#### URL-Based Routing (React Router)
- Each page has its own URL (`/`, `/customers`, `/settings`)
- Browser back / forward buttons work
- Shareable URLs (e.g. `/customers/abc123` opens that specific customer)
- Refresh keeps you on the same page

#### UI / UX
- **Outfit Google Font** — unique, modern, premium SaaS feel
- **Fully responsive** — mobile drawer sidebar, horizontal scroll tables, stacked grids on phones
- **Toast notifications** — slide in from the corner for every success/error
- **Loading states** — spinner during fetch, "Saving..." button state
- **Empty states** — friendly messages when no data
- **Activity logging** — auto-creates "Account Created" and "Profile Updated" timeline events
- **Live API health check** — Settings page pings the backend every load

---

## 3. Tech Stack

| Layer | Technology | Why I picked it |
|-------|------------|-----------------|
| Frontend Framework | **React 19** | Industry standard, hooks make state easy |
| Build Tool | **Vite** | 10x faster than CRA, instant HMR |
| Styling | **Tailwind CSS v4** | Utility-first, no separate CSS files |
| Routing | **React Router v6** | URL-based navigation, shareable links |
| HTTP Client | **Axios** | Cleaner syntax than `fetch`, automatic JSON parsing |
| Icons | **lucide-react** | Beautiful, lightweight, tree-shakeable |
| PDF Export | **jsPDF + jspdf-autotable** | Pure JS, no server needed |
| Font | **Outfit (Google Fonts)** | Unique, modern, premium look |
| Backend Framework | **Node.js + Express.js v5** | Most popular Node framework |
| Database | **MongoDB Atlas** | Free tier, flexible schema fits a CRM |
| ODM | **Mongoose** | Schema validation, hooks, indexes |
| Dev Tools | **Nodemon** | Auto-restarts backend on file changes |

---

## 4. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER'S BROWSER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │   React App (Vite, localhost:5173)                  │    │
│  │   ┌───────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │   │  Sidebar  │  │    Header    │  │   Toast     │  │    │
│  │   └───────────┘  └──────────────┘  └─────────────┘  │    │
│  │   ┌─────────────────────────────────────────────┐   │    │
│  │   │  React Router → Dashboard / Customers /     │   │    │
│  │   │  Settings / Customer Form (create/edit/view)│   │    │
│  │   └─────────────────────────────────────────────┘   │    │
│  └───────────────────────┬─────────────────────────────┘    │
└──────────────────────────┼──────────────────────────────────┘
                           │ Axios HTTP (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPRESS BACKEND (localhost:5000)                │
│  ┌───────────┐  ┌─────────────┐  ┌──────────────────────┐   │
│  │  Routes   │→ │ Controllers │→ │   Mongoose Model     │   │
│  └───────────┘  └─────────────┘  └──────────┬───────────┘   │
│       /api/customers   createCustomer()     │               │
│       /api/health      getStats()           │               │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                              ▼
                              ┌──────────────────────────┐
                              │  MongoDB Atlas Cluster   │
                              │  (cloud database)        │
                              └──────────────────────────┘
```

---

## 5. Complete Folder Structure

```
Task/
│
├── backend/                          ← Express + MongoDB API server
│   ├── config/
│   │   └── db.js                    ← Connects to MongoDB Atlas using MONGO_URI
│   ├── controllers/
│   │   └── customerController.js    ← All the actual logic for each route
│   ├── middleware/
│   │   └── errorHandler.js          ← Catches errors & sends clean JSON responses
│   ├── models/
│   │   └── Customer.js              ← Mongoose schema (defines customer shape)
│   ├── routes/
│   │   └── customerRoutes.js        ← Maps URLs → controller functions
│   ├── .env                          ← Your MongoDB URI + PORT (YOU create this)
│   ├── package.json
│   └── server.js                     ← App entry: starts Express, applies middleware
│
├── frontend/                         ← React + Vite single-page app
│   ├── public/                       ← Static files served as-is
│   ├── src/
│   │   ├── api/
│   │   │   └── customerApi.js       ← Axios wrapper: one function per backend endpoint
│   │   ├── components/               ← Reusable UI pieces
│   │   │   ├── Sidebar.jsx          ← Left nav + mobile drawer
│   │   │   ├── Header.jsx           ← Top bar (search, notifications, profile)
│   │   │   ├── StatsCards.jsx       ← 3 summary cards above the customer table
│   │   │   ├── CustomerTable.jsx    ← Main customer list with filters/sort/paging
│   │   │   └── CustomerForm.jsx     ← Create/Edit/View modes (one component, 3 modes)
│   │   ├── pages/                    ← Full pages (one per sidebar tab)
│   │   │   ├── Dashboard.jsx        ← Welcome banner + stat cards + tier bars + activity feed
│   │   │   └── Settings.jsx         ← Admin info + system status + tech stack
│   │   ├── constants/
│   │   │   └── user.js              ← Admin profile info (used in Header & Settings)
│   │   ├── App.jsx                   ← Root: holds state, defines all routes
│   │   ├── main.jsx                  ← React entry: wraps App in BrowserRouter
│   │   └── index.css                 ← Tailwind import + global font + custom animations
│   ├── .env                          ← VITE_API_URL (YOU create this)
│   ├── index.html                    ← HTML shell, sets favicon + title + Google Font
│   ├── vercel.json                   ← SPA rewrite rule for Vercel deployment
│   ├── package.json
│   └── vite.config.js                ← Vite + Tailwind plugin config
│
└── README.md                         ← You're reading it!
```

### Why this folder structure?

- **`backend/` + `frontend/`** separated → can be deployed independently
- **Backend MVC** (routes → controllers → models) → easy to find code
- **Frontend components vs pages** → components are reusable building blocks; pages are full screens
- **`api/` folder** → all HTTP calls live in one file; backend URL only appears once
- **`constants/` folder** → reusable static values in one place, not scattered

---

## 6. URL Routes

The app uses **React Router** for clean, shareable URLs:

| URL | Page | What you see |
|-----|------|--------------|
| `/` | Dashboard | Welcome banner, stat cards, tier breakdown, activity feed |
| `/customers` | Customer Directory | The main table with filters, sort, search, pagination |
| `/customers/new` | Add Customer | Empty form to register a new customer |
| `/customers/:id` | View Profile | Read-only customer details + activity timeline |
| `/customers/:id/edit` | Edit Customer | Pre-filled form with all fields editable + delete button |
| `/settings` | Settings | Admin info, live API status, tech stack |
| anything else | — | Redirects to `/` |

**Browser back/forward buttons work naturally. Refreshing any URL keeps you there.**

---

## 7. Prerequisites

| Tool | Why You Need It | How to Check |
|------|-----------------|--------------|
| **Node.js v18+** | Runs both backend and Vite dev server | Run `node -v` |
| **npm** (comes with Node) | Installs packages | Run `npm -v` |
| **MongoDB Atlas account** | Free cloud database | Sign up at [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| **Code editor** | VS Code recommended | [code.visualstudio.com](https://code.visualstudio.com) |
| **Git** (optional) | For pushing to GitHub | Run `git --version` |

---

## 8. Step-by-Step Setup

### Step 1 — Get the code

```bash
git clone <your-repo-url>
cd Task
```

### Step 2 — Set up MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign in
2. Click **Build a Database** → choose **M0 Free** tier
3. Pick a region, name your cluster, click **Create**
4. On the **Security Quickstart**:
   - Create a **Database User** (username + password — write these down)
   - **Network Access** → **Add IP** → pick **Allow Access From Anywhere** (`0.0.0.0/0`)
5. Once ready, click **Connect** → **Drivers** → copy the URI:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with yours. Add a DB name at the end (e.g. `/menem_crm`)

### Step 3 — Install backend dependencies

```bash
cd backend
npm install
```

### Step 4 — Create the backend `.env`

In the `backend/` folder, create `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<your-username>:<your-password>@cluster0.xxxxx.mongodb.net/menem_crm
NODE_ENV=development
```

### Step 5 — Install frontend dependencies

Open a **new terminal**:

```bash
cd frontend
npm install
```

### Step 6 — Create the frontend `.env`

In the `frontend/` folder, create `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 9. Environment Variables

### Backend (`backend/.env`)

| Variable | Required? | Default | Description |
|----------|-----------|---------|-------------|
| `PORT` | ❌ No | 5000 | Port Express listens on |
| `MONGO_URI` | ✅ Yes | — | MongoDB Atlas connection string |
| `NODE_ENV` | ❌ No | development | `development` or `production` |

### Frontend (`frontend/.env`)

| Variable | Required? | Default | Description |
|----------|-----------|---------|-------------|
| `VITE_API_URL` | ✅ Yes | `http://localhost:5000/api` | Backend API base URL |

> **Vite rule:** Env vars exposed to the browser MUST start with `VITE_`. Anything else is ignored.

---

## 10. Running the App Locally

You need **two terminals open** at the same time.

### Terminal 1 — Backend

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
Environment: development
MongoDB connected: cluster0-shard-00-02.xxxxx.mongodb.net
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v8.x.x  ready in 432 ms
➜  Local:   http://localhost:5173/
```

### Open the app

Visit **http://localhost:5173**. You'll see the empty Dashboard. Click **Add Customer** to create your first record.

---

## 11. How the Backend Works

### `server.js` — Entry point

1. Loads `.env` variables with `dotenv`
2. Calls `connectDB()` to connect to MongoDB
3. Creates an Express app
4. Applies middleware:
   - `cors()` — Allows the frontend to call this API
   - `express.json()` — Parses JSON request bodies
5. Mounts customer routes at `/api/customers`
6. Adds health-check endpoint at `/api/health`
7. Mounts the global error handler (must be LAST)
8. Starts listening on `PORT`

### `config/db.js` — Database connection

A simple function that uses Mongoose to connect to MongoDB Atlas. If connection fails, logs the error and exits.

### `models/Customer.js` — Data shape

Defines what a customer document looks like:
- Required: `name`, `email`
- Validation: email regex, name min 2 chars, CSAT between 1–5
- Enums: `status` (Active/Inactive), `tier` (Platinum/Gold/Silver/Standard)
- Sub-schema: `activities[]` for the timeline
- **Pre-save hook**: Auto-generates `avatarInitials` from name ("John Smith" → "JS")
- Indexes for fast searches and filtering

### `controllers/customerController.js` — The actual logic

| Function | What it does |
|----------|--------------|
| `createCustomer` | Saves a new customer + adds "Account Created" activity |
| `getAllCustomers` | Returns filtered/sorted/paginated list |
| `getSingleCustomer` | Returns one customer by `_id` |
| `updateCustomer` | Updates fields + adds "Profile Updated" activity |
| `deleteCustomer` | Removes a customer |
| `getStats` | Returns dashboard numbers |
| `addActivity` | Adds an entry to a customer's timeline |

Every function follows:
```js
try {
  // do work
  res.status(200).json({ success: true, data: ... });
} catch (err) {
  next(err); // pass to error handler
}
```

### `middleware/errorHandler.js` — Clean errors

Catches errors and returns clean JSON:
- Mongoose validation errors → 400
- Invalid ObjectId → 404
- Duplicate email → 400 "already exists"
- Anything else → 500 generic

---

## 12. How the Frontend Works

### `main.jsx` — React entry point

Wraps `<App />` in `<BrowserRouter>` so React Router can manage URLs, then renders into `<div id="root">`.

### `App.jsx` — The brain

Where ALL app state lives. It:
1. Fetches customer list on first load
2. Maintains state: `customers`, `searchQuery`, `loading`, `toast`, filter values
3. Reads the URL via `useLocation()` to determine active tab
4. Uses `useNavigate()` for all programmatic navigation
5. Defines `<Routes>` that map each URL to its page component
6. Renders Sidebar + Header + main content + Toast

### `api/customerApi.js` — HTTP layer

One axios instance with the base URL. Each function wraps one HTTP call:
```js
export const getAllCustomers = () => API.get('/customers');
export const createCustomer = (data) => API.post('/customers', data);
// ...
```

### `constants/user.js` — Admin info

One object exported — used by Header (profile dropdown) and Settings page.

---

## 13. Component Breakdown

### `Sidebar.jsx`
- Fixed left nav on desktop (240px wide)
- Slides in as a drawer on mobile
- 3 nav items: Dashboard / Customers / Settings + Add New Customer button
- Active state highlighted based on current URL
- Closes itself on mobile after tapping a nav item

### `Header.jsx`
- Sticky top bar
- Mobile hamburger button to open sidebar
- Search input with live autocomplete (top 5 matches)
- Bell icon → Notifications dropdown
- Help icon → Guidelines dropdown
- Profile avatar → Admin info dropdown
- Click-outside handler closes any open dropdown
- Search bar hides itself on non-customer pages

### `StatsCards.jsx`
- 3 metric cards (Total / Active / Inactive)
- Color-coded left border + matching icon background

### `CustomerTable.jsx`
- Status filter dropdown (controlled by parent)
- Tier filter pill (appears when a tier filter is active)
- Sort dropdown (Newest / Alphabetical / Company)
- Clickable rows → navigate to view profile
- Edit icon → navigate to edit form
- Delete icon → confirmation → delete
- Tier badges with distinct colors per tier
- Status badges (green Active / red Inactive)
- Pagination: rows per page + prev/next buttons
- Empty state when no matches

### `CustomerForm.jsx`
One component, **three modes**:
- **`mode='create'`** → blank form with "Add New Customer" header
- **`mode='edit'`** → pre-filled + delete button
- **`mode='view'`** → read-only details + activity timeline + back button

### `Dashboard.jsx`
- Welcome banner with gradient + decorative orbs
- 4 **clickable** stat cards (each filters customer list when clicked)
- Tier distribution with animated progress bars
- Recent activity feed (newest 6, scrollable)

### `Settings.jsx`
- Admin profile card (from `constants/user.js`)
- System status (live ping to `/api/health`)
- Project info (tech stack)

---

## 14. API Endpoints Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/health` | — | Returns `{ success: true, message: 'CRM API is running' }` |
| GET | `/customers` | — | List customers. Query params: `search`, `status`, `tier`, `sort`, `page`, `limit` |
| POST | `/customers` | Customer object | Create new customer |
| GET | `/customers/:id` | — | Get one customer by ID |
| PUT | `/customers/:id` | Customer object | Update customer |
| DELETE | `/customers/:id` | — | Delete customer |
| GET | `/customers/stats` | — | Dashboard stats (total, active, by tier, avg CSAT) |
| POST | `/customers/:id/activities` | `{type, title, description}` | Add activity to timeline |

### Example: Create a customer

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "company": "Acme Corp",
    "email": "john@acme.com",
    "phone": "+1234567890",
    "role": "CEO",
    "tier": "Gold",
    "status": "Active"
  }'
```

### Standard response shapes

Success:
```json
{
  "success": true,
  "data": { /* customer object or list */ },
  "message": "Optional message"
}
```

Failure:
```json
{
  "success": false,
  "message": "What went wrong"
}
```

---

## 15. Customer Data Model

Defined in `backend/models/Customer.js`:

```js
{
  name:           String (required, min 2 chars),
  company:        String,
  email:          String (required, unique, email format),
  phone:          String,
  status:         "Active" | "Inactive"  (default: "Active"),
  role:           String (default: "Manager"),
  tier:           "Platinum" | "Gold" | "Silver" | "Standard" (default: "Gold"),
  csat:           Number (1 to 5, default: 4.5),
  avatarInitials: String (auto-generated, e.g. "JS"),
  avatarUrl:      String,
  activities:     [Activity],
  createdAt:      Date (auto),
  updatedAt:      Date (auto)
}
```

Each **Activity**:
```js
{
  activityId:  String (auto, e.g. "ACT-1716234567890"),
  type:        "call" | "email" | "update" | "meeting" | "other",
  title:       String,
  time:        String (e.g. "May 21, 2026, 12:30 PM"),
  description: String
}
```

---

## 16. Request Flow Examples

### Flow 1: Create a customer

```
1. User navigates to /customers/new (via Add Customer button)
2. React Router renders <CustomerFormRoute mode="create" />
3. User fills the form, clicks Save
4. CustomerForm validates required fields locally
5. onSave callback → App.jsx handleSave(formData, undefined)
6. api.createCustomer(formData) → POST /api/customers
7. Express → customerRoutes.js matches POST /
8. Controller createCustomer() builds new Customer, adds activity
9. Mongoose pre('save') hook auto-generates avatarInitials
10. MongoDB stores the document
11. Response: { success: true, data: customer }
12. Back in App.jsx — notify success, fetchCustomers() refreshes list
13. navigate('/customers') sends user back to the list
14. Table re-renders with new row
```

### Flow 2: Click "Active Accounts" stat card

```
1. User clicks the Active Accounts card on Dashboard
2. Dashboard onStatClick({ status: 'Active', tier: 'All' })
3. App.jsx setTableStatusFilter('Active'), setTableTierFilter('All')
4. App.jsx navigate('/customers')
5. URL changes, CustomersListPage renders
6. CustomerTable receives statusFilter='Active' as prop
7. Status dropdown shows "Active", table shows only Active customers
```

### Flow 3: Search "Dige" → click suggestion

```
1. Header.jsx onChange sets searchQuery="Dige"
2. useMemo computes suggestions (up to 5 matches)
3. Suggestion dropdown appears
4. User clicks "Digeesh S"
5. onClick sets searchQuery="Digeesh S", calls onSuggestionSelect
6. onSuggestionSelect briefly disables main area clicks (prevents mobile tap-through)
7. App.jsx searchQuery state updates
8. CustomerTable filtered list now shows only Digeesh S
```

---

## 17. Common Tasks — How to Change Things

### Change admin info in the header
Edit `frontend/src/constants/user.js`:
```js
export const INITIAL_USER = {
  name: 'Your Name',
  title: 'Your Title',
  email: 'your@email.com',
};
```

### Change the API URL for production
Edit `frontend/.env`:
```env
VITE_API_URL=https://your-backend.vercel.app/api
```
Restart `npm run dev`.

### Add a new field (e.g. "linkedin")
1. **Backend** — `models/Customer.js` → add `linkedin: { type: String, default: '' }`
2. **Backend** — `controllers/customerController.js` → add `linkedin` to req.body destructuring (create + update)
3. **Frontend** — `components/CustomerForm.jsx` → add an input field
4. (Optional) `components/CustomerTable.jsx` → add a column

### Add a new tier (e.g. "Diamond")
1. **Backend** — `models/Customer.js` → add 'Diamond' to tier enum
2. **Frontend** — `CustomerForm.jsx` → add `<option value="Diamond">Diamond</option>`
3. **Frontend** — `CustomerTable.jsx` → add styling for Diamond in `tierClass()`
4. **Frontend** — `Dashboard.jsx` → add Diamond to tier arrays

### Add a new page
1. Create `frontend/src/pages/Reports.jsx`
2. Add a route in `App.jsx`:
   ```jsx
   <Route path="/reports" element={<Reports />} />
   ```
3. Add menu item in `Sidebar.jsx`:
   ```js
   { id: 'Reports', label: 'Reports', icon: BarChart }
   ```
4. Update `handleTabChange` in App.jsx to handle navigation

### Change the primary brand color
Search project for `#003d9b` and replace with your color.

### Change the font
Edit `frontend/index.html` (Google Fonts link) and `frontend/src/index.css` (font-family).

---

## 18. Mobile Responsiveness

Uses Tailwind's responsive utilities with breakpoints:
- **`sm:`** 640px+
- **`md:`** 768px+
- **`lg:`** 1024px+
- **`xl:`** 1280px+

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Sidebar | Fixed left (240px) | Slide-in drawer (hamburger to open) |
| Main content | `ml-[240px]` | `ml-0` |
| Header | Search + 3 icons | Hamburger + 1 icon |
| Customer Directory buttons | Right-aligned | Full-width stacked |
| Stat cards | 4 columns | 2 columns |
| Customer table | Wide table | Horizontal scroll |
| Customer form | 2-column grid | 1-column stacked |

---

## 19. Deployment Guide

### Deploy backend to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. From inside `backend/`: `vercel`
3. Follow the prompts (login, pick a project name)
4. In **vercel.com** → your project → **Settings → Environment Variables**:
   - Add `MONGO_URI` = your Atlas connection string
   - Add `NODE_ENV` = `production`
5. Redeploy: `vercel --prod`
6. Copy the URL (e.g. `https://menem-crm-api.vercel.app`)

### Deploy frontend to Vercel

1. From inside `frontend/`: `vercel`
2. Follow the prompts
3. In Vercel dashboard → **Settings → Environment Variables**:
   - Add `VITE_API_URL` = `https://menem-crm-api.vercel.app/api`
4. Redeploy: `vercel --prod`

> `vercel.json` already contains a rewrite rule so SPA routes (e.g. `/customers`) work after refresh.

### Important: Whitelist IPs in MongoDB Atlas

Vercel uses dynamic IPs. In **Atlas → Network Access**, add `0.0.0.0/0` to allow connections from anywhere (or your Vercel IP range).

---

## 20. Troubleshooting

| Problem | Why | Fix |
|---------|-----|-----|
| `MongoDB connection failed` | IP not whitelisted | Atlas → Network Access → Add `0.0.0.0/0` |
| `Cannot read properties of undefined (reading 'data')` | Backend isn't running | Start it: `cd backend && npm run dev` |
| `CORS error` in browser console | Frontend URL not allowed | Add your URL to `cors()` origins in `server.js` |
| "Email already exists" on save | Email is unique in schema | Use a different email or update existing record |
| Vite doesn't pick up `.env` changes | Vite reads env on start | Stop (`Ctrl+C`) and re-run `npm run dev` |
| `Port 5000 already in use` | Another process is using it | Change `PORT` in `backend/.env` to 5001 |
| 404 on refresh on Vercel | Missing SPA rewrite | `vercel.json` should already have it — make sure it's in `frontend/` |
| Refreshing `/customers` shows blank | No `vercel.json` or wrong rule | Confirm `vercel.json` exists with the `rewrites` block |

---

## 21. Assignment Checklist

### ✅ Core Features

- [x] Create Customer
- [x] Update Customer
- [x] Get Single Customer
- [x] Get All Customers (table view)
- [x] Delete Customer

### ✅ Technical Requirements

- [x] Frontend using React.js (React 19)
- [x] Backend using Node.js + Express.js
- [x] MongoDB integration (MongoDB Atlas + Mongoose)
- [x] REST API implementation
- [x] Proper folder structure (separated frontend/backend, MVC)
- [x] Clean code practices (commented, single responsibility)

### ✅ Additional Expectations

- [x] Proper validation (Mongoose schema + frontend required fields)
- [x] Error handling (global error middleware + try/catch)
- [x] Clean API response structure (`{ success, data, message }`)
- [x] Reusable components (CustomerForm handles 3 modes)
- [x] Loading states (spinner + Saving... button)
- [x] User feedback messages (toast notifications)

### ✅ Bonus Features (Beyond Requirements)

- [x] URL-based routing with React Router
- [x] Real-time search with autocomplete suggestions
- [x] Sort + filter + pagination
- [x] Clickable dashboard stat cards (filter the customer list)
- [x] Tier filter pill (clearable)
- [x] PDF export of customer list
- [x] Activity timeline per customer (auto-logged)
- [x] Mobile responsive (sidebar drawer, scroll tables)
- [x] Live API health check
- [x] Toast notifications
- [x] Custom Google Font (Outfit)
- [x] Animated transitions and hover effects

### 📋 Submission

- [ ] Push to public GitHub repository
- [ ] Deploy backend to Vercel
- [ ] Deploy frontend to Vercel
- [x] README with complete setup instructions

---

## 22. Author

Built by **Digeesh S** as a MERN Stack internship assignment for **MeNem Inc.**

### Connect

- **Email:** admin@menem.in
- **Live Demo:** *(add after deployment)*
- **GitHub:** *(add after pushing)*

---

