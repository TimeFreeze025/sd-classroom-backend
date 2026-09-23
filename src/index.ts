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

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/subjects", requireRole("teacher", "admin"), subjectsRouter);
// app.use("/api/subjects", subjectsRouter);
app.use("/api/users", usersRouter);
// app.use("/api/classes", classesRouter);
app.use("/api/classes", requireRole("teacher", "admin"), classesRouter);

app.get("/", (req, res) => {
  res.send("Hello, Welcome to Classroom API!");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
