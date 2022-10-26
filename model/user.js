const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone:{type: String},
    username: { type: String, unique: true },
    last_seen: Date,
    isLoggedIn :{ type:String, default: true}
  },
  { collection: "users" }
);
const model = mongoose.model("User", userSchema);

module.exports = model;
