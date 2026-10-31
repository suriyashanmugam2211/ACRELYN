# ACRELYN — Land Marketplace Web Application

> "Discover Land. Build Your Future."

ACRELYN is a structured, production-ready land marketplace web application designed for Greater Chennai and Tamil Nadu growth corridors. It combines spatial OpenStreetMap exploration, calculated ₹/sq.ft price metrics, property comparison, customer enquiry workflows, and an authenticated administrative suite.

---

## 1. Key Features

* **300-Record Land Inventory**: Integrated initial catalog containing 10 publicly advertised listings and 290 synthetic demonstration records.
* **Strict Demonstration Disclosure**: Synthetic benchmark records are unmistakably identified with `DEMO RECORD` badges to prevent misrepresentation.
* **Smart Land Explorer (`/explore`)**: Side-by-side desktop map and listing layout with interactive Leaflet markers, synced marker/card hover states, price labels, and mobile view toggle.
* **Advanced Multi-Parametric Filters**: Filter by budget (INR), plot area (sq.ft / Grounds / Cents), facing orientation, Chennai locality, and catalog classification. Shareable via URL search parameters.
* **Detailed Property Pages (`/property/:id`)**: Comprehensive plot specifications, Chennai land units conversion, approximate coordinate indicators, source listing links, and image gallery.
* **Persisted Enquiry System**: Direct customer enquiry form with field validations. Stores submissions to Supabase PostgreSQL (or local storage repository if offline).
* **Saved Properties (`/saved`)**: Anonymous visitor bookmarking persisted in browser LocalStorage.
* **Side-by-Side Comparison (`/compare`)**: Compare up to 4 plots with automatic highlighting of the lowest price, largest plot extent, and lowest ₹/sq.ft rate.
* **Administrative Operations Suite (`/admin/*`)**:
  * `/admin/dashboard`: Live KPI metrics computed from actual stored records.
  * `/admin/properties`: Full CRUD table, filters, deletion confirmation, and preview.
  * `/admin/properties/new` & `/admin/properties/:id/edit`: Multi-image management, auto-calculated rates, and live preview.
  * `/admin/enquiries`: Pipeline status management (`New`, `Contacted`, `In Progress`, `Resolved`, `Closed`) with private administrative notes.
  * `/admin/analytics`: Quantitative distributions of inventory by locality, price bracket, and facing direction.
  * `/admin/settings`: Supabase database credentials manager, live connection testing, dataset restoration, and schema migration viewer.

---

## 2. Technology Stack

* **Frontend Framework**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS v4, Lucide React icons
* **Routing**: React Router v7 (`react-router-dom`)
* **Mapping**: Leaflet 1.9, OpenStreetMap tiles
* **Database & Auth Integration**: Supabase (`@supabase/supabase-js`) with Row Level Security (RLS) policies and PostgreSQL schemas

---

## 3. Getting Started & Local Development

### Prerequisites
* Node.js $\ge$ 18.x
* npm $\ge$ 9.x

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd acrelyn

# Install dependencies
npm install

# Run development server
npm run dev
```
The application will start at `http://localhost:3000`.

---

## 4. Environment Variables

Create a `.env` file in the project root:

```env
# Optional: Supabase configuration (Local repository is active by default)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

*Note: If Supabase credentials are not provided, the application runs seamlessly using its built-in reactive storage repository, caching all 300 records and enquiry submissions locally.*

---

## 5. Supabase Database Setup & Migrations

To link ACRELYN with a live Supabase PostgreSQL project:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Open `/supabase/migrations/01_initial_schema.sql` from this repository (or copy it from `/admin/settings` in the app).
4. Run the SQL script. This provisions:
   * `public.properties` with constraints and auto-computed `price_per_sqft_inr`
   * `public.enquiries` with foreign keys and status constraints
   * `public.admin_users` table
   * Row Level Security (RLS) policies ensuring public read of properties, public insertion of enquiries, and admin-only management.
   * `property-images` storage bucket.
5. In your Supabase Dashboard, retrieve your **Project URL** and **anon public key** from `Settings -> API` and paste them into `.env` or the `/admin/settings` page in the app.

---

## 6. Admin Authentication & Evaluation Credentials

For local testing and evaluation without external credentials, an administrative session is pre-configured:

* **Admin Portal**: `/admin/login`
* **Email**: `admin@acrelyn.com`
* **Password**: `acrelyn2026`

When Supabase Authentication is linked, admin users can sign in using their Supabase `auth.users` credentials.

---

## 7. Production Build & Deployment

```bash
# Verify TypeScript types and build bundle
npm run build

# Preview production build locally
npm run preview
```

### Vercel Deployment
1. Import the repository into Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Project Settings if Supabase is used.
6. Deploy.

---

## 8. Known Limitations & Disclaimers

1. **Approximate Geographic Centers**: For publicly advertised listings where legal cadastral surveys are not public, map markers designate approximate locality centers rather than exact legal boundary lines.
2. **Title Due Diligence**: Advertised rates and DTCP/RERA approvals must be independently verified by certified legal counsel with local registration departments.
