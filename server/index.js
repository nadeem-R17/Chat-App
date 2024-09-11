require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");
const { connectDB } = require("./config/db");

connectDB();

const { initSocket } = require("./socket");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io= initSocket(server);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const groupRoutes = require("./routes/groupRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/groups", groupRoutes);



server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});