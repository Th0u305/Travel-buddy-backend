import { app } from "./app.ts";
import { envVars } from "./src/app/config/env.ts";
import { connectRedis } from "./src/app/config/redis.config.ts";

// 1. Create an AbortController to signal the server to stop
const controller = new AbortController();

// 2. Start the server with the abort signal

(async () => {
  await connectRedis()
})()

const server = Deno.serve(
  { port: Number(envVars.PORT) }, app.fetch
)

// --- Graceful Shutdown Logic ---

const shutdown = async (reason: string, error?: Error) => {
  console.log(`\n🛑 ${reason} detected. Server shutting down...`);
  if (error) console.error(error);
  
  // This tells Deno.serve to stop accepting new requests
  controller.abort(); 
  
  // Wait for the server promise to resolve (finishes active requests)
  await server.finished;
  
  console.log("👋 Shutdown complete.");
  Deno.exit(error ? 1 : 0);
};

// 3. Handle Uncaught Exceptions & Rejections
// In Deno, these are global events
globalThis.addEventListener("unhandledrejection", (e) => {
  shutdown("Unhandled Rejection", e.reason);
});

globalThis.addEventListener("error", (e) => {
  shutdown("Uncaught Exception", e.error);
});

// 4. Handle System Signals (SIGINT = Ctrl+C, SIGTERM = Kill)
Deno.addSignalListener("SIGINT", () => {
  shutdown("SIGINT (Ctrl+C)");
});

Deno.addSignalListener("SIGTERM", () => {
  shutdown("SIGTERM");
});