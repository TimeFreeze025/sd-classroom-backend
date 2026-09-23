import express from "express";
import subjectsRouter from "./routes/subjects.ts";
import usersRouter from "./routes/users.ts";
import classesRouter from "./routes/classes.ts";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.ts";
import { requireRole } from "./middleware/require-role.ts";

const app = express();
const PORT = process.env.PORT || 8000;

if (!process.env.FRONTEND_URL)
  throw new Error("FRONTEND_URL is not defined in the .env file");

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

// app.all("/api/auth/*splat", toNodeHandler(auth));
app.all("/api/auth/*splat", async (req, res) => {
  try {
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value)
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }

    const isBodyless = ["GET", "HEAD"].includes(req.method);

    const init: RequestInit = {
      method: req.method,
      headers,
      ...(isBodyless ? {} : { body: JSON.stringify(req.body) }),
    };

    const request = new Request(url, init);

    const response = await auth.handler(request);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    const text = await response.text();
    res.send(text);
  } catch (err) {
    console.error("Auth handler error:", err);
    res.status(500).json({ error: "Internal auth error" });
  }
});

app.use("/api/subjects", requireRole("teacher", "admin"), subjectsRouter);
// app.use("/api/subjects", subjectsRouter);
app.use("/api/users", usersRouter);
// app.use("/api/classes", classesRouter);
app.use("/api/classes", requireRole("teacher", "admin"), classesRouter);

app.get("/", (req, res) => {
  res.send("Hello, Welcome to Classroom API!");
});

if (process.env.NODE_ENV !== "workers") {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

export default app;
