import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env.PORT || "3000";
const port = Number(rawPort);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, "0.0.0.0", () => {
  logger.info(
    { port },
    "Hockey Heart Initiative API server started",
  );
});

server.on("error", (err) => {
  logger.error({ err }, "API server failed to start");
  process.exit(1);
});

const shutdown = (signal: string) => {
  logger.info({ signal }, "Shutting down API server");

  server.close((err) => {
    if (err) {
      logger.error({ err }, "Error while shutting down API server");
      process.exit(1);
    }

    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
