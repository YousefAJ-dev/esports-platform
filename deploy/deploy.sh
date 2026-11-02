#!/usr/bin/env bash
# Deploys the latest code on the server. Run from anywhere inside the repo:
#
#   ./deploy/deploy.sh               # update code, install, build, restart
#   ./deploy/deploy.sh --reset-db    # same, plus rebuild the database from schema + seed (WIPES DATA)
#
# Settings (environment variables, all optional):
#   BRANCH        branch to deploy (default: main)
#   RESTART_CMD   how to restart the API (default: auto-detect pm2, else systemd "esports-api")
#   API_URL       health check URL (default: http://127.0.0.1:3000/api/health)
#   FRONTEND_DEST copy the built frontend here if nginx serves a different folder than frontend/dist

set -euo pipefail

BRANCH="${BRANCH:-main}"
API_URL="${API_URL:-http://127.0.0.1:3000/api/health}"
RESET_DB=false
[[ "${1:-}" == "--reset-db" ]] && RESET_DB=true

REPO_ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
cd "$REPO_ROOT"

step() { printf '\n==> %s\n' "$1"; }

# ---- 1. Preflight: the server must have a production .env with a session secret
step "Checking backend/.env"
ENV_FILE="backend/.env"
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE (copy backend/.env.example and fill it in)"; exit 1; }
grep -q '^SESSION_SECRET=.\{16,\}' "$ENV_FILE" || { echo "SESSION_SECRET is missing or too short in $ENV_FILE"; exit 1; }
grep -q '^NODE_ENV=production' "$ENV_FILE" || echo "WARNING: NODE_ENV=production is not set; login cookies won't be marked Secure"

# ---- 2. Code
step "Updating code ($BRANCH)"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
echo "Now at: $(git log --oneline -1)"

# ---- 3. Backend dependencies (no dev tools like the test runner on the server)
step "Installing backend dependencies"
(cd backend && npm ci --omit=dev)

# ---- 4. Frontend build
step "Building frontend"
(cd frontend && npm ci && npm run build)

if [[ -n "${FRONTEND_DEST:-}" ]]; then
	step "Copying frontend to $FRONTEND_DEST"
	mkdir -p "$FRONTEND_DEST"
	cp -r frontend/dist/. "$FRONTEND_DEST"/
fi

# ---- 5. Database (only when asked; this wipes and reseeds every table)
if $RESET_DB; then
	step "Rebuilding the database from schema + seed (all data will be replaced)"
	read -r -p "Type RESET to continue: " CONFIRM
	[[ "$CONFIRM" == "RESET" ]] || { echo "Cancelled."; exit 1; }

	# Read DB_* from backend/.env without exporting anything else
	DB_HOST="$(grep '^DB_HOST=' "$ENV_FILE" | cut -d= -f2-)"
	DB_PORT="$(grep '^DB_PORT=' "$ENV_FILE" | cut -d= -f2-)"
	DB_NAME="$(grep '^DB_NAME=' "$ENV_FILE" | cut -d= -f2-)"
	DB_USER="$(grep '^DB_USER=' "$ENV_FILE" | cut -d= -f2-)"
	export PGPASSWORD="$(grep '^DB_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)"

	# The SQL files include each other with paths relative to the repo root
	psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -f backend/db/schema/schema.sql
	psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -q -f backend/db/seed/seed_data.sql
	unset PGPASSWORD
	echo "Database rebuilt. Dev logins use the seeded password - change them before real use."
fi

# ---- 6. Restart the API
step "Restarting the API"
if [[ -n "${RESTART_CMD:-}" ]]; then
	eval "$RESTART_CMD"
elif command -v pm2 >/dev/null && pm2 describe esports-api >/dev/null 2>&1; then
	pm2 restart esports-api --update-env
else
	sudo systemctl restart esports-api
fi

# ---- 7. Health check
step "Checking $API_URL"
for attempt in $(seq 1 15); do
	if curl -fsS "$API_URL" >/dev/null; then
		echo "API is up."
		echo "Done. Now check the site in a browser (see docs/DEPLOYMENT.md, 'After deploying')."
		exit 0
	fi
	sleep 2
done

echo "API did not answer at $API_URL. Check the logs (pm2 logs esports-api, or journalctl -u esports-api -n 50)."
exit 1
