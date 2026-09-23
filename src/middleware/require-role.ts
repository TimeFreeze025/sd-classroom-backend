// server/middleware/requireRole.ts
import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export function requireRole(...roles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const userRole = (session.user as { role?: string }).role;

      if (!userRole || !roles.includes(userRole)) {
        return res.status(403).json({ error: "Forbidden" });
      }

      // optional: attach for downstream handlers
      (req as any).user = session.user;

      next();
    } catch (err) {
      console.error("requireRole error:", err);
      res.status(500).json({ error: "Failed to verify session" });
    }
  };
}
