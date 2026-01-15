You are a senior Node.js/Express engineer. Implement “token in URL hash fragment” for my door-opener page so I no longer embed HTML as a giant string in the GET route.

CURRENT BEHAVIOR

- GET /tapo/:token returns an HTML page (built as a string) that contains a button.
- Clicking the button POSTs to /tapo/open/:token which verifies the token and sends an email.

GOAL

- Serve a real static HTML file `public/tapo.html`.
- Change GET /tapo/:token to redirect to `/tapo.html#<token>` (hash fragment).
- In tapo.html, read the token from `location.hash` and POST to `/tapo/open/<token>`.
- Keep POST /tapo/open/:token unchanged.
- No new dependencies.

STEPS

1. Add static file serving in my Express app:

   - Create a `public/` folder at the project root (sibling of `src/` if present).
   - In the main server file (index.mjs), add:
     - import path + fileURLToPath
     - compute \_\_dirname from import.meta.url
     - app.use(express.static(path.join(\_\_dirname, "../public")));
   - Ensure this is added before routes.

2. Create `public/tapo.html` with:

   - Same UI (styles, heading, button, message area) as my current inline HTML.
   - JS that:
     - reads token from hash: decodeURIComponent(location.hash.slice(1) || "")
     - disables button and shows message if token missing
     - on click, does fetch('/tapo/open/' + encodeURIComponent(token), { method:'POST', headers:{'Content-Type':'application/json'} })
     - shows success/error messages exactly like before
     - keeps the 4s cooldown to prevent double clicks

3. Replace the inline HTML GET handler:

   - Update GET /tapo/:token to:
     res.redirect(302, `/tapo.html#${encodeURIComponent(token)}`);
   - Remove the large res.send(`...html...`) block.

4. Verify routes still work:
   - /admin/issue still issues tokens (unchanged)
   - Visiting /tapo/<token> redirects to /tapo.html#<token>
   - Clicking button triggers POST /tapo/open/<token>

DELIVERABLES

- Provide the exact code changes for:
  - main server file (index.mjs)
  - the GET /tapo/:token route file
  - new file public/tapo.html
- Keep all existing logic for token verification and email sending untouched.
