const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, trim: true },
  email: {
    type: "String",
    required: [true, "Please Enter name"],
    unique: true,
  },
});

module.exports = mongoose.model("User", userSchema, "User");
