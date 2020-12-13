const express = require("express");
const productsRoute = require("./services/products");
const cartRoute = require("./services/cart");
require("dotenv").config();
const server = express();
const cors = require("cors");
server.use(cors());
server.use(express.json());
server.use("/products", productsRoute);
server.use("/cart", cartRoute);

server.listen(process.env.PORT, () => {
  console.log("Running on port " + process.env.PORT);
});
