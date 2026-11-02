# Deploying to the live server

The live server is an AWS EC2 Ubuntu machine.
- **nginx** serves the built React app and forwards `/api` to the Node API.
- **pm2 or systemd** keeps the Node API running.
- The site is served over HTTPS on its domain.

This guide brings the server up to date with the login, roles and tournament features.

Its database holds demo data only, so this deploy **rebuilds it from the schema and seed**. That is the simplest way to add the new tables (`match_details`, `event_teams`, `auth_sessions`) and columns (`events.created_by`).

## Before you start (on your machine)

1. **Make sure CI is green** for the branch you're deploying. It runs every test, the lint and the build.
2. **Merge into `main` and push.** The deploy script deploys `main` by default; set `BRANCH=<name>` to deploy a different branch.

## One-time server setup

SSH in and go to the repo (adjust the path):

```bash
ssh ubuntu@your-server
cd ~/esports-platform
```

### 1. Check the tools

```bash
node -v      # needs 20 or newer
psql --version
```

### 2. Add the new settings to `backend/.env`

Compare with `backend/.env.example`. The two new lines that matter:

```bash
# A long random secret that signs the login cookie. Generate one with:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

nano backend/.env
#   SESSION_SECRET=<paste the value>
#   NODE_ENV=production
```

`NODE_ENV=production` makes the login cookie **Secure** (sent over HTTPS only) and tells Express to trust nginx's HTTPS header.

### 3. Check the frontend's API address

The frontend must call the API on **the same domain** (`https://your-domain/api`), so the login cookie is sent.

- If `frontend/.env` sets `VITE_API_BASE_URL`, either remove it (then `/api` is used) or set it to `https://your-domain/api`.
- If the API is on a **different** origin (for example `api.your-domain`), also set `CORS_ORIGIN=https://your-domain` in `backend/.env`.

### 4. Check two lines in the nginx config

Open your site config (usually `/etc/nginx/sites-available/<site>`) and compare it with [`deploy/nginx.example.conf`](../deploy/nginx.example.conf). Two lines are **required**:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header X-Forwarded-Proto $scheme;   # without this, login silently fails over HTTPS
}

location / {
    try_files $uri $uri/ /index.html;             # so /login and other deep links don't 404
}
```

After editing, test and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Tell the script how the API is restarted

The script restarts a pm2 process named `esports-api`, or a systemd service of that name. If yours has a different name, run the restart command yourself:

```bash
pm2 list                                   # find the process name
RESTART_CMD="pm2 restart <name> --update-env" ./deploy/deploy.sh --reset-db
```

## Deploy

```bash
chmod +x deploy/deploy.sh        # first time only
./deploy/deploy.sh --reset-db    # first deploy: rebuilds the database (asks you to type RESET)
```

The script runs these steps, and stops at the first error:
1. Checks `backend/.env`.
2. Pulls `main`.
3. Installs the backend dependencies (production only).
4. Builds the frontend.
5. Rebuilds the database (only with `--reset-db`).
6. Restarts the API.
7. Waits for `/api/health` to answer.

For later deploys that don't change the database, leave off `--reset-db`:

```bash
./deploy/deploy.sh
```

If nginx serves a folder other than `frontend/dist`, have the script copy the build there:

```bash
FRONTEND_DEST=/var/www/esports ./deploy/deploy.sh
```

## After deploying

Check these in a browser on the live domain:

1. **Visitor view:** while logged out, the dashboard, events, matches and standings load. The Teams and Members pages ask you to sign in.
2. **Login works:** sign in as `TheSysAdmin` with password `ArenaDev2026!`. Your name appears in the top-right account menu.
3. **The cookie is secure:**
   - Open DevTools, then Application, then Cookies.
   - The `arena.sid` cookie should have **HttpOnly** and **Secure** ticked.
   - If you're logged straight back out, the `X-Forwarded-Proto` line from step 4 is missing.
4. **Refreshing a deep link works:** reload while on `/events/4`. It should load, not 404 (that's the `try_files` line).
5. **Roles work:** log in as `O3OQueen` (Organizer) and `A2NShikimaru` (Analyst), and check that their buttons match [docs/RBAC.md](RBAC.md).
6. **Change the demo passwords:** every seeded account uses the same public dev password. As Admin, create real accounts for real people and deactivate the demo ones you don't need.

## If something goes wrong

Look at the API logs:

```bash
pm2 logs esports-api                 # or: journalctl -u esports-api -n 100
```

Common errors:

| Message | Cause |
|---|---|
| `SESSION_SECRET is missing` | The server refuses to start without it. Add it to `backend/.env`. |
| `Database connection failed` | Check the `DB_*` values in `backend/.env`. |

**Rolling back:** deploy the previous commit, then restart.

```bash
git log --oneline -5            # find the last good commit
git checkout <commit>
(cd backend && npm ci --omit=dev) && (cd frontend && npm ci && npm run build)
pm2 restart esports-api         # or: sudo systemctl restart esports-api
```

The database can always be rebuilt from the seed with `./deploy/deploy.sh --reset-db`, since it holds demo data.
