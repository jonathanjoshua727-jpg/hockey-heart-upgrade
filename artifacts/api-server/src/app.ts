import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// The app is always reached through Replit's reverse proxy (one hop), both in
// dev preview and in production deployments. Trust exactly that hop so
// req.ip reflects the real client IP for rate limiting — never `true`, which
// would let clients spoof X-Forwarded-For.
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Same-origin by default (frontend and API share the domain via path
// routing). Cross-origin access must be explicitly enabled via CORS_ORIGIN.
if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN.split(",") }));
}
app.use(
  express.json({
    verify: (req, _res, buf) => {
      // Preserve the raw body for webhook signature verification.
      (req as typeof req & { rawBody?: Buffer }).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
