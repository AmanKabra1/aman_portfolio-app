# Deployment Guide

## Production Checklist

- [ ] Update JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Use strong PostgreSQL password
- [ ] Enable HTTPS
- [ ] Configure correct FRONTEND_URL
- [ ] Enable database backups
- [ ] Setup error monitoring (Sentry, New Relic)
- [ ] Review security headers
- [ ] Setup logging
- [ ] Configure rate limiting

## Render.com Deployment

### 1. Prepare GitHub

```bash
git remote add origin https://github.com/yourusername/portfolio-backend.git
git push -u origin main
```

### 2. Create Render Account & Project

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. New → Web Service
4. Connect GitHub repo

### 3. Configure Build & Start

- **Build Command:** `npm install && npm run db:migrate && npm run db:seed`
- **Start Command:** `npm start`

### 4. Add Environment Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-production-secret-key-here
FRONTEND_URL=https://your-portfolio.com
NODE_ENV=production
PORT=10000
```

### 5. Add PostgreSQL Plugin

- Database → PostgreSQL
- Copy connection string to DATABASE_URL

### 6. Deploy

Push to GitHub or click Deploy on Render

Your API will be available at: `https://your-app-name.onrender.com`

---

## Railway.app Deployment

### 1. Prepare GitHub

Same as Render

### 2. Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo

### 3. Add PostgreSQL

- Plugins → PostgreSQL
- Auto-configured DATABASE_URL

### 4. Add Environment Variables

- JWT_SECRET
- FRONTEND_URL
- NODE_ENV=production

### 5. Configure Start Command

```
npm start
```

### 6. Deploy

Auto-deploys on GitHub push

---

## VPS Deployment (Ubuntu 22.04)

### 1. Initial Server Setup

```bash
# Connect to server
ssh root@your_server_ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - 
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Setup Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'strong_password';
ALTER ROLE portfolio_user SET client_encoding TO 'utf8';
ALTER ROLE portfolio_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE portfolio_user SET default_transaction_deferrable TO on;
ALTER ROLE portfolio_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
\q
```

### 3. Clone & Setup Application

```bash
# Create app directory
mkdir -p /var/www/portfolio-backend
cd /var/www/portfolio-backend

# Clone repo
git clone https://github.com/yourusername/portfolio-backend.git .

# Install dependencies
npm install

# Create .env file
nano .env
```

**Production .env:**
```
PORT=3000
DATABASE_URL="postgresql://portfolio_user:strong_password@localhost:5432/portfolio_db"
JWT_SECRET="generate-strong-random-key-here"
FRONTEND_URL=https://your-portfolio.com
NODE_ENV=production
```

### 4. Run Database Migrations

```bash
npm run db:migrate
npm run db:seed
```

### 5. Setup PM2

```bash
# Start app with PM2
pm2 start src/server.js --name "portfolio-api" --env production

# Save PM2 configuration
pm2 save

# Restart on server reboot
pm2 startup
```

Run the command output by `pm2 startup` to enable auto-start.

### 6. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/portfolio-api
```

**Nginx Config:**
```nginx
upstream portfolio_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name api.your-portfolio.com;

    location / {
        proxy_pass http://portfolio_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/portfolio-api /etc/nginx/sites-enabled/

# Test Nginx
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.your-portfolio.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 8. Monitor Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs portfolio-api

# Monitor in real-time
pm2 monit
```

---

## Environment Variables Reference

| Variable | Development | Production |
|----------|-------------|-----------|
| `NODE_ENV` | development | production |
| `PORT` | 5000 | 3000 or 80 |
| `JWT_SECRET` | simple-key | 32+ char random key |
| `FRONTEND_URL` | http://localhost:4200 | https://yourdomain.com |

---

## Security Best Practices

1. **Use HTTPS** - Always use SSL/TLS in production
2. **Strong Secrets** - Use 32+ character random strings for JWT_SECRET
3. **Database** - Use strong passwords and restricted access
4. **CORS** - Only allow your frontend domain
5. **Rate Limiting** - Consider adding rate limiting middleware
6. **Logging** - Log errors but not sensitive data
7. **Updates** - Keep dependencies updated
8. **Backups** - Regular database backups
9. **Monitoring** - Setup error tracking (Sentry)
10. **Access** - Restrict SSH access, use SSH keys only

---

## Performance Optimization

```bash
# Enable caching headers in Nginx
add_header Cache-Control "public, max-age=3600";

# Gzip compression
gzip on;
gzip_types text/plain application/json;

# Connection pooling
# Already configured in Prisma
```

---

## Monitoring & Logging

### PM2 Logs
```bash
pm2 logs portfolio-api --lines 100
pm2 flush  # Clear logs
```

### System Logs
```bash
# Nginx
tail -f /var/log/nginx/error.log

# Postgres
sudo tail -f /var/log/postgresql/postgresql.log
```

---

## Troubleshooting Deployment

**App won't start:**
```bash
pm2 logs portfolio-api
```

**Database connection error:**
- Verify DATABASE_URL
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify user permissions

**CORS errors:**
- Check FRONTEND_URL matches your frontend domain
- Verify no trailing slashes

**Port already in use:**
```bash
lsof -i :3000
kill -9 <PID>
```

---

## Rollback Deployment

```bash
# Revert to previous version
git revert HEAD
git push

# Redeploy
pm2 restart portfolio-api
```

---

## Database Backup & Restore

### Backup
```bash
sudo pg_dump -U portfolio_user -d portfolio_db > backup.sql

# Upload to safe location
```

### Restore
```bash
sudo psql -U portfolio_user -d portfolio_db < backup.sql
```

---

**Your backend is production-ready! 🚀**
