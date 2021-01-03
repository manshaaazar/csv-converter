const express = require("express"),
  http = require("http"),
  compression = require("compression"),
  helmet = require("helmet"),
  path = require("path"),
  handlebars = require("express-handlebars"),
  { json, urlencoded } = require("body-parser"),
  cors = require("cors"),
  dotenv = require("dotenv");

const app = express(),
  server = http.createServer(app);
dotenv.config();
// initializng the middlewares
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
// initializing the database

// importing and initializing the routes
const rootRoute = require("./routes/main");
app.get("/", (req, res, next) => {
  res.render("home");
});
app.use("/api/", rootRoute);
PORT = process.env.PORT || 3000;
server.listen(PORT, function () {
  console.log(`Server is listening on PORT:${PORT}`);
});
