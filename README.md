# 🌱 Treense Admin Website

**Treense** is a falcata seedling health monitoring system that allows consumers to scan and classify seedlings as **healthy** or **unhealthy** using a mobile application. This repository contains the **admin web interface**, built to help administrators track, analyze, and manage classification data from users.

---

## 🌐 Website Features

- 📊 **Dashboard** – Get live updates from app users scanning seedlings in the field.
- 📂 **History** – Monitor all image classification results uploaded from the app.
- 📍 **Analytics** – View health classification trends and daily scanning stats.
- 👤 **Admin Profiles** – Secure login and editable admin profile pages.
- ☁️ **Hosted on Vercel** – Ready for fast, scalable deployment.

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite + TailwindCSS  
- **Backend:** Supabase (Database, Auth, Storage)  
- **Deployment:** Vercel (Planned)  

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shonwan/treensehub.git
   cd treensehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file at the root
   - Add the following:
     ```env
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🔐 Admin Authentication

Admin accounts are manually added in the Supabase `users` table. Only verified admins can log in and access the dashboard.

---

## 🧪 Pages Overview

| Page       | Description                                    |
|------------|------------------------------------------------|
| `/login`   | Secure admin login page                        |
| `/dashboard` | View today's scans, healthy/unhealthy counts |
| `/history` | All classification history with filters        |
| `/analytics` | Charts and trends for health classifications |
| `/profile` | Edit logged-in admin info                      |

---

## 🧠 About Treense

Treense is built to address:
- Misclassification of falcata seedlings by inexperienced consumers
- Time-consuming health checks in large nurseries
- Delays in identifying unhealthy seedlings

By using MobileNetV2 image classification and a mobile-first approach, Treense empowers users to make smarter decisions—backed by real-time insights and reliable data.

---

## 📦 Future Plans

- 🔔 Admin email notifications

---

## 📬 Contact

For feedback, issues, or collaboration inquiries, email me at **pabualan.shennah227@gmail.com**

---

Let me know if you want this in your actual code/project repo!
