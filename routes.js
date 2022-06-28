const express = require("express");
const router = express.Router();
const { getFigmaData } = require("./src/index");
router.post("/figma", async (req, res) => {
  const { fileId, nodeId } = req.body;
  try {
    if (!fileId || !nodeId) {
      return res.status(500).send({ error: "Invalid file id or node id" });
    }
    const video = await getFigmaData(fileId, nodeId);
    return res.status(201).send({ video });
  } catch (err) {
    return res.status(500).send({ error: err });
  }
});

module.exports = router;
