@echo off
echo Starting MongoDB if it is installed as a service...
net start MongoDB

echo Starting Noted. Go Backend Server...
start cmd /k "cd backend && go run main.go"

echo Starting Vite Frontend...
start cmd /k "cd frontend && npm run dev"

echo All services started!
