import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import analyzeRouter from "./routes/analyze";
import visionRouter from "./routes/vision";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      // Allow Render preview URLs
      /\.onrender\.com$/,
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check endpoint (for Render deployment)
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Flow AI Backend",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/analyze", analyzeRouter);
app.use("/vision", visionRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
);

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Flow AI Backend running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Analyze API:  http://localhost:${PORT}/analyze`);
  console.log(`   Vision API:   http://localhost:${PORT}/vision\n`);

  // Warn if API key is missing
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn(
      "⚠️  WARNING: OPENROUTER_API_KEY is not set. API calls will fail."
    );
  }
});

export default app;
