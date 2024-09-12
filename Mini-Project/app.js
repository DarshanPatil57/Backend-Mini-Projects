const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const jwt = require("jsonwebtoken")

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/profile", isLoggedIn, async function (req, res) {

    let user = await userModel.findOne({email:req.user.email}).populate("posts")  
    res.render("profile" ,{user})
});


app.post("/post", isLoggedIn, async function (req, res) {
  let user = await userModel.findOne({email:req.user.email})
  let {content} = req.body

 let post = await postModel.create({
    user:user._id,
    content
  })

  user.posts.push(post._id)
   await user.save()
   res.redirect("/profile")
});


//   REGISTER

app.post("/register", async function (req, res) {
  let { name, username, email, password, age } = req.body;

  let userexist = await userModel.findOne({ email });
   if(userexist) return res.status(300).send("User already registered")

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        name,
        username,
        email,
        password: hash,
        age,
      });
      let token = jwt.sign({email:email, userid:user._id},"abcd") 
      res.cookie("token" ,token)
      res.send("Registered")
    });
  });
});

// LOGIN

app.post("/login", async function (req, res) {
    let {  email, password  } = req.body;
  
    let userexist = await userModel.findOne({ email });
     if(!userexist) return res.status(500).send("Something went wrong")

        bcrypt.compare(password, user.password ,function(err,result){
            if(result){ 
                let token = jwt.sign({email:email, userid:user._id},"abcd") 
                res.cookie("token" ,token)
                res.status(200).redirect("/profile")
            }
                else res.redirect("/login")
        })
});

app.get("/logout", function (req, res) {
    res.cookie("token","")
    res.send("Logout Successfull")
    res.redirect("/login");
});


// PROTECTED ROUTES
function isLoggedIn(req,res,next){
    if(req.cookies.token === "") res.send("You must be Logged In ")
    // if(req.cookies.token === "") res.redirect("/login")
    else{
        let data = jwt.verify(req.cookies.token,"abcd")
        req.user(data)
        next()
    }
}


app.listen(3000, console.log("Listning"));
