# ZENA Control deployment

Deploy behind the trusted ZCOS gateway with Node.js 20+, PostgreSQL, HTTPS, and one application process. The one-process limit remains until the authentication nonce registry uses shared atomic storage.

```bash
npm ci
npm run check
npm test
npm run build
npm run db:push
npm prune --omit=dev
npm start
```

Inject every value in `production.env.example` from the deployment secret manager. Never commit populated credentials or copy them into prompts, logs, Memory, Knowledge, or browser payloads.

The gateway must replace client identity headers and sign the method, complete original URL, canonical JSON body hash, owner, actor, roles, scopes, timestamp, and nonce. Prevent direct public access to the application port.

Public health is `GET /api/firewall/public-status`. All other security, system, and Integrity routes are authenticated. Before a protected mutation, authorize the typed operation at `POST /api/integrity/authorize`, then supply `x-zena-execution-id`. Changed scope and duplicate claims fail closed.

After deployment, verify public health returns `200` and an unsigned `GET /api/integrity/logs` returns `401 AUTHENTICATION_REQUIRED`.
