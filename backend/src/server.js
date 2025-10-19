import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import groupRoutes from "./routes/group.js";
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";
dotenv.config();

const port = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);



if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist", "index.html"));
  });
}


app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/groups", groupRoutes);

server.listen(port, () => {
  console.log("Server is listening at " + port);
  connectDB();
});
