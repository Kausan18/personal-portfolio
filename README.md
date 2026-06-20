# Kaustubh Shandilya — Portfolio

A full-stack personal portfolio website built with Next.js 14, featuring a password-protected admin panel for content management and Supabase as the backend.

**Live site**: https://personal-portfolio-kausty.vercel.app/

---

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database + Storage**: Supabase (PostgreSQL + Storage)
- **Deployment**: Vercel

---

## Features

**Public site**
- Single-page scrollable layout — Hero, Skills, Projects, Contact
- Scroll-triggered fade-in animations
- Individual project detail pages (`/projects/[id]`)
- Resume download

**Admin panel** (`/admin`)
- Password-protected — no accounts, just a single env-based password
- Manage projects — add, edit, delete, upload images
- Manage skills — add/remove skills per category, add/delete categories
- Edit contact info and hero bio
- Upload/replace resume PDF

---

## Project Structure

```
├── components/
│   ├── Hero.tsx
│   ├── Navbar.tsx
│   ├── Projects.tsx
│   ├── Skills.tsx
│   └── Contact.tsx
├── lib/
│   ├── data.ts          # Supabase read/write helpers
│   └── supabase.ts      # Supabase client
├── src/app/
│   ├── page.tsx         # Main single-page layout
│   ├── admin/
│   │   └── page.tsx     # Admin panel
│   ├── api/
│   │   ├── contact/
│   │   ├── hero/
│   │   ├── projects/
│   │   ├── resume/
│   │   ├── skills/
│   │   └── upload-image/
│   └── projects/[id]/
│       └── page.tsx     # Project detail page
```

---

## Local Development

### 1. Clone the repo

```bash
git clone https://github.com/Kausan18/portfolio.git
cd portfolio
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com) and run the following SQL in the Supabase SQL editor to set up the schema:

```sql
-- Hero bio
create table hero (
  id integer primary key,
  description text
);
insert into hero (id, description) values (1, 'Your bio here.');

-- Contact info
create table contact (
  id integer primary key,
  linkedin text,
  github text,
  phone text,
  email text
);
insert into contact (id, linkedin, github, phone, email)
values (1, '', '', '', '');

-- Skill categories
create table skill_categories (
  id text primary key,
  label text not null,
  icon text,
  skills text[],
  sort_order integer
);

-- Projects
create table projects (
  id text primary key,
  title text not null,
  subtitle text,
  description text,
  tags text[],
  live_url text,
  github_url text,
  featured boolean default false,
  images text[],
  created_at timestamp with time zone default now()
);
```

Then in Supabase:
- Go to **Authentication → Policies** and disable RLS on all four tables
- Go to **Storage → New bucket** → name: `project-images` → toggle **Public: ON**
- Disable RLS on the storage bucket as well

### 3. Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_PASSWORD=your-secret-password
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the site and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

---

## Deployment

This project is deployed on Vercel.

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add the three environment variables from `.env.local` in the Vercel project settings
4. Deploy — Vercel auto-detects Next.js, no build config needed

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `ADMIN_PASSWORD` | Password to access `/admin` |

---

## Admin Panel

Navigate to `/admin` on the deployed site. Enter your `ADMIN_PASSWORD` to log in. The panel has three tabs:

- **Projects** — add/edit/delete projects, upload images per project
- **Skills** — manage skill categories and individual skills
- **Contact & Bio** — update hero description, contact links, and resume PDF

No database access is needed for day-to-day content updates — everything is manageable through the admin UI.
