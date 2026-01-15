You are a senior Node.js engineer. Refactor my current Express server (all in index.mjs) into “Option A”: routers + a token service, while keeping behavior identical.

GOALS

- Keep a small src/index.mjs that wires everything together and calls app.listen.
- Move token issuing/verification + in-memory storage into src/services/tokenService.mjs.
- Move routes into Express routers:
  - src/routes/admin.mjs
  - src/routes/tapo.mjs
- Keep existing functionality:
  - POST /admin/issue (protected by requireAdminAuth) issues a signed token with TTL
  - GET /tapo/:token returns the minimal HTML page with a button that POSTs to /tapo/open/:token
  - POST /tapo/open/:token verifies token then calls sendTaggedEmail(openSubject)

CONSTRAINTS

- Use ESM (.mjs) imports.
- Keep dotenv config and required env var checks.
- No new dependencies.
- Keep existing mailer.mjs and requireAdminAuth.mjs imports/paths as-is.
- Keep the same token format: <id>.<expiresAtMs>.<signature> with HMAC sha256 + base64url.
- Keep constant-time signature compare with crypto.timingSafeEqual.
- Keep response formats as close as possible.

IMPLEMENTATION DETAILS

1. Create folder structure:
   src/
   index.mjs
   routes/admin.mjs
   routes/tapo.mjs
   services/tokenService.mjs

2. tokenService.mjs

- Export a factory: createTokenService({ secret })
- Internally store issuedTokens as Map(id -> { expiresAtMs, used })
- Provide methods:
  - issueGuestToken(ttlSeconds): returns token string, stores record
  - verifyGuestToken(token): returns { ok: true, id } or { ok:false, reason }
  - startCleanup(intervalMs=60000): setInterval to delete expired tokens; return a stop() function

3. routes/admin.mjs

- Export function createAdminRouter({ requireAdminAuth, tokenService })
- Define POST /issue:
  - validate timeToLiveInSeconds is positive int
  - call tokenService.issueGuestToken(ttlSeconds)
  - respond JSON: { ok:true, token, url:`/tapo/${token}`, timeToLiveInSeconds: ttlSeconds }

4. routes/tapo.mjs

- Export function createTapoRouter({ tokenService, sendTaggedEmail, openSubject })
- Define GET /:token (note: router mounted at /tapo so path is "/:token"):
  - send the same HTML, but ensure fetch path points to "/tapo/open/" + encodeURIComponent(token) (still absolute from root)
- Define POST /open/:token:
  - verify token via tokenService.verifyGuestToken
  - if !ok -> 403 json { ok:false, error:"Forbidden", reason }
  - try sendTaggedEmail(openSubject)
  - on success -> { ok:true }
  - on failure -> 502 json { ok:false, error:"Email send failed" } and console.error like before

5. index.mjs

- Keep dotenv.config and requiredEnvVariables check
- Read port, openSubject, guidSecret
- Create express app and express.json middleware
- Create tokenService = createTokenService({ secret: guidSecret }) and start cleanup
- Mount routers:
  - app.use("/admin", adminRouter)
  - app.use("/tapo", tapoRouter)
- Listen on port

DELIVERABLES

- Provide full code for all new/updated files with correct relative imports.
- Assume the previous index.mjs lived in src/index.mjs; update accordingly.
- Ensure there are no route regressions: /admin/issue, /tapo/:token, /tapo/open/:token still work.
