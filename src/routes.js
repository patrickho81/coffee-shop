const express = require("express");
const router = express.Router();
const path = require("path");
const { check, validationResult } = require("express-validator/check");
//const matchedData = require("express-validator");

const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });

const multer = require("multer");
//const upload = multer({ storage: multer.memoryStorage() });

// Set storage for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const fs = require("fs");
const data = fs.readFileSync("stores.json");
let stores = JSON.parse(data);
//console.log(stores["stores"]);

let menuData = fs.readFileSync("menus.json");
let menus = JSON.parse(menuData);
//console.log(menus);

//index list all stores
router.get("/", (req, res) => {
  res.render("index", {
    stores,
  });
});

//list menu items by store id
router.get("/store/:id/", (req, res) => {
  let id = req.params.id;

  let storeName = stores.filter((store) => store.id == id)[0];

  if (!storeName) {
    res.send("no Store with this ID");
  } else {
    storeName = storeName.name;
  }

  let storeMenu = menus.filter((menu) => menu.storeid == id);
  //console.log(storeMenu);
  if (storeMenu.length == 0) {
    res.send(
      "no item with this store yet, please add some <a href='/addmenu'>Add menu item</a>"
    );
  }

  res.render("store", {
    storeMenu,
    storeName,
  });
});

router.get("/admin", (req, res) => {
  res.render("admin");
});

//blank addstore form
router.get("/addstore", csrfProtection, (req, res) => {
  res.render("addstore", {
    data: {},
    errors: {},
    csrfToken: req.csrfToken(),
  });
});

//submit addstore form
router.post(
  "/addstore",
  upload.single("image"),
  csrfProtection,
  [
    check("store")
      .isLength({ min: 1 })
      .withMessage("Store name is required")
      .trim(),
    check("zipcode")
      .isLength({ min: 5, max: 5 })
      .withMessage("5 digits")
      .isNumeric()
      .withMessage("That zipcode doesn't look right")
      .trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("addstore", {
        data: req.body,
        errors: errors.mapped(),
        csrfToken: req.csrfToken(),
      });
    }

    //check how many stores and get new id
    var id = Object.keys(stores).length + 1;
    //console.log(id);

    //if no image uploaded, use default coffee.jpg
    var newStore = {
      id: id,
      name: req.body.store,
      zipcode: req.body.zipcode,
      status: req.body.status,
      image: req.file ? req.file.originalname : "coffee.jpg",
    };

    //add this new store to stores and save the json file
    stores.push(newStore);
    var storesJson = JSON.stringify(stores, null, 2);
    fs.writeFile("stores.json", storesJson, finished);

    function finished(err) {
      reply = {
        store: data.store,
        zipcode: data.zipcode,
        status: req.body.status,
        image: req.file ? req.file.originalname : "coffee.jpg",
        status: "success",
      };
      //  response.send(reply);
    }

    req.flash("success", "Shop added");
    res.redirect("/");
  }
);

//blank add menu item, pass in stores to create stores list drop down
router.get("/addmenu", csrfProtection, (req, res) => {
  res.render("addmenu", {
    data: {},
    errors: {},
    csrfToken: req.csrfToken(),
    stores,
  });
});

//submit add menu item
router.post(
  "/addmenu",
  upload.single("image"),
  csrfProtection,
  [
    check("name")
      .isLength({ min: 1 })
      .withMessage("Menu item name is required")
      .trim(),
    check("price")
      .isLength({ min: 1 })
      //.matches("[0-9]*(.[0-9][0-9])?")
      .isCurrency()
      .withMessage("That price doesn't look right")
      .trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("addmenu", {
        data: req.body,
        errors: errors.mapped(),
        csrfToken: req.csrfToken(),
        stores,
      });
    }

    var newMenu = {
      storeid: +req.body.store,
      name: req.body.name,
      price: req.body.price,
    };

    //add new menu item to menus.json file
    menus.push(newMenu);
    var menusJson = JSON.stringify(menus, null, 2);
    fs.writeFile("menus.json", menusJson, finished);

    function finished(err) {
      //console.log("all set.");
      reply = {
        storeid: req.body.store,
        name: req.body.name,
        price: req.body.price,

        status: "success",
      };
      //  response.send(reply);
    }

    req.flash(
      "success",
      `item added. You can add more on this page or visit your menu <a href='/store/${req.body.store}'>here</a>`
    );
    res.redirect("/addmenu");
  }
);

module.exports = router;
