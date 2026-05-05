import { Router, Request, Response } from "express";
import { analyzeCode } from "../services/analyzeCode";

const router = Router();

/**
 * POST /analyze
 * Accepts code string and returns AI analysis with errors and fixed code
 */
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    // Validate input
    if (!code || typeof code !== "string") {
      res.status(400).json({
        error: "Invalid request: 'code' field is required and must be a string",
      });
      return;
    }

    if (code.trim().length === 0) {
      res.status(400).json({ error: "Code cannot be empty" });
      return;
    }

    if (code.length > 50000) {
      res
        .status(400)
        .json({ error: "Code is too large. Maximum 50,000 characters." });
      return;
    }

    console.log(`Analyzing code snippet (${code.length} chars)...`);

    const result = await analyzeCode(code);

    console.log(
      `Analysis complete: ${result.language}, ${result.errors.length} errors found`
    );

    res.json(result);
  } catch (error) {
    console.error("Error in /analyze route:", error);

    if (error instanceof Error) {
      res.status(500).json({
        error: "Analysis failed",
        message: error.message,
      });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
});

export default router;
