const express = require("express");
const createServer = require("./server"); // new

const app = createServer(); // new
app.listen(5000, () => {
  console.log("Server has started!");
});
