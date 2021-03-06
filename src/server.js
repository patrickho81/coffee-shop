const path = require("path");
const express = require("express");
const layout = require("express-layout");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
const helmet = require("helmet");
const routes = require("./routes");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const middlewares = [
  helmet(),
  layout(),
  express.static(path.join(__dirname, "public")),
  bodyParser.urlencoded({ extended: true }),
  cookieParser(),
  session({
    secret: "super-secret-key",
    key: "super-secret-cookie",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  }),
  flash(),
];
app.use(middlewares);

app.use("/", routes);

app.use((req, res, next) => {
  res.status(404).send("404 error");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("500 error");
});

app.listen(3000, () => {
  console.log("App running at http://localhost:3000");
});
