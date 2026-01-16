import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { sendTaggedEmail } from "../mailer.mjs";
import { requireAdminAuth } from "../requireAdminAuth.mjs";
import { createTokenService } from "./services/tokenService.mjs";
import { createAdminRouter } from "./routes/admin.mjs";
import { createTapoRouter } from "./routes/tapo.mjs";

dotenv.config();

const fileName = fileURLToPath(import.meta.url);
const directoryName = path.dirname(fileName);

const requiredEnvVariables = [
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "IFTTT_EMAIL",
  "OPEN_SUBJECT",
  "GUID_SECRET",
  "ADMIN_API_KEY"
];

const missingEnvVariables = requiredEnvVariables.filter((variableName) => !process.env[variableName]);

if (missingEnvVariables.length > 0) {
  console.error("Missing required environment variables:", missingEnvVariables.join(", "));
  process.exit(1);
}

const port = Number(process.env.PORT) || 8080;
const openSubject = process.env.OPEN_SUBJECT;
const guidSecret = process.env.GUID_SECRET;

const application = express();
application.use(express.json());
application.use(express.static(path.join(directoryName, "../public")));

const tokenService = createTokenService({ secret: guidSecret });

const adminRouter = createAdminRouter({ requireAdminAuth, tokenService });
const tapoRouter = createTapoRouter({ tokenService, sendTaggedEmail, openSubject });

application.use("/admin", adminRouter);
application.use("/tapo", tapoRouter);

application.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
