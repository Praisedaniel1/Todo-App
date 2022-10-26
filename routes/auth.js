const express = require("express");
const User = require("../model/user");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// signup endpoint
router.post("/signup", async (req, res) => {
  const { email, password: plainTextPassword, phone, fullname } = req.body;

  // checks
  if (!email || !plainTextPassword || !phone || !fullname) {
    return res
      .status(400)
      .send({ status: "error", msg: "All fields should be filled" });
  }

  //check for email
  const valid = /@gmail.com/.test(email);
  if (!valid) {
    return res
      .status(400)
      .send({ status: "error", msg: "Enter a valid email" });
  }
  try {
    // get timestamp~
    const timestamp = Date.now();
    // encrpt password
    const password = await bcrypt.hash(plainTextPassword, 10);

    // create user document
    let user = new User();
    user.email = email;
    user.password = password;
    user.username = `${email}_${timestamp}`;
    // save document on mogodb
    user = await user.save();

    return res.status(200).send({ status: "ok", msg: "User created", user });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ status: "error", msg: "Some error occured", e });
  }
});

// login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // checks
  if (!email || !password) {
    return res
      .status(400)
      .send({ status: "error", msg: "All fields should be filled" });
  }

  try {
    const user = await User.findOne({ email: email }).lean();
    if (!user) {
      return res
        .status(404)
        .send({ status: "error", msg: `No user with email: ${email} found` });
    }

    if (bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        {
          _id: user.id,
          username: user.username,
        },
        process.env.JWT_SECRET
      );

      return res
        .status(200)
        .send({ status: "ok", msg: "Login successful", user, token: token });
    }

    if (user.password != password) {
      return res
        .status(400)
        .send({ status: "error", msg: "Email or Password incorrect" });
    }

    delete user.password;

  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ status: "error", msg: "Some error occured", e });
  }
});

// endpoint to delete a user
router.post("/delete_user", async (req, res) => {
  const { person_id } = req.body;

  // check for required field
  if (!person_id) {
    return res
      .status(400)
      .send({ status: "error", msg: "All fields should be filled" });
  }

  try {
    await User.deleteOne({ _id: person_id });

    return res.status(200).send({ status: "ok", msg: "delete successful" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ status: "error", msg: "Some error occured", e });
  }
});

// endpoint to change password

router.post("/change_password", async (req, res) => {
  const { email, password, token, new_password, confirm_new_password } =
    req.body;

  //All fields must be filled
  if (!email || !password || !token || !new_password || !confirm_new_password)
    return res
      .status(400)
      .send({ status: "error", msg: "All fields must be filled" });

  //check if old_password and new_password are the same
  if (password === new_password) {
    return res
      .status(400)
      .send({ status: "error", msg: "you cant use the same password " });
  }
  //confirming new and old password
  if (new_password !== confirm_new_password) {
    return res.status(400).send({ status: "wrong", msg: "bastard " });
  }
  console.log(new_password);
  try {
    let user = jwt.verify(token, process.env.JWT_SECRET);

    const password = await bcrypt.hash(new_password, 10);

    const change_password = await User.findOneAndUpdate(
      { email },
      { password },
      { new: true }
    );

    //deleting password
    delete change_password;
    return res.status(200).send({ staus: 200, msg: "Success" });
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .send({ status: "error", msg: "Check your code you have error" });
  }
});

router.post("/logout", async (req, res) => {
  const { token, user_id, isLoggedIn} = req.body;

  //All fields must be filled
  if (!token || !user_id) {
    return res
      .status(400)
      .send({ status: "error", msg: "Fill in all required details" });
  }
  try{
    //verifying token
    jwt.verify(token, process.env.JWT_SECRET);
    
    //timestamp
    const timestamp = new Date();
    
    //checking if user exists
    let user = await User.findOne({_id:user_id})
    if(!user){
      return res.status(400).send({status:"error", msg:"user not found"})
    }
    //update post document
    user = await User.findOneAndUpdate(
      {_id: user_id},
      {
        last_seen: timestamp,
        isLoggedIn : false
      }
    ).lean();
     return res.status(200).send({status:"Ok", msg:"Logged out successfully", user})
  }catch(e){
    console.log(e)
    return res.status(400).send({status:"error", msg:"Some error occured"})
  }
});
module.exports = router;
