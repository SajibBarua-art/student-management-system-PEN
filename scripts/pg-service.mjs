import { existsSync, mkdirSync } from "fs";
import path from "path";
import EmbeddedPostgres from "embedded-postgres";
import net from "net";

const PG_PORT = parseInt(process.env.PG_PORT || "5433", 10);
const DATA_DIR = path.resolve(process.cwd(), ".database/pgdata");

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      resolve(false);
    });
    socket.connect(port, "127.0.0.1");
  });
}

async function start() {
  const open = await isPortOpen(PG_PORT);
  if (open) {
    console.log(`[PostgreSQL] Database already running on port ${PG_PORT}`);
    return;
  }

  if (!existsSync(path.dirname(DATA_DIR))) {
    mkdirSync(path.dirname(DATA_DIR), { recursive: true });
  }

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    port: PG_PORT,
    user: "postgres",
    password: "password",
    initialDatabase: "sms_registry",
    persistent: true,
  });

  if (!existsSync(DATA_DIR)) {
    console.log(`[PostgreSQL] Initializing cluster at ${DATA_DIR}...`);
    await pg.initialise();
  }

  console.log(`[PostgreSQL] Starting database on port ${PG_PORT}...`);
  await pg.start();
  console.log(`[PostgreSQL] PostgreSQL is running on port ${PG_PORT}!`);

  const keepAlive = process.argv.includes("--daemon") || process.argv.includes("--keep-alive");
  if (keepAlive) {
    console.log("[PostgreSQL] Press Ctrl+C to stop.");
    const cleanup = async () => {
      console.log("\n[PostgreSQL] Shutting down...");
      await pg.stop();
      process.exit(0);
    };
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    // keep event loop alive
    setInterval(() => {}, 60000);
  }
}

start().catch((err) => {
  console.error("[PostgreSQL Error]:", err);
  process.exit(1);
});
