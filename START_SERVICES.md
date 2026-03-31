# 🚀 Start Scripts for FeatheraFine

Convenient scripts to launch development services.

## macOS / Linux

### Start Backend & Frontend
```bash
./start.sh
```

Opens **2 new Terminal windows**:
- **Backend** - Express server on `http://localhost:5000`
- **Frontend** - Vite dev server on `http://localhost:5173`

### Start Prisma Studio (Optional)
```bash
./start-studio.sh
```

Opens a Terminal window for:
- **Prisma Studio** - Database GUI on `http://localhost:5555`

---

## Windows

### Start Backend & Frontend
Double-click `start.bat` or run:
```cmd
start.bat
```

Opens **2 new Command Prompt windows**:
- **Backend** - Express server on `http://localhost:5000`
- **Frontend** - Vite dev server on `http://localhost:5173`

### Start Prisma Studio (Optional)
Double-click `start-studio.bat` or run:
```cmd
start-studio.bat
```

Opens a Command Prompt window for:
- **Prisma Studio** - Database GUI on `http://localhost:5555`

---

## 📱 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | React application |
| **Backend API** | http://localhost:5000 | Express API endpoints |
| **Prisma Studio** | http://localhost:5555 | Database viewer & editor (optional) |

---

## Manual Start (Alternative)

### Terminal 1 - Backend
```bash
cd backend && npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend && npm run dev
```

### Terminal 3 - Prisma Studio (Optional)
```bash
cd backend && npx prisma studio
```

---

## 🛑 Stopping Services

### macOS / Linux
Close the Terminal windows or press `Ctrl+C` in each window.

### Windows
Close the Command Prompt windows or press `Ctrl+C`, then confirm.

---

## ⚠️ Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

**macOS/Linux:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Kill process on port 5555
lsof -ti:5555 | xargs kill -9
```

**Windows:**
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F

netstat -ano | findstr :5555
taskkill /PID <PID> /F
```

### Dependencies Not Installed
Make sure to install dependencies first:
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Database Connection Error
Ensure your `.env` file in `/backend` has:
```
DATABASE_URL=mysql://user:password@localhost:3306/featherafine
```

And MySQL server is running.

---

## 💡 Tips

- **Backend logs** appear in the Backend terminal - watch for API URL confirmations
- **Frontend logs** appear in the Frontend terminal - watch for Vite dev server confirmation
- **Prisma Studio** is optional and useful for inspecting/manually editing database records
- Start Prisma Studio only when you need to access the database GUI
- To restart a service, just close its window and re-run the appropriate script
