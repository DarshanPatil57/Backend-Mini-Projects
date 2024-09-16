const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const post = require("./models/post");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/profile", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email }).populate("posts");
  res.render("profile", { user });
});

app.get("/like/:id", isLoggedIn, async function (req, res) {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user")

  if(post.likes.indexOf(req.user.userid) === -1){
    post.likes.push(req.user.userid)
  } else {
    post.likes.splice(post.likes.indexOf(req,user.userid),1)
  }
  await post.save()
  res.redirect("/profile");
});

app.get("/edit/:id", isLoggedIn, async function (req, res) {
  let post = await postModel.findOne({ _id: req.params.id })  ;
  res.render("edit",{post});
});


app.post("/update/:id", isLoggedIn, async function (req, res) {
 await postModel.findOneAndUpdate({ _id: req.params.id },{content:req.body.content});
  res.redirect("/profile");
});


app.post("/post", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;

  let post = await postModel.create({
    user: user._id,
    content,
  });

  if (!Array.isArray(user.posts)) user.posts = [];
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

// REGISTER
app.post("/register", async function (req, res) {
  let { name, username, email, password, age } = req.body;

  let userexist = await userModel.findOne({ email });
  if (userexist) return res.status(300).send("User already registered");

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return res.status(500).send("Error generating salt");

    bcrypt.hash(password, salt, async (err, hash) => {
      if (err) return res.status(500).send("Error hashing password");

      let user = await userModel.create({
        name,
        username,
        email,
        password: hash,
        age,
      });

      let token = jwt.sign({ email: email, userid: user._id }, "abcd");
      res.cookie("token", token);
      res.redirect("/login")
    });
  });
});

// LOGIN
app.post("/login", async function (req, res) {
  let { email, password } = req.body;

  let userexist = await userModel.findOne({ email });
  if (!userexist) return res.status(500).send("Something went wrong");

  bcrypt.compare(password, userexist.password, function (err, result) {
    if (result) {
      let token = jwt.sign({ email: email, userid: userexist._id }, "abcd");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else {
      res.redirect("/login");
    }
  });
});

// LOGOUT
app.get("/logout", function (req, res) {
  res.cookie("token", "");
  res.redirect("/login");
});

// PROTECTED ROUTES
function isLoggedIn(req, res, next) {
  if (!req.cookies.token || req.cookies.token === "") {
    return res.send("You must be logged in");
    // return res.redirect("/login"); // Optionally redirect to login
  } else {
    try {
      let data = jwt.verify(req.cookies.token, "abcd");
      req.user = data; // Correctly assign the user data to `req.user`
      next();
    } catch (err) {
      return res.status(401).send("Invalid token or token expired");
    }
  }
}

app.listen(3000, console.log("Listening on port 3000"));
