const express = require("express");
// importing handler for the root path.
const { rootHandler } = require("./handler/rootHandler.js");
// configure .env file
require("dotenv").config();

// creating express instance.
const app = express();

// route for root path. || "\"
app.get("/", rootHandler);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`server is running ${port}`);
});
