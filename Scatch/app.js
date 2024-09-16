const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const path = require("path")

//models
const userModel = require("./models/userModel")
const productModel = require("./models/productModel")

//config
const db = require("./config/mongooseConnection")


//routers
const adminsRouter = require("./routes/adminsRouter")
const productsRouter = require("./routes/productsRouter")
const usersRouter = require("./routes/usersRouter")


app.set("view engine","ejs")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname,"public")))

//routes
app.use("/admins",adminsRouter)
app.use("/products",productsRouter)
app.use("/users",usersRouter)

app.listen(3000, console.log('Listning'));