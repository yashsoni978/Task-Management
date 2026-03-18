import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // express-validator errors are usually caught by the `validate` middleware,
  // but if they propagate here, handle them
  if (err.array && typeof err.array === "function") {
    res.status(400).json({ errors: err.array() });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === "P2002") {
      res.status(409).json({ error: "A record with this value already exists" });
      return;
    }
    // Record not found
    if (err.code === "P2025") {
      res.status(404).json({ error: "Record not found" });
      return;
    }
  }

  console.error("Global Error:", err);

  const isProduction = process.env.NODE_ENV === "production";
  res.status(500).json({
    error: isProduction ? "Internal server error" : err.message || "An unexpected error occurred",
  });
}
