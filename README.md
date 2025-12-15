# 🚀 NASA NEXUS Air Quality Dashboard

A modern, full-stack web application for visualizing and analyzing air quality data, built with Next.js, TypeScript, and a Python backend. Developed for the NASA Space Apps Challenge.

---

## 🌟 Features

- **Interactive Dashboard:** Real-time air quality maps, charts, and health recommendations.
- **Data Sources:** Integrates NASA and open AQI datasets.
- **Forecasting:** Machine learning-powered air quality predictions.
- **Responsive UI:** Built with Tailwind CSS and React components.
- **Team & About Pages:** Learn about the mission and contributors.
- **API Service:** FastAPI backend for data aggregation and ML inference.

---

## 🖥️ Tech Stack

| Frontend                | Backend         | ML/Database      | DevOps/Other      |
|-------------------------|----------------|------------------|-------------------|
| Next.js (App Router)    | FastAPI        | Python           | Vercel/Netlify    |
| TypeScript              | Uvicorn        | PostgreSQL/SQLite| GitHub Actions    |
| React + Zustand         | SQLAlchemy     | scikit-learn     | Prettier, ESLint  |
| Tailwind CSS            |                |                  |                   |

---

## 📦 Project Structure

```
backend/      # FastAPI backend, ML, and database scripts
frontend/     # Next.js 15 app (TypeScript, Tailwind, Zustand)
models/       # ML model outputs and summaries
frontend2/    # (Legacy/experimental) HTML+JS prototype
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/utkarshchauhan26/nasa-space-challenge.git
cd nasa-space-challenge
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 3. Frontend Setup

```bash
cd frontend
pnpm install         # or npm install
pnpm dev             # or npm run dev
```

---

## 🌍 Live Demo

> _Add your deployed link here (Vercel/Netlify)_

---

## 👥 Team

- Utkarsh Chauhan
- [Add your teammates here]

---

## 📊 Screenshots

| Dashboard | Map View | Health Tips |
|-----------|----------|-------------|
| ![Dashboard](frontend/public/screenshot-dashboard.png) | ![Map](frontend/public/screenshot-map.png) | ![Health](frontend/public/screenshot-health.png) |

---

## 🤖 API Endpoints

- `/api/air-quality` — Get latest AQI data
- `/api/forecast` — ML-based predictions
- `/api/alerts` — Health and safety alerts

---

## 🧑‍💻 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License © 2025 NASA NEXUS Team

---

> _“Coding is logic dressed as art. Make it elegant, or make it again.” — Professor Aion_
