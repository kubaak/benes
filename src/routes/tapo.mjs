import express from "express";

export function createTapoRouter({ tokenService, sendTaggedEmail, openSubject }) {
  const router = express.Router();

  router.get("/:token", (request, response) => {
    const token = request.params.token;
    const verifiedToken = tokenService.verifyGuestToken(token);

    if (!verifiedToken.ok) {
      return response.status(403).send(`<h3>Forbidden</h3><p>Reason: ${verifiedToken.reason}</p>`);
    }

    return response.redirect(302, `/tapo.html#${encodeURIComponent(token)}`);
  });

  router.post("/open/:token", async (request, response) => {
    const token = request.params.token;

    const verifiedToken = tokenService.verifyGuestToken(token);
    if (!verifiedToken.ok) {
      return response.status(403).json({ ok: false, error: "Forbidden", reason: verifiedToken.reason });
    }

    try {
      await sendTaggedEmail(openSubject);

      return response.json({ ok: true });
    } catch (error) {
      console.error("Error while processing /tapo/open", {
        message: error?.message,
        code: error?.code,
      });

      return response.status(502).json({ ok: false, error: "Email send failed" });
    }
  });

  return router;
}
