const express = require("express");
const app = express();
const database = require("./config/database.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//cấu hình env
require("dotenv").config();

const port = process.env.PORT || 3000;

// SỬA LẠI: Cấu hình CORS với origin cụ thể và credentials
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL - thay * bằng URL cụ thể
    credentials: true, // Cho phép gửi cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middlewares: parse JSON and x-www-form-urlencoded BEFORE mounting routes
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//kết nối database
database.connect();

// Routes
const route = require("./routes/index.routes");
route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
