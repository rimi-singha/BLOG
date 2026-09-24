require("dotenv").config();
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const Blog = require("./models/blog");

const { checkForAuthentication } = require("./middleware/auth");
const app = express();
const PORT =process.env.PORT||8000;

mongoose
    .connect(process.env.MONGO_URL)
    .then((e) => console.log("MongoDB Connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthentication("token"));
app.use(express.static(path.resolve('./public')));

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.get("/", async (req, res) => {
    const allBlogs = await Blog.find({});
    return res.render("home", {
        user: req.user,
        blogs: allBlogs,
    });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);


app.listen(PORT, () => {
    console.log(`Server Started at PORT:${PORT}`);
});
