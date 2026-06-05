#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}Starting The Flock stack...${RESET}"
echo ""

if docker compose up --help 2>/dev/null | grep -q '\-\-wait'; then
  docker compose up --build -d --wait
else
  docker compose up --build -d
  echo -e "${YELLOW}Waiting for backend healthcheck (~30–90s on first boot)...${RESET}"
  for _ in $(seq 1 60); do
    if curl -sf http://localhost:3000/health >/dev/null 2>&1; then
      break
    fi
    sleep 2
  done
fi

echo ""
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}${BOLD}  The Flock is running — open these URLs in your browser${RESET}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${BOLD}Frontend (app)${RESET}     ${CYAN}http://localhost:5173${RESET}   ${YELLOW}(port 5173 → nginx:80)${RESET}"
echo -e "  ${BOLD}Backend (API)${RESET}      ${CYAN}http://localhost:3000${RESET}   ${YELLOW}(port 3000)${RESET}"
echo -e "  ${BOLD}Health check${RESET}       ${CYAN}http://localhost:3000/health${RESET}"
echo -e "  ${BOLD}PostgreSQL${RESET}         ${CYAN}localhost:5432${RESET}            ${YELLOW}(user/pass/db: postgres / postgres / twitter_clone)${RESET}"
echo ""
echo -e "${BOLD}Test login (seed data)${RESET}"
echo -e "  Email:    ${CYAN}alice@example.com${RESET}"
echo -e "  Password: ${CYAN}Password123!${RESET}"
echo ""
echo -e "${BOLD}Useful commands${RESET}"
echo -e "  Status:  ${CYAN}docker compose ps${RESET}"
echo -e "  Logs:    ${CYAN}docker compose logs -f backend${RESET}"
echo -e "  Stop:    ${CYAN}docker compose down${RESET}"
echo -e "  Reset:   ${CYAN}docker compose down -v && ./start.sh${RESET}"
echo ""
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
