# Self-hosting ZENA Control

Use a dedicated non-root account, Node.js 20+, PostgreSQL, nginx/TLS, a secret manager or mode-`0600` environment file, and one PM2 fork. Restrict the application port to localhost or a private VPN path.

```bash
npm ci
npm run check
npm test
npm run build
set -a; . ./.env; set +a
npm run db:push
npm prune --omit=dev
pm2 start ecosystem.config.js --env production
```

Do not display, commit, or paste the populated environment file. Execution credentials remain opaque references. Use `/api/firewall/public-status` for health checks. Treat missing evidence, partial effects, provider timeouts, and unknown outcomes as fail-closed conditions requiring reconciliation before retry.
