const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    username: { type: String, unique: true },
    online:{ type:String, required: false}
  },
  { collection: "users" }
);
const model = mongoose.model("User", userSchema);

module.exports = model;
