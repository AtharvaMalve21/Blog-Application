const express = require("express");
const dotenv = require("dotenv");
const expressLayout = require("express-ejs-layouts");
const cookieParser = require("cookie-parser") ;
const methodOverride = require("method-override") ;

const MongoStore = require('connect-mongo') ;

const connectDB = require("./server/config/db");
const session = require("express-session");
const {isActiveRoute} = require("./server/helpers/routeHelper") ;

dotenv.config();

const app = express();

const PORT = 5000 || process.env.PORT;


//Connect to DB
connectDB();
app.use(express.urlencoded({extended:true})) ;
app.use(express.json());
app.use(cookieParser());

app.use(methodOverride('_method')) ;

app.use(session(
  {
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    store:MongoStore.create(
      {
        mongoUrl: process.env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60,
      }
    ),
   
  }
))

app.use(express.static("public"));

//templating Engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");


app.locals.isActiveRoute = isActiveRoute ;

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
