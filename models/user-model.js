const mongoose = require("mongoose");

const AutoIncrement = require("mongoose-sequence")(mongoose);

const userModel = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
  },
  { timestamps: true },
);

userModel.plugin(AutoIncrement, {
  index: "order_seq",
  inc_field: "index",
});
module.exports = mongoose.model("user", userModel);
