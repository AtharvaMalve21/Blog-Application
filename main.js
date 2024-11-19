const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

//Routes

router.get("/", async (req, res) => {
  try {
    const locals = {
      title: "NodeJS Blog",
      description: "Simple Blog created with NodeJS, Express & MongoDB.",
    };

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    const count = await Post.count;
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute:'/',
    });
  } catch (err) {
    console.log(err);
  }
});

// router.get("/", async (req, res) => {
//   const locals = {
//     title: "NodeJS Blog",
//     description: "Simple Blog created with NodeJS, Express & MongoDB.",
//   };

//   try {
//     const data = await Post.find({});
//     res.render("index", { locals, data });
//   } catch (err) {
//     console.log(err);
//   }
// });

//Get By id Route

router.get("/post/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const data = await Post.findById(id);
    const locals = {
      title: data.title,
      description: "Simple Blog created with NodeJS, Express & MongoDB.",
      currentRoute:`/post/${id}`,
    };

    res.render("post", { locals, data });
  } catch (err) {
    console.log(err);
  }
});

//Post Route

router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Search",
      description: "Simple Blog created with NodeJS, Express & MongoDB.",
    };

    let searchTerm = req.body.searchTerm;

    const searchNodeSpecialChar = searchTerm.replace(/[^a-zA-z0-9]/g, "");

    const data = await Post.find({
      $or: [
        {
          title: { $regex: new RegExp(searchNodeSpecialChar, "i") },
          body: { $regex: new RegExp(searchNodeSpecialChar, "i") },
        },
      ],
    });

    res.render("search", {
      data,
      locals,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/about", (req, res) => {
  res.render("about",
    {
      currentRoute:'/about'
    }
  );
});

router.get("/contact", (req, res) => {
  res.render("contact",
    {
      currentRoute:'/contact'
    }
  );
});

// function insertPostData () {
//   Post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//     },
//     {
//       title: "Deployment of Node.js applications",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//     },
//     {
//       title: "Authentication and Authorization in Node.js",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//     },
//     {
//       title: "Understand how to work with MongoDB and Mongoose",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//     },
//     {
//       title: "build real-time, event-driven applications in Node.js",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//     },
//     {
//       title: "Discover how to use Express.js",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//     },
//     {
//       title: "Asynchronous Programming with Node.js",
//       body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//     },
//     {
//       title: "Learn the basics of Node.js and its architecture",
//       body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//     },
//     {
//       title: "NodeJs Limiting Network Traffic",
//       body: "Learn how to limit netowrk traffic."
//     },
//     {
//       title: "Learn Morgan - HTTP Request logger for NodeJs",
//       body: "Learn Morgan."
//     },
//   ])
// }
// insertPostData() ;

module.exports = router;