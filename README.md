# 🌾 AGRANEX AI — Enterprise Smart Farming Platform

> **AI-Powered Digital Twin, Satellite Intelligence, Disease Detection, Yield Prediction & Marketplace**

![License](https://img.shields.io/badge/License-MIT-emerald)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Status](https://img.shields.io/badge/Status-Production_Ready-green)

## 🚀 Overview

AGRANEX AI is an enterprise-scale AgriTech SaaS platform that creates a **living digital twin** of every farm. It combines 3D visualization, satellite intelligence, AI-powered disease detection, ML yield prediction, a multilingual voice assistant (Nova), and a crop marketplace — all in a premium glassmorphism UI.

---

## ✨ Key Features

| Module | Description |
|--------|-------------|
| 🏡 **3D Digital Twin** | Interactive WebGL farm visualization with animated crops, drones, tractors, day/night cycle |
| 🛰️ **Satellite Intelligence** | NDVI, moisture, temperature heatmaps with historical comparison |
| 🔬 **AI Disease Detection** | Image upload → CNN diagnosis with treatment recommendations |
| 📊 **AI Yield Prediction** | Multi-factor ML model (XGBoost/RF) with revenue forecasting |
| 🤖 **Nova Voice AI** | Multilingual assistant (English, Tamil, Hindi) with STT/TTS |
| 🛒 **Marketplace** | Direct farmer-to-buyer e-commerce with AI price trends |
| 🌤️ **Weather Intelligence** | Forecasts, irrigation recommendations, flood/drought alerts |
| 🏛️ **Government Schemes** | AI-matched eligibility finder with application tracking |
| 🛡️ **Admin Portal** | User management, analytics, security audit logs |

---

## 🏗️ Technology Stack

### Frontend
- React 19 + TypeScript + Vite
- Tailwind CSS (Glassmorphism Dark Theme)
- Three.js / React Three Fiber (3D Digital Twin)
- Framer Motion (Animations)
- Recharts (Data Visualization)
- Zustand (State Management)
- Web Speech API (Voice AI)

### Backend
- Node.js + Express + TypeScript
- Socket.IO (Real-time Events)
- JWT Authentication
- REST API Architecture

### Database
- Supabase PostgreSQL
- 20+ Normalized Tables
- Row Level Security (RLS)
- Stored Procedures & Triggers

### DevOps
- Docker + Docker Compose
- Nginx Reverse Proxy

---

## 📁 Project Structure

```
AGRANEX/
├── frontend/               # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/     # Layout, 3D, UI components
│   │   ├── pages/          # All page views (11 pages)
│   │   ├── store/          # Zustand global state
│   │   ├── services/       # API client layer
│   │   ├── types/          # TypeScript definitions
│   │   ├── utils/          # Mock data & helpers
│   │   ├── App.tsx         # Router & layout
│   │   └── main.tsx        # Entry point
│   └── package.json
├── backend/                # Express REST API server
│   ├── src/
│   │   └── server.ts       # All API routes & Socket.IO
│   └── package.json
├── database/               # Supabase PostgreSQL
│   ├── schema.sql          # Enterprise schema with RLS
│   └── seed.sql            # Demo dataset
├── docker/                 # Container config
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   ├── docker-compose.yml
│   └── nginx.conf
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/agranex-ai.git
cd agranex-ai
```

### 2. Install & Run Backend
```bash
cd backend
npm install
npm run dev
```
Backend starts at `http://localhost:5000`

### 3. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend starts at `http://localhost:3000`

### 4. (Optional) Docker Deployment
```bash
cd docker
docker-compose up --build
```

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Farmer | farmer.rajesh@agranex.ai | demo123 |
| Buyer | buyer.ananya@agranex.ai | demo123 |
| Agronomist | dr.swaminathan@agranex.ai | demo123 |
| Admin | admin@agranex.ai | demo123 |

> **Note**: The platform works fully offline with built-in mock data. No external API keys required for demonstration.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User authentication |
| GET | `/api/v1/farms/plots` | Get farm plot data for 3D twin |
| POST | `/api/v1/ai/disease-detection` | AI crop disease analysis |
| POST | `/api/v1/ai/yield-prediction` | ML yield prediction |
| POST | `/api/v1/ai/nova-query` | Nova multilingual AI chat |
| GET | `/api/v1/marketplace/listings` | Browse marketplace |
| POST | `/api/v1/marketplace/listings/create` | Create new listing |
| GET | `/api/v1/notifications` | Get user notifications |
| GET | `/api/v1/schemes` | Government schemes |
| GET | `/api/v1/admin/audit-logs` | Admin audit trail |

---

## 🎨 Design Philosophy

The interface combines the elegance of **Apple**, the futuristic feel of **Tesla**, and the AI-first experience of **NVIDIA**:

- ✦ Premium dark glassmorphism theme
- ✦ Smooth Framer Motion animations
- ✦ Enterprise-grade data visualizations
- ✦ Interactive 3D WebGL digital twin
- ✦ Responsive design (mobile → desktop)
- ✦ Multilingual support (EN / தமிழ் / हिंदी)

---

## 📄 License

MIT License © 2026 AGRANEX AI

---

<p align="center">
  <strong>🌾 AGRANEX AI — Transforming Agriculture with Intelligence</strong><br/>
  Built with ❤️ for the future of farming
</p>
