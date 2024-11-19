const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";

const authMiddleWare = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_Secret);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJS, Express & MongoDB.",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});

//Check Login

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(req.body) ;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_Secret
    );
    res.cookie("token", token, { httpOnly: true });

    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

router.get("/dashboard", authMiddleWare, async (req, res) => {
  const locals = {
    title: "Dashboard",
    description: "Simple Blog created with NodeJs, Express & MongoDB",
  };

  try {
    const data = await Post.find({});
    res.render("admin/dashboard", {
      locals,
      data,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/add-post", authMiddleWare, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDB",
    };
    //   const data = await Post.find({});
    res.render("admin/add-post", {
      locals,
      layout: adminLayout,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/add-post", authMiddleWare, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
    });

    await Post.create(newPost);

    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

//Admin Register

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log(req.body) ;
    const hashPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({
        username,
        password: hashPassword,
      });
      res.status(200).json({
        success: true,
        data: user,
        message: "New user created!",
      });
    } catch (err) {
      if (err.code === 11000) {
        res.status(409).json({
          success: false,
          data: err.message,
          message: "User already in use",
        });
      }
      res.status(500).json({
        success: false,
        data: err.message,
        message: "Internal server error",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/edit-post/:id", authMiddleWare, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Simple Blog created with NodeJs, Express & MongoDB",
    };
    const data = await Post.findOne({ _id: req.params.id });

    res.render("admin/edit-post", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (err) {
    console.log(err);
  }
});

router.put("/edit-post/:id", authMiddleWare, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
});

router.delete("/delete-post/:id", authMiddleWare, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/") ;

});

module.exports = router;
