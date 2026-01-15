You are my senior engineer. Create a minimal Node.js 20 project that exposes ONE endpoint:

POST /tapo/open

When called, it must:

1. Send an email via Gmail SMTP from ebpilsen@gmail.com to trigger@applet.ifttt.com
   with Subject: #tapo_open
2. Wait 1000 ms
3. Send another email from the same Gmail account to trigger@applet.ifttt.com
   with Subject: #tapo_close
4. Return JSON: { ok: true, openedForMs: 1000 }

Requirements:

- Use Node.js 20, ES modules.
- Use `express` for HTTP server.
- Use `nodemailer` for SMTP email sending.
- Use `dotenv` for environment variables.
- No other frameworks.
- Do not log any secrets.
- Add basic validation: reject if required env vars are missing.
- Add minimal error handling: return 502 with { ok:false, error:"Email send failed" } if any send fails.
- Ensure the second email is only sent if the first one was sent successfully.
- Add retry once on SMTP transient failure (simple).
- Provide a /health endpoint ONLY if unavoidable; otherwise do not create extra endpoints besides /tapo/open.

Environment variables (.env.example):

- PORT=3000
- GMAIL_USER=ebpilsen@gmail.com
- GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx (Gmail App Password, not normal password)
- IFTTT_EMAIL=trigger@applet.ifttt.com
- OPEN_SUBJECT=#tapo_open
- CLOSE_SUBJECT=#tapo_close
- WAIT_MS=1000

Deliverables (repo):

- package.json (type=module)
- index.mjs (server)
- mailer.mjs (nodemailer transport + send function)
- .env.example
- README.md with:
  - How to create a Gmail App Password (Google Account → Security → 2-Step Verification → App passwords)
  - Setup steps: cp .env.example .env, fill values, npm i, npm run start
  - Test command: curl -X POST http://localhost:3000/tapo/open
  - Notes: This triggers IFTTT Email applets by sending emails with subject tags.

Implementation details:

- Use nodemailer SMTP settings:
  host: smtp.gmail.com
  port: 465
  secure: true
  auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD }

- `sendTaggedEmail(subject)` must send:
  from: `"EB Pilsen" <${GMAIL_USER}>`
  to: IFTTT_EMAIL
  subject: subject
  text: subject

- Retry logic: if sending fails, retry once after 500ms before failing.

Scripts:

- "start": "node index.mjs"
- "dev": "node --watch index.mjs"

After generating files, print the exact commands to run:

1. npm i
2. cp .env.example .env
3. npm run start
4. curl -X POST http://localhost:3000/tapo/open
