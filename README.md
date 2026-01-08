# Food Ordering App - Frontend

A modern, fast, and responsive React frontend for the Food Ordering Application, built with Vite and Tailwind-style Vanilla CSS.

## Tech Stack
- **React (Vite)**: Core framework.
- **Socket.io-client**: Real-time order updates and notifications.
- **Axios**: API communication with the backend.
- **Context API**: Global state management for Authentication and Sockets.
- **Vanilla CSS**: Custom styling with utility-first approach.

## Core Features
1. **User Dashboard**: Browse restaurants, view menus, and place orders.
2. **Restaurant Dashboard**: Manage dishes, view orders, and update status.
3. **Rider Dashboard**: View and accept available orders, track delivery progress.
4. **Real-time Notifications**: Live alerts for order confirmations and status changes.
5. **Persistent Cart**: Local storage based cart management.

## Local Setup

### 1. Prerequisites
- Node.js installed.
- Backend service running locally or accessible.

### 2. Environment Variables
Create a `.env` file in the root of the `frontend` folder:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Installation
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

## Deployment to Vercel

1. **Framework Preset**: `Vite`
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**:
   - `VITE_API_BASE_URL`: Your Render backend URL (e.g., `https://your-app.onrender.com`).

---
Created by Antigravity 🚀