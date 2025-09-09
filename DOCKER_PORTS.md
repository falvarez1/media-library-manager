# Docker and Development Port Configuration

This document explains the port configuration for running both Docker and local development environments simultaneously.

## Port Assignments

### Local Development (npm run dev)
- **Frontend**: `http://localhost:3015` - Next.js development server
- **Backend API**: Not required for local dev (uses mock API)

### Docker Environment
- **Frontend**: `http://localhost:3016` - Next.js in Docker container
- **Backend API**: `http://localhost:5005` - .NET Core API
- **MinIO Console**: `http://localhost:9001` - Object storage web UI
- **MinIO API**: `http://localhost:9000` - Object storage API
- **PostgreSQL**: `localhost:5432` - Database

## Running Both Environments

You can now run both environments simultaneously without port conflicts:

### 1. Start Local Development
```bash
npm run dev
# Access at http://localhost:3015
```

### 2. Start Docker Environment
```bash
# Option 1: Use the .env.docker file
cp .env.docker .env
docker-compose up

# Option 2: Set port directly
FRONTEND_PORT=3016 docker-compose up

# Option 3: Use default (3016)
docker-compose up
```

## Customizing Ports

### Change Docker Frontend Port
Edit `.env` file or set environment variable:
```bash
FRONTEND_PORT=3017 docker-compose up
```

### Change Local Development Port
The local dev server automatically finds an available port starting from 3015.
To force a specific port, edit `scripts/dev-server.js`:
```javascript
const START_PORT = 3018; // Change this line
```

## Environment Variables

### Docker Configuration (.env or .env.docker)
```env
# Frontend port for Docker container
FRONTEND_PORT=3016

# Other services remain on standard ports
POSTGRES_DB=medialib
POSTGRES_USER=mediauser
POSTGRES_PASSWORD=mediapass
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123
```

## Accessing Services

### When Running Locally (npm run dev)
- Frontend: `http://localhost:3015`
- Uses mock API (no backend required)

### When Running Docker
- Frontend: `http://localhost:3016`
- Backend API: `http://localhost:5005/swagger`
- MinIO Console: `http://localhost:9001`
  - Username: `admin`
  - Password: `password123`
- PostgreSQL: `localhost:5432`
  - Database: `medialib`
  - Username: `mediauser`
  - Password: `mediapass`

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:

1. **For local dev**: The script automatically finds the next available port
2. **For Docker**: Change the `FRONTEND_PORT` environment variable
3. **Check running processes**:
   ```bash
   # Windows
   netstat -ano | findstr :3015
   netstat -ano | findstr :3016
   
   # Linux/Mac
   lsof -i :3015
   lsof -i :3016
   ```

### CORS Issues
The backend is configured to accept requests from both ports:
- `http://localhost:3015` (local dev)
- `http://localhost:3016` (Docker default)

If you change the Docker frontend port, update the CORS configuration in `docker-compose.yml`:
```yaml
Cors__Origins__1: "http://localhost:YOUR_PORT"
```

## Quick Commands

### Development Workflow
```bash
# Terminal 1: Local development
npm run dev

# Terminal 2: Docker services
docker-compose up -d

# Stop Docker services
docker-compose down

# View Docker logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Reset Docker Environment
```bash
# Stop and remove all containers, volumes
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build
```

## Summary

- **Local Dev**: Port 3015 (auto-increments if busy)
- **Docker Frontend**: Port 3016 (configurable via FRONTEND_PORT)
- **No conflicts**: Both can run simultaneously
- **Easy switching**: Access both versions in different browser tabs