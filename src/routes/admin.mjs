import express from "express";

export function createAdminRouter({ requireAdminAuth, tokenService }) {
  const router = express.Router();

  router.get("/", (request, response) => {
    return response.redirect(302, "/admin.html");
  });

  router.post("/issue", requireAdminAuth, (request, response) => {
    const { timeToLiveInSeconds } = request.body ?? {};

    const timeToLiveInSecondsParsed = Number.parseInt(String(timeToLiveInSeconds), 10);
    if (!Number.isFinite(timeToLiveInSecondsParsed) || timeToLiveInSecondsParsed <= 0) {
      return response
        .status(400)
        .json({ ok: false, error: "timeToLiveInSeconds must be a positive integer." });
    }

    const token = tokenService.issueGuestToken(timeToLiveInSecondsParsed);

    return response.json({
      ok: true,
      token,
      url: `/tapo/${token}`,
      timeToLiveInSeconds: timeToLiveInSecondsParsed,
    });
  });

  return router;
}
