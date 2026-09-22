import express from "express";
import { globalError, notFoundError } from "./utils/errors.js";
import { userRoutes } from "./routes/user.route.js";
import { blogRoutes } from "./routes/blog.route.js";

const PORT = 8000;

const app = express();

app.use(express.json()); // agar bisa nerima request body

app.get("/api", (req, res) => {
  res.status(200).send("Welcome to my API");
});

//entry point user
app.use("/users", userRoutes)

//entry point blog
app.use("/blogs", blogRoutes)

//errors
app.use(notFoundError)
app.use(globalError)

app.listen(PORT, () => {
  console.log(`Server running on port : ${PORT}`);
});
