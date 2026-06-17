<div align="center">

# 🏥 ClinicOS — Smart Clinic Management System

**A modern, full-stack clinic management platform built for healthcare professionals in Nepal.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Deployment (Vercel)](#-deployment-vercel)
- [Default Login Credentials](#-default-login-credentials)
- [License](#-license)

---

## 🌟 Overview

**ClinicOS** is a comprehensive clinic management system designed to streamline day-to-day operations of a modern healthcare facility. It provides role-based access for Admins, Doctors, and Receptionists to manage patients, appointments, billing, medical records, inventory, and ward beds — all from a single, intuitive dashboard.

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Authentication** | Secure login with role-based access control (Admin, Doctor, Receptionist, Patient) |
| 👥 **Patient Management** | Add, view, and manage patient records with full medical history |
| 📅 **Appointments** | Book, confirm, cancel, and track appointments with doctors |
| 🩺 **Doctor Management** | Manage doctor profiles, specializations, schedules, and fees |
| 📋 **Medical Records** | Record diagnoses, prescriptions, lab results, and follow-up dates |
| 💊 **Prescriptions** | Link prescriptions directly to medical records |
| 💳 **Billing & Invoices** | Generate invoices with tax calculation and payment tracking |
| 🏥 **Ward & Bed Management** | Monitor ward occupancy and assign patients to beds |
| 📦 **Inventory** | Track medicines and medical supplies with reorder alerts |
| ⚙️ **Clinic Settings** | Update clinic name, contact info, and other configurations |
| 📊 **Dashboard Analytics** | Visual overview of key metrics with charts |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2 | React framework with App Router & Server Components |
| **React** | 19 | UI library |
| **TypeScript** | 5 | Type-safe development |
| **Tailwind CSS** | 4 | Utility-first CSS framework |
| **shadcn/ui** | 4.10 | Accessible, pre-built UI components |
| **Radix UI** | 1.5 | Headless UI primitives |
| **Recharts** | 3.8 | Charting & data visualization |
| **React Hook Form** | 7.77 | Performant form management |
| **Zod** | 4.4 | Schema validation |
| **Lucide React** | 1.17 | Icon library |
| **Zustand** | 5.0 | Global state management |
| **date-fns** | 4.4 | Date utility library |
| **Sonner** | 2.0 | Toast notifications |

### Backend & Database
| Technology | Version | Purpose |
|---|---|---|
| **Next.js API Routes** | 16.2 | RESTful API endpoints |
| **NextAuth.js** | 5.0 (beta) | Authentication & session management |
| **Prisma ORM** | 7.8 | Type-safe database client & schema management |
| **PostgreSQL** | 18 | Primary relational database |
| **bcryptjs** | 3.0 | Password hashing |

### DevOps & Tooling
| Technology | Purpose |
|---|---|
| **Vercel** | Hosting & deployment |
| **ESLint** | Code linting |
| **ts-node** | TypeScript execution for seeding |
| **dotenv** | Environment variable management |

---

## 📁 Project Structure

```
smart-clinic/
├── prisma/
│   ├── schema.prisma        # Database schema (models & relations)
│   └── seed.ts              # Database seeding script
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/          # Auth pages (login)
│   │   ├── api/             # REST API routes
│   │   │   ├── appointments/
│   │   │   ├── billing/
│   │   │   ├── doctors/
│   │   │   ├── patients/
│   │   │   ├── medical-records/
│   │   │   ├── inventory/
│   │   │   ├── wards/
│   │   │   └── settings/
│   │   ├── dashboard/       # Protected dashboard pages
│   │   │   ├── appointments/
│   │   │   ├── billing/
│   │   │   ├── doctors/
│   │   │   ├── inventory/
│   │   │   ├── medical-records/
│   │   │   ├── patients/
│   │   │   ├── settings/
│   │   │   └── wards/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── shared/          # Reusable shared components
│   │   └── ui/              # shadcn/ui base components
│   └── lib/
│       ├── prisma.ts        # Prisma client instance
│       └── utils.ts         # Utility functions
├── .env.local               # Local environment variables (do NOT commit)
├── next.config.ts           # Next.js configuration
├── prisma.config.ts         # Prisma configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- ✅ **Node.js** v18 or higher — [Download](https://nodejs.org/)
- ✅ **npm** v9 or higher (comes with Node.js)
- ✅ **PostgreSQL** v14 or higher — [Download](https://www.postgresql.org/download/)
- ✅ **Git** — [Download](https://git-scm.com/)

### Installation

**Step 1: Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/smart-clinic.git
cd smart-clinic
```

**Step 2: Install dependencies**
```bash
npm install
```

**Step 3: Set up environment variables**

Create a `.env.local` file in the root of the project:
```bash
cp .env.example .env.local
```
Then fill in your values (see [Environment Variables](#-environment-variables) section below).

**Step 4: Set up the database**
```bash
# Push the Prisma schema to your PostgreSQL database
npx prisma db push

# Seed the database with sample data
npm run seed
```

**Step 5: Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🎉

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# ─── Database ───────────────────────────────────────────────────
# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/smart_clinic"

# ─── NextAuth.js ────────────────────────────────────────────────
# A random secret string (generate one at: https://generate-secret.vercel.app/32)
NEXTAUTH_SECRET="your-super-secret-key-here"

# The base URL of your application
# Local development:
NEXTAUTH_URL="http://localhost:3000"
# Production (Vercel):
# NEXTAUTH_URL="https://your-app-name.vercel.app"
```

> ⚠️ **Never commit `.env.local` to Git!** It is already added to `.gitignore`.

---

## 🗄️ Database Setup

This project uses **Prisma ORM** with **PostgreSQL**.

### Local Setup

1. Create a PostgreSQL database named `smart_clinic`
2. Update the `DATABASE_URL` in your `.env.local`
3. Run migrations:
   ```bash
   npx prisma db push
   ```
4. Seed sample data:
   ```bash
   npm run seed
   ```
5. (Optional) Open Prisma Studio to browse your database visually:
   ```bash
   npx prisma studio
   ```

### Production Setup (Neon / Supabase)

For production, use a cloud PostgreSQL provider:
- **[Neon](https://neon.tech)** *(recommended for Vercel)* — Free tier available
- **[Supabase](https://supabase.com)** — Free tier available

---

## ☁️ Deployment (Vercel)

### Step 1: Push code to GitHub
```bash
git init                          # (skip if already initialized)
git add .
git commit -m "🚀 Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smart-clinic.git
git push -u origin main
```

### Step 2: Create a cloud PostgreSQL database
1. Go to **[neon.tech](https://neon.tech)** → Create free account
2. Create a new project → Copy the **Connection String**

### Step 3: Deploy on Vercel
1. Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub
2. Click **"Add New Project"** → Import your `smart-clinic` repository
3. In the **"Environment Variables"** section, add:
   - `DATABASE_URL` → Your Neon connection string
   - `NEXTAUTH_SECRET` → A random secret (generate at [generate-secret.vercel.app](https://generate-secret.vercel.app/32))
   - `NEXTAUTH_URL` → `https://your-app-name.vercel.app`
4. Click **"Deploy"** 🚀

### Step 4: Initialize the production database
After deployment, run in your local terminal:
```bash
# Push schema to production database
DATABASE_URL="your-neon-connection-string" npx prisma db push

# Seed production database with sample data
DATABASE_URL="your-neon-connection-string" npm run seed
```

---

## 👤 Default Login Credentials

After seeding the database, use these credentials to log in:

| Role | Email | Password |
|---|---|---|
| 👑 **Admin** | `admin@clinic.com` | `Admin@123` |
| 🩺 **Doctor** | `ramesh@clinic.com` | `Doctor@123` |
| 🩺 **Doctor** | `sunita@clinic.com` | `Doctor@123` |
| 🩺 **Doctor** | `bikash@clinic.com` | `Doctor@123` |
| 🧑‍⚕️ **Patient** | `aarav@patient.com` | `Patient@123` |

> ⚠️ **Change these default passwords immediately in a production environment!**

---

## 📜 License

This project is for educational and academic purposes.

---

<div align="center">

Made with ❤️ in Nepal 🇳🇵

</div>
