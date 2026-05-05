import { Router, Request, Response } from "express";
import multer from "multer";
import { analyzeImage } from "../services/analyzeImage";

const router = Router();

// Configure multer for memory storage (no disk writes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * POST /vision
 * Accepts an image upload, extracts code using vision AI, then analyzes it
 */
router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No image file uploaded" });
        return;
      }

      const { buffer, mimetype } = req.file;
      const base64Image = buffer.toString("base64");

      console.log(
        `Processing image upload: ${mimetype}, ${buffer.length} bytes`
      );

      const result = await analyzeImage(base64Image, mimetype);

      console.log(
        `Vision analysis complete: ${result.language}, ${result.errors.length} errors found`
      );

      res.json(result);
    } catch (error) {
      console.error("Error in /vision route:", error);

      if (error instanceof Error) {
        res.status(500).json({
          error: "Vision analysis failed",
          message: error.message,
        });
      } else {
        res.status(500).json({ error: "An unexpected error occurred" });
      }
    }
  }
);

export default router;
