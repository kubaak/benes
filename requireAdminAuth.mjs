export function requireAdminAuth(req, res, next) {
  const header = req.header("x-admin-api-key");

  if (!header) {
    return res.status(401).json({ ok: false, error: "Missing admin key" });
  }

  if (header !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ ok: false, error: "Invalid admin key" });
  }

  next();
}
