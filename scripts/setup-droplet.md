# DigitalOcean Droplet Setup Guide for Trestle Sync

This guide will help you set up a DigitalOcean droplet to sync properties from Trestle API to PostgreSQL.

## Architecture

```
┌──────────────────────────────────────────┐
│  DigitalOcean Droplet ($6/month)         │
│  - Ubuntu 22.04 LTS                      │
│  - Node.js 20                            │
│  - Cron job (runs daily at 2 AM)        │
│  - Static IP (whitelist with Trestle)   │
└──────────────────────────────────────────┘
                    ↓
         Fetches properties from
┌──────────────────────────────────────────┐
│  Trestle API (CoreLogic)                 │
│  - Only accessible from whitelisted IP   │
└──────────────────────────────────────────┘
                    ↓
         Saves properties to
┌──────────────────────────────────────────┐
│  DigitalOcean Managed PostgreSQL         │
│  - Basic plan ($15/month)                │
│  - Accessible from anywhere              │
└──────────────────────────────────────────┘
                    ↑
         Next.js app reads from
┌──────────────────────────────────────────┐
│  Your Next.js App (Vercel/anywhere)      │
│  - NO direct Trestle API calls           │
│  - Reads from PostgreSQL only            │
└──────────────────────────────────────────┘
```

## Step 1: Create DigitalOcean Droplet

### 1.1 Create Droplet
1. Go to: https://cloud.digitalocean.com/droplets/new
2. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($6/month) - 1GB RAM, 25GB SSD
   - **Datacenter**: San Francisco 3 (SFO3) - close to Trestle servers
   - **Authentication**: SSH Key (generate if you don't have one)
   - **Hostname**: `trestle-sync-server`

3. Click **Create Droplet**

### 1.2 Note the IP Address
After creation, note the droplet's **public IP address** (e.g., `143.198.123.45`)

**IMPORTANT**: Give this IP to your client to whitelist with Trestle API!

## Step 2: Initial Server Setup

### 2.1 SSH into Droplet
```bash
ssh root@YOUR_DROPLET_IP
```

### 2.2 Update System
```bash
apt update && apt upgrade -y
```

### 2.3 Install Node.js 20
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 2.4 Install PM2 (optional, for monitoring)
```bash
npm install -g pm2
```

## Step 3: Setup Sync Script

### 3.1 Create Directory
```bash
mkdir -p /opt/trestle-sync
cd /opt/trestle-sync
```

### 3.2 Initialize Node Project
```bash
npm init -y
npm install pg axios dotenv
```

### 3.3 Upload Sync Script
Copy the `trestle-sync-cron.js` file to the droplet:

**From your local machine:**
```bash
scp scripts/trestle-sync-cron.js root@YOUR_DROPLET_IP:/opt/trestle-sync/sync.js
```

**Or manually create it:**
```bash
nano /opt/trestle-sync/sync.js
# Paste the contents of trestle-sync-cron.js
# Save with Ctrl+X, then Y, then Enter
```

### 3.4 Make Script Executable
```bash
chmod +x /opt/trestle-sync/sync.js
```

### 3.5 Create .env File
```bash
nano /opt/trestle-sync/.env
```

Add your credentials:
```env
# Trestle API
TRESTLE_API_ID=<your-trestle-client-id>
TRESTLE_API_PASSWORD=<your-trestle-client-secret>
TRESTLE_BASE_URL=https://api-trestle.corelogic.com/trestle/odata
TRESTLE_OAUTH_URL=https://api-trestle.corelogic.com/trestle/oidc/connect/token

# DigitalOcean PostgreSQL
DATABASE_URL=postgresql://doadmin:PASSWORD@HOST:25060/defaultdb?sslmode=require
```

**Replace** `PASSWORD` and `HOST` with your DigitalOcean PostgreSQL credentials.

Save with `Ctrl+X`, `Y`, `Enter`.

## Step 4: Test the Sync Script

### 4.1 Run Manually First
```bash
cd /opt/trestle-sync
node sync.js
```

**Expected output:**
```
========================================
🚀 Trestle Property Sync Started
========================================
Time: 2025-12-23T...
✅ Properties table ensured
🔑 Requesting OAuth2 token from Trestle...
✅ OAuth2 token obtained
📥 Fetching properties from Trestle API...
   Filter: StandardStatus eq 'Active' and PropertyType ne 'Land'
   Limit: 1000
📊 Fetched 847 properties from Trestle
💾 Saving properties to database...
   Progress: 100/847
   Progress: 200/847
   ...
✅ Transaction committed

========================================
✅ Sync Completed Successfully
========================================
📊 Summary:
   - Properties fetched: 847
   - New properties: 847
   - Updated properties: 0
   - Errors: 0
   - Duration: 45.32s
   - Time: 2025-12-23T...
========================================
```

### 4.2 Verify Data in Database
Connect to your PostgreSQL and check:
```bash
psql "DATABASE_URL"
SELECT COUNT(*) FROM properties;
SELECT city, COUNT(*) FROM properties GROUP BY city ORDER BY COUNT(*) DESC LIMIT 10;
```

## Step 5: Setup Cron Job

### 5.1 Create Cron File
```bash
nano /etc/cron.d/trestle-sync
```

Add this content:
```cron
# Trestle Property Sync - Runs daily at 2 AM
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Run sync at 2 AM every day
0 2 * * * root cd /opt/trestle-sync && /usr/bin/node sync.js >> /var/log/trestle-sync.log 2>&1

# Also run every 6 hours for fresh data (optional)
# 0 */6 * * * root cd /opt/trestle-sync && /usr/bin/node sync.js >> /var/log/trestle-sync.log 2>&1
```

Save with `Ctrl+X`, `Y`, `Enter`.

### 5.2 Set Correct Permissions
```bash
chmod 644 /etc/cron.d/trestle-sync
```

### 5.3 Restart Cron
```bash
systemctl restart cron
```

### 5.4 Verify Cron is Running
```bash
systemctl status cron
```

## Step 6: Setup Log Rotation

### 6.1 Create Logrotate Config
```bash
nano /etc/logrotate.d/trestle-sync
```

Add:
```
/var/log/trestle-sync.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
```

Save and exit.

## Step 7: Monitoring

### 7.1 View Real-time Logs
```bash
tail -f /var/log/trestle-sync.log
```

### 7.2 View Last Sync
```bash
tail -100 /var/log/trestle-sync.log
```

### 7.3 Check Cron Execution
```bash
grep trestle-sync /var/log/syslog
```

### 7.4 Setup Email Alerts (Optional)
```bash
apt install -y mailutils postfix

# Edit cron to add email
nano /etc/cron.d/trestle-sync
```

Add at the top:
```cron
MAILTO=your-email@example.com
```

## Step 8: Security Hardening

### 8.1 Setup Firewall
```bash
# Allow SSH
ufw allow 22/tcp

# Enable firewall
ufw --force enable

# Check status
ufw status
```

### 8.2 Disable Root Login
```bash
# Create a non-root user
adduser syncuser
usermod -aG sudo syncuser

# Disable root SSH login
nano /etc/ssh/sshd_config
# Change: PermitRootLogin no
systemctl restart sshd
```

## Step 9: Final Checklist

- [ ] Droplet created with static IP
- [ ] Node.js installed (v20+)
- [ ] Sync script uploaded and tested
- [ ] .env file configured with credentials
- [ ] Manual sync test successful
- [ ] Cron job configured (runs daily at 2 AM)
- [ ] Log rotation configured
- [ ] **Droplet IP whitelisted with Trestle API** ⚠️ CRITICAL!
- [ ] Database contains properties
- [ ] Next.js app updated to read from PostgreSQL

## Troubleshooting

### Cron Not Running
```bash
# Check cron service
systemctl status cron

# Check cron logs
grep CRON /var/log/syslog

# Test cron file syntax
crontab /etc/cron.d/trestle-sync -T
```

### Trestle API Connection Error
```bash
# Test API from droplet
curl -v https://api-trestle.corelogic.com

# Check if IP is whitelisted
node sync.js
# If you see "401 Unauthorized", IP is not whitelisted!
```

### Database Connection Error
```bash
# Test PostgreSQL connection
psql "DATABASE_URL"

# Check if droplet can reach database
telnet YOUR_DB_HOST 25060
```

### Out of Memory
```bash
# Check memory usage
free -m

# Add swap (for 1GB droplet)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## Maintenance

### Update Node.js Packages
```bash
cd /opt/trestle-sync
npm update
```

### Manual Sync Trigger
```bash
cd /opt/trestle-sync
node sync.js
```

### Check Database Size
```bash
psql "DATABASE_URL" -c "SELECT pg_size_pretty(pg_database_size('defaultdb'));"
```

## Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| DigitalOcean Droplet (1GB) | $6 |
| DigitalOcean Managed PostgreSQL (1GB) | $15 |
| **Total** | **$21/month** |

Plus Trestle API costs (based on usage).

## Next Steps

After setup is complete:
1. Update Next.js app to read from PostgreSQL
2. Remove direct Trestle API calls from app
3. Test the entire flow
4. Deploy to production
5. Monitor logs for first few days

---

**Need help?** Create an issue or contact support.
