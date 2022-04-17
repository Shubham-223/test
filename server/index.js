require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Set up server
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.listen(PORT, () => console.log(`Server started on PORT - ${PORT}`));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, (err) => {
  if (err) {
    console.log(`Error in connecting to mongodb : ${err.toString()}`);
    return;
  }

  console.log("Connected to mongodb");
});

// Set up routes
app.use("/api/user", require("./routes/user"));
app.use("/api/test", require("./routes/test"));
