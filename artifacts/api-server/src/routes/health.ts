import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (req, res) => {
  let dbStatus = "ok";

  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
  } catch {
    dbStatus = "unavailable";
  }

  const data = HealthCheckResponse.parse({ status: dbStatus === "ok" ? "ok" : "degraded" });

  res.status(dbStatus === "ok" ? 200 : 503).json({
    ...data,
    db: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
