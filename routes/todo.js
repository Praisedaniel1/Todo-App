const express = require("express");
const Todo = require("../model/todo");
const router = express.Router();
const jwt = require("jsonwebtoken");

//endpoints goes here
router.post("/create", async (req, res) => {
  const { description, task, token, owner_id } = req.body;

  //checking for todo
  if (!task || !token || !owner_id) {
    return res
      .status(400)
      .send({ status: "error", msg: "All fields must be filled" });
  }
  try {
    const timestamp = Date.now();

    //creating a new document
    let todo = new Todo();
    todo.description = description;
    todo.task = task;
    todo.timestamp = timestamp;
    todo.owner_id = owner_id;

    //verifying token
    let user = jwt.verify(token, process.env.JWT_SECRET);

    todo = await todo.save();
    return res.status(200).send({
      status: "ok",
      msg: "Success you just created a new todo",
      todo,
    });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ status: "400", msg: "Todo file not created", e });
  }
});

// //delete one todo
router.post("/delete_todo", async (req, res) => {
  const { post_id, token } = req.body;
  if (!post_id) {
    return res.status(400).send({ status: "error", msg: "Fill in _id" });
  }
  try {
    let verify = jwt.verify(token, process.env.JWT_SECRET);

    //Deletes a particular field

    const delete_post = await Todo.deleteOne({ _id: post_id });

    //checking for the post
    if (!delete_post) {
      return res.status(400).send({ status: "error", msg: "Todo not found" });
    }
    return res.status(200).send({ status: "deleted successfully" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ status: "error", msg: "Unable to delete use ", e });
  }
});

//edit post
router.post("/edit_todo", async (req, res) => {
  const { owner_id, token, post_id, description, task } = req.body;

  //checking for fields
  if (!owner_id || !token || !post_id) {
    return res
      .status(400)
      .send({ status: "error", msg: "All fields must be filled" });
  }

  try {
    const timestamp = new Date();
    let verify = jwt.verify(token, process.env.JWT_SECRET);

    let edit = await Todo.findOne({ _id: post_id });
    if (!edit) {
      return res
        .status(400)
        .send({ status: "error", msg: "Unable to edit post" });
    }

    edit = await Todo.findOneAndUpdate(
      { _id: post_id },
      {
        description: description || edit.description,
        task: task || edit.task,
        edited_at: timestamp,
        edited: true,
      },
      { new: true }
    ).lean();
    return res.status(200).send({ status: "Succes", msg: "Sucsess", edit });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", msg: "Some error occured" });
  }
});

router.post("/all_user_post", async (req, res) => {
  const { token, user_id } = req.body;

  if (!token || !user_id)
    return res
      .status(400)
      .send({ status: "error", msg: "All fields must be filled" });

  try {
    // token verification
    const user = jwt.verify(token, process.env.JWT_SECRET);

    const post = await Todo.find({ owner_id: user_id })
      .select(["description", "task", "post_id"])

      .lean();
    // user.id === user_id
    console.log(post);

    return res
      .status(200)
      .send({ status: "ok", msg: "Posts gotten successfully", post });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ status: "error", msg: "Some error occurred" });
  }
});

router.post("/completed_task", async (req, res) => {
  const { post_id, owner_id, token } = req.body;

  //checking for required fields
  if (!post_id || !owner_id || !token) {
    return res
      .status(400)
      .send({ status: "error", msg: "All fields must be filled" });
  }
  try {
    //verifying token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    const timestamp = Date.now();
    const post = await Todo.findOneAndUpdate(
      { _id: post_id },
      {
        timestamp: timestamp,
        completed: true,
      },
      { new: true }
    ).lean();
    return res
      .status(200)
      .send({ status: "success", msg: "task completed", post });
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", msg: "Task not completed" });
  }
});

//All_completed_task
router.post("/all_completed_task", async (req, res) => {
  const { token, owner_id,completed} = req.body;

  //checking for required fields
   if(!token || owner_id)
  try {

    //verifying token
    const user = jwt.verify(token, process.env.JWT_SECRET);
    
    let todo = new Todo();
    todo.completed = completed;

    let complete = await Todo.findOneAndUpdate({owner_id, completed: completed}).lean();
        if(completed === true)
        return complete ;

    return res.status(200).send({status:"success", msg:"All Completed task",complete})
  } catch (e) {
    console.log(e);
    return res.status(400).send({ status: "error", msg: "No Completed tasks" });
  }
});
module.exports = router;
