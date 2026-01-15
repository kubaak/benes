# Tapo IFTTT Trigger Service

This is a minimal Node.js 20 service that exposes a single endpoint to trigger IFTTT Email applets via Gmail.

## Requirements

- Node.js 20+
- A Gmail account with 2-Step Verification enabled
- A Gmail App Password

## Creating a Gmail App Password

1. Go to your Google Account security settings.
2. Enable **2-Step Verification** if it is not already enabled.
3. In the **Security** section, find **App passwords**.
4. Create a new App Password (for example, select "Mail" and your device).
5. Google will generate a 16-character App Password. Use this as `GMAIL_APP_PASSWORD`.

## Setup

1. Install dependencies:

   ```bash path=null start=null
   npm i
   ```

2. Create your `.env` file from the example:

   ```bash path=null start=null
   cp .env.example .env
   ```

3. Edit `.env` and fill in real values (Gmail user, app password, etc.).

4. Start the server:

   ```bash path=null start=null
   npm run start
   ```

## Usage

Trigger the tapo open/close sequence with:

```bash path=null start=null
curl -X POST http://localhost:3000/tapo/open
```

The server will:

1. Send an email with subject `#tapo_open` to `trigger@applet.ifttt.com`.
2. Wait `WAIT_MS` milliseconds (default 1000 ms).
3. Send an email with subject `#tapo_close` to the same address.
4. Respond with JSON like:

```json path=null start=null
{ "ok": true, "openedForMs": 1000 }
```

If sending an email fails, it will retry once after 500 ms. If it still fails, the endpoint responds with:

```json path=null start=null
{ "ok": false, "error": "Email send failed" }
```

## Notes

- This service is designed specifically to trigger IFTTT Email applets using subject tags.
- No additional endpoints are exposed beyond `POST /tapo/open`.
