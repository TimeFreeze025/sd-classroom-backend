import express from "express";
import subjectsRouter from "./routes/subjects.ts";

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

app.use("/api/subjects", subjectsRouter);

app.get("/", (req, res) => {
  res.send("Hello, Welcome to Classroom API!");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
function cors(arg0: {
  origin: string | undefined;
  methods: string[];
  credentials: boolean;
}): any {
  throw new Error("Function not implemented.");
}
