import express from "express";
import { globalError, notFoundError } from "./utils/errors.js";
import { userRoutes } from "./routes/user.route.js";
import { postRoutes } from "./routes/post.route.js";
import cors from "cors";
import { authRoutes } from "./routes/auth.route.js";

const PORT = 8000;

const app = express();

app.use(cors());
app.use(express.json()); // agar bisa nerima request body

app.get("/api", (req, res) => res.status(200).send("Welcome to my API"));

//entry point user posts
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/auth", authRoutes);

//errors
app.use(notFoundError);
app.use(globalError);

app.listen(PORT, () => console.log(`Server running on port : ${PORT}`));
