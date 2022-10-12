const mongoose = require("mongoose");

const todoSchema = mongoose.Schema(
  {
    description: { type: String, required: true },
    task: { type: String, required: true },
    timestamp: Date,
    owner_id:{type:String},//Linking method, the user id i.e the id of the user that made the post gotten from the token
    edited: {type: Boolean, default: false},
    edited_at: Date,
    completed:{default : false}
  },
  { collection: "todo" }
);

const model = mongoose.model("Todo", todoSchema);
module.exports = model;
