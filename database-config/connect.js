const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(
  process.env.DATABASE_URL,
  () => {
    console.log("Connected to MongoDB");
  },
  (err) => {
    console.log(err);
  },
);
