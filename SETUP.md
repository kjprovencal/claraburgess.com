# 🚀 Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

## 🎯 One-Command Setup (Recommended)

### On macOS/Linux:
```bash
./start-dev.sh
```

### On Windows:
```cmd
start-dev.bat
```

## 🔧 Manual Setup

### 1. Start Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
Backend will run on: http://localhost:3001

### 2. Start Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on: http://localhost:3000

## 🌐 What You'll See

- **Homepage**: Beautiful landing page with countdown timer
- **Registry**: Interactive baby registry with categories and priorities
- **Photos**: Photo gallery with categories and modal views
- **API**: Backend endpoints for managing data

## 📱 Features

✅ **Responsive Design** - Works on all devices  
✅ **Real-time Updates** - Backend API integration  
✅ **Beautiful UI** - Modern, clean design  
✅ **Category Filtering** - Easy navigation  
✅ **Purchase Tracking** - Mark items as purchased  
✅ **Photo Gallery** - Share pregnancy journey  

## 🔍 Testing the API

Test the backend health endpoint:
```bash
curl http://localhost:3001/health
```

## 🎨 Customization

- **Update Due Date**: Edit `frontend/src/app/page.tsx`
- **Add Registry Items**: Edit `backend/src/registry/registry.service.ts`
- **Add Photos**: Edit `backend/src/photos/photos.service.ts`
- **Styling**: Modify Tailwind classes in component files

## 🚨 Troubleshooting

**Port 3000/3001 already in use?**
```bash
# Find and kill processes
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Dependencies not installing?**
```bash
# Clear npm cache
npm cache clean --force
# Try again
npm install
```

**Backend not starting?**
- Check if Node.js version is 18+
- Ensure all dependencies are installed
- Check console for error messages

## 📞 Need Help?

Check the main README.md for detailed documentation and API reference.

---

**Happy coding! 🎉**
Your daughter Clara will love this website! 💕
