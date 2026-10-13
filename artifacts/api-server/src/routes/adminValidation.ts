import express, { type RequestHandler } from "express";
import { z } from "zod/v4";

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export const parseAdminLoginBody: RequestHandler[] = [
  express.text({ type: "*/*", limit: "10kb" }),
  (req, res, next) => {
    if (typeof req.body !== "string") {
      next();
      return;
    }

    try {
      req.body = JSON.parse(req.body);
      next();
    } catch {
      res.status(400).json({
        error: "Invalid login payload: expected a JSON object.",
      });
    }
  },
];
