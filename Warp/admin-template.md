You are a senior Node.js/Express engineer. Extend my existing app (which now serves public/tapo.html and redirects /tapo/:token -> /tapo.html#token) by adding a simple “Admin issue token” web form (no external assets, no new dependencies).

CURRENT BEHAVIOR (assume already implemented)

- POST /admin/issue is protected by requireAdminAuth and returns JSON: { ok:true, token, url, timeToLiveInSeconds }
- GET /tapo/:token redirects to /tapo.html#<token>
- public/tapo.html reads token from hash and POSTs to /tapo/open/:token

GOAL
Add a new static page public/admin.html that:

- Lets me enter:
  1. Admin API key (whatever requireAdminAuth expects; send it as a header)
  2. Date To
- On submit, calls POST /admin/issue with JSON body { timeToLiveInSeconds: <ttl> }
- ttl will be calculated as dateTo - now
- Includes the admin key in a request header (choose a sensible header name, and match it with requireAdminAuth; see below)
- Displays the returned URL (clickable) and token, and a “Copy” button for the URL.
- Shows errors clearly (HTTP status + server error field if present).
- No external assets, minimal styling similar to tapo.html.

IMPORTANT CONSTRAINTS

- Do NOT add any new npm dependencies.
- Keep requireAdminAuth as-is if possible. If requireAdminAuth expects a specific header name, use that exact header.
- If requireAdminAuth currently reads a header like "x-admin-key" or "authorization", keep it consistent.
- Do not log the admin key.
- Admin key field should be type=password.
- TTL should default to 24 x 3600 (1 day).
- Keep everything ESM.

IMPLEMENTATION STEPS

1. Add a new static page:

   - Create public/admin.html with:
     - Two inputs: adminKey (password), date to (date)
     - Submit button
     - Result area:
       - link to the issued url
       - token text
       - copy button that copies the url to clipboard
   - JS should:
     - validate ttlSeconds is positive integer
     - POST to /admin/issue with JSON { timeToLiveInSeconds: ttlSeconds }
     - set headers:
       - Content-Type: application/json
       - Admin key header: (use the header name expected by requireAdminAuth; if unknown, inspect requireAdminAuth.mjs and use the actual one)
     - parse JSON response
     - if ok: render clickable URL; when user clicks it, it should open the door page
     - if not ok: show message and response details

2. Ensure static middleware already serves public/ (so /admin.html works).

   - If not present, add it (but don’t break existing routes).

3. Add a convenience redirect (optional but nice):

   - GET /admin -> redirect 302 to /admin.html

4. Make sure /admin/issue JSON response returns url in the form that works with the new hash-fragment approach:
   - Preferred: url should be `/tapo/${token}` (which redirects to tapo.html#token) OR directly `/tapo.html#${token}`
   - Choose ONE and keep consistent. If you choose `/tapo/${token}`, the admin page can display the fully qualified absolute URL by using window.location.origin + url.
   - Ensure the admin page displays an absolute URL like `${location.origin}${url}`.

DELIVERABLES

- Provide full content of public/admin.html.
- Provide any necessary code changes to server routes (redirect /admin -> /admin.html, and/or ensure static serving).
- If requireAdminAuth’s header name is not obvious, open/inspect requireAdminAuth.mjs and adapt the admin.html fetch to match it exactly.
