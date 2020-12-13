const express = require("express");
const path = require("path");
const router = express.Router();
const { readDB, writeDB } = require("../../utils");
const uniqid = require("uniqid");
const { writeFile } = require("fs-extra");
const multer = require("multer");
const upload = multer({});
const productsPath = path.join(__dirname, "products.json");
router.route("/").get(async (req, res, next) => {
  try {
    let products = await readJSON(productsPath);
    //console.log(req.query);
    for (key in req.query) {
      if (key === "price" && typeof req.query[key] === "object") {
        const priceQuery = req.query[key];

        for (priceKey in priceQuery) {
          console.log(priceKey, parseInt(priceQuery[priceKey]));
          switch (priceKey) {
            case "gt":
              products = products.filter(
                (product) =>
                  parseInt(product.price) > parseInt(priceQuery[priceKey])
              );
              break;
            case "lt":
              products = products.filter(
                (product) => product.price < parseInt(priceQuery[priceKey])
              );
              break;
            default:
              products;
          }
        }
      } else {
        products = products.filter((product) =>
          !product[key] ? product : product[key].toString() === req.query[key]
        );
      }
    }

    res.send(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
});
router.route("/:id").get(async (req, res, next) => {
  try {
    const products = await readDB(productsPath);
    const product = products.find((product) => product._id === req.params.id);
    if (product) {
      res.send(product);
    } else {
      res.status(404).send("Product not Found");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.route("/").post(async (req, res, next) => {
  try {
    const products = await readDB(productsPath);
    console.log(req.body);
    const newProduct = {
      ...req.body,
      _id: uniqid(),
    };
    products.push(newProduct);
    await writeDB(productsPath, products);
    res.send(newProduct);
  } catch (error) {
    console.log(error);
  }
});
router.route("/:id").put(async (req, res, next) => {
  try {
    const products = await readDB(productsPath);

    const updatedList = products.map((product) =>
      product._id === req.params.id
        ? { ...product, ...req.body, _id: product._id }
        : product
    );
    await writeDB(productsPath, updatedList);
    res.send(updatedList);
  } catch (error) {
    console.log(error);
  }
});

router.route("/:id").delete(async (req, res, next) => {
  try {
    const products = await readDB(productsPath);
    const updated = products.filter((product) => product._id !== req.params.id);
    await writeDB(productsPath, updated);
    res.send("ok");
  } catch (error) {
    console.log(error);
  }
});

router
  .route("/:id/upload")
  .post(upload.single("image"), async (req, res, next) => {
    console.log(req.body.name);
    const [name, extension] = req.file.mimetype.split("/");

    try {
      await writeFile(
        path.join(
          __dirname,
          `../../../public/img/products/${req.params.id}.${extension}`
        ),
        req.file.buffer
      );
      res.send("ok");
      console.log(req.file);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });

module.exports = router;
