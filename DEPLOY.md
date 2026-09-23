## Deployment Guide

### Deploy trên Server Linux (Ubuntu/Debian)

#### 1. Build Frontend (SPA static export)

```bash
cd apps/web

# Option A: Next.js Server mode (recommended — supports API routes)
npm run build
npm start -p 3000

# Option B: Static export (cho pure nginx serving)
# Thêm vào next.config.ts: output: 'export'
npm run build
# Output: apps/web/out/
```

#### 2. Setup FastAPI với systemd

```bash
# Tạo virtualenv
cd /var/www/pose-booth/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Tạo systemd service
sudo nano /etc/systemd/system/pose-booth-api.service
```

```ini
[Unit]
Description=Pose Booth AI — FastAPI Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/pose-booth/api
Environment="PATH=/var/www/pose-booth/api/.venv/bin"
ExecStart=/var/www/pose-booth/api/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable pose-booth-api
sudo systemctl start pose-booth-api
sudo systemctl status pose-booth-api
```

#### 3. Install & Config Nginx

```bash
sudo apt install nginx
sudo cp nginx/pose-booth.conf /etc/nginx/sites-available/pose-booth
sudo ln -s /etc/nginx/sites-available/pose-booth /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

#### 4. HTTPS với Let's Encrypt (tuỳ chọn)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
# Auto-renew via cron đã tự setup
```

### SPA Routing (nginx `try_files`)

File [`nginx/pose-booth.conf`](nginx/pose-booth.conf) đã cấu hình SPA fallback:
- `location /` → `try_files $uri $uri/ /index.html`
- Tất cả routes (`/booth`, `/pose-studio`, `/about`, `/gallery`) đều được Next.js xử lý client-side
- `/api/*` → proxy đến FastAPI port 8000

### Mở Rộng Sub-apps (ví dụ /gallery)

```nginx
# Thêm vào nginx/pose-booth.conf
location /gallery/ {
    alias /var/www/pose-booth/gallery/;
    try_files $uri $uri/ /gallery/index.html;
}
```

### Chạy Local (Dev)

```powershell
# Terminal 1: Frontend
cd apps/web
npm run dev          # → localhost:3000

# Terminal 2: Backend (sau khi setup venv)  
cd apps/api
.\.venv\Scripts\Activate.ps1
python main.py       # → localhost:8000
# API Docs: http://localhost:8000/docs
```

### PM2 (alternative cho systemd)

```bash
npm install -g pm2

# Start Next.js
pm2 start npm --name "pose-booth-web" -- start -- -p 3000

# Start FastAPI
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name "pose-booth-api"

pm2 save
pm2 startup  # Auto-start on reboot
```
