# Network Tracker

Real-time network device and application usage monitor for UniFi networks. Tracks all connected devices, identifies applications via DNS inspection, and provides a modern web dashboard.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## Features

- **Device Tracking** — Auto-discovers all devices on your UniFi network with real-time online/offline status
- **Application Detection** — Identifies 60+ applications (YouTube, Netflix, Spotify, WhatsApp, etc.) via DNS query analysis
- **DNS Proxy with DoH** — Transparent DNS proxy using DNS-over-HTTPS for upstream resolution, bypassing gateway DNS interception
- **Per-Device App History** — See which apps each device is using with timeline charts and domain breakdowns
- **Dashboard** — Live overview with traffic charts, top devices, top applications, and device categories
- **Session Tracking** — Connection session history with bandwidth usage per device
- **Brand Icons** — Recognizable SVG icons for all major applications
- **Dark Mode** — Full dark/light theme support
- **Multi-VLAN Support** — Works across all VLANs by integrating with the UniFi gateway's DNS forwarding

## Architecture

```
┌─────────────┐    DNS (port 53)     ┌──────────────┐    DoH (HTTPS)     ┌─────────────┐
│   Devices    │ ──────────────────>  │  DNS Proxy   │ ────────────────>  │  Cloudflare  │
│  (phones,    │                      │  (Backend)   │                    │   1.1.1.1    │
│   laptops,   │    ┌─────────┐       │              │                    └─────────────┘
│   IoT)       │───>│ UDM Pro │──────>│  App ID +    │
└─────────────┘    └─────────┘       │  Traffic Log │
                                      └──────┬───────┘
                                             │
                                      ┌──────▼───────┐     ┌─────────────┐
                                      │  PostgreSQL  │     │  Next.js    │
                                      │  Database    │◄────│  Frontend   │
                                      └──────────────┘     └─────────────┘
```

## Quick Start

### Option 1: Setup Wizard (.exe)

1. Download `NetworkTracker.exe` from [Releases](../../releases)
2. Place it in the project root directory
3. Run it — fill in your UniFi credentials and database settings
4. Click **Launch Tracker**

### Option 2: Docker Compose

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/network-tracker.git
cd network-tracker

# Configure environment
cp .env.example .env
# Edit .env with your UniFi credentials

# Launch
docker-compose up -d
```

### Option 3: Manual Setup

#### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 16+

#### Backend

```bash
cd backend
pip install -r requirements.txt
pip install dnslib

# Create .env file (see .env.example)
cp ../.env.example .env

# Run (as Administrator for DNS proxy on port 53)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

Open http://localhost:3000 and log in with the admin credentials you set up.

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UNIFI_HOST` | UniFi controller IP/hostname | `192.168.1.1` |
| `UNIFI_USERNAME` | UniFi admin username | `admin` |
| `UNIFI_PASSWORD` | UniFi admin password | — |
| `UNIFI_SITE` | UniFi site name | `default` |
| `DATABASE_URL` | PostgreSQL async connection string | — |
| `JWT_SECRET` | Secret key for JWT tokens | — |
| `POLL_INTERVAL_SECONDS` | Device polling interval | `30` |

### DNS Proxy Setup

For full application detection across all devices:

1. The backend runs a DNS proxy on port 53 (requires admin/root privileges)
2. Configure your UniFi DHCP to advertise the tracking server's IP as the primary DNS
3. Set the UDM Pro's WAN DNS to point to the tracking server
4. The proxy uses DNS-over-HTTPS (Cloudflare) for upstream resolution, bypassing port 53 interception

### Detected Applications

The tracker identifies 60+ applications including:

| Category | Applications |
|----------|-------------|
| Streaming | YouTube, Netflix, Disney+, Twitch, Plex, Hulu, Prime Video |
| Social | Facebook, Instagram, X/Twitter, TikTok, Reddit, LinkedIn, Snapchat |
| Messaging | WhatsApp, Telegram, Discord, Signal |
| Conferencing | Zoom, Microsoft Teams, Skype |
| Music | Spotify, Apple Music, SoundCloud |
| Productivity | Google, Microsoft 365, Outlook, OneDrive |
| Gaming | Steam, Epic Games, PlayStation, Xbox |
| Smart Home | Google Nest, Amazon Alexa, Nanoleaf, Philips Hue |
| Developer | GitHub, Docker, npm, PyPI |
| Cloud | AWS, Azure, Cloudflare, Ubiquiti |

Add custom mappings in `backend/app/utils/domain_mappings.py`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check with DNS proxy stats |
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/{id}/applications` | Apps used by a device |
| GET | `/api/applications` | All detected applications |
| GET | `/api/applications/{id}/history` | App usage history |
| GET | `/api/dashboard/overview` | Dashboard summary |
| POST | `/api/dashboard/force-dns-renewal` | Force all clients to renew DNS |

## Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy (async), dnslib, httpx
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Chart.js, SWR
- **Database**: PostgreSQL 16 with asyncpg
- **DNS**: Custom UDP proxy with DNS-over-HTTPS upstream
- **Auth**: JWT with refresh tokens

## Building the Setup Wizard

```bash
pip install pyinstaller
python -m PyInstaller --onefile --windowed --name "NetworkTracker" \
  --hidden-import httpx --hidden-import psycopg2 setup.py
```

## License

MIT
