import net from "net";
import { spawn } from "child_process";
import path from "path";

const PG_PORT = parseInt(process.env.PG_PORT || "5433", 10);

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
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

async function main() {
  const isRunning = await isPortOpen(PG_PORT);
  if (isRunning) {
    console.log(`[Database] PostgreSQL active on 127.0.0.1:${PG_PORT}`);
    return;
  }

  console.log(`[Database] Starting PostgreSQL server on port ${PG_PORT}...`);
  const child = spawn(
    process.execPath,
    [path.resolve(process.cwd(), "scripts/pg-service.mjs"), "--keep-alive"],
    {
      detached: true,
      stdio: "ignore",
    }
  );
  child.unref();

  // Wait for port to become active
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (await isPortOpen(PG_PORT)) {
      console.log(`[Database] PostgreSQL ready on port ${PG_PORT}!`);
      return;
    }
  }
  console.warn(`[Database] PostgreSQL startup is still progressing...`);
}

main().catch(console.error);
