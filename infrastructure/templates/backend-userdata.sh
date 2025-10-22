#!/bin/bash
# backend-userdata.sh
# User data script to set up the backend application on EC2

set -e

# Update system
yum update -y

# Install Docker
amazon-linux-extras install docker -y
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
yum install -y git

# Create application directory
mkdir -p /opt/hotel-management
cd /opt/hotel-management

# Create docker-compose.yml for the backend
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  backend:
    image: node:18-alpine
    container_name: hotel-backend
    working_dir: /app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
      - DB_HOST=${db_host}
      - DB_PORT=${db_port}
      - DB_NAME=${db_name}
      - DB_USER=${db_user}
      - DB_PASSWORD=${db_password}
      - JWT_SECRET=campus-project-jwt-secret-${random()}
      - JWT_EXP=7d
      - CLIENT_ORIGIN=*
    volumes:
      - ./backend:/app
    command: sh -c "npm install && npm run build && npm start"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

# Create a simple health check endpoint script
mkdir -p backend/src
cat > backend/package.json << 'EOF'
{
  "name": "hotel-backend-campus",
  "version": "1.0.0",
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  }
}
EOF

cat > backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

cat > backend/src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.get('/api/hello', (req, res) => {
  res.json({ 
    message: 'Hotel Management System API - Campus Project',
    version: '1.0.0',
    database: process.env.DB_HOST ? 'connected' : 'not configured'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Hotel Management Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DB_HOST || 'Not configured'}`);
});
EOF

# Start the application
docker-compose up -d

# Create a simple startup script
cat > /etc/systemd/system/hotel-backend.service << 'EOF'
[Unit]
Description=Hotel Management Backend
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/hotel-management
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl enable hotel-backend.service
systemctl start hotel-backend.service

# Create a simple status script
cat > /usr/local/bin/hotel-status << 'EOF'
#!/bin/bash
echo "=== Hotel Management System Status ==="
echo "Backend Service: $(systemctl is-active hotel-backend.service)"
echo "Docker Status: $(systemctl is-active docker)"
echo ""
echo "=== Container Status ==="
docker-compose -f /opt/hotel-management/docker-compose.yml ps
echo ""
echo "=== Application Health ==="
curl -f http://localhost:3000/health 2>/dev/null || echo "Health check failed"
echo ""
echo "=== Recent Logs ==="
docker-compose -f /opt/hotel-management/docker-compose.yml logs --tail=10
EOF

chmod +x /usr/local/bin/hotel-status

echo "✅ Hotel Management Backend setup completed!"
echo "🌐 Backend will be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):3000"
echo "🔍 Check status with: sudo hotel-status"