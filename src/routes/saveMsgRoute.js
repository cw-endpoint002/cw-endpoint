const express = require("express");
const router = express.Router();
const axios = require("axios");
const { socketIo_endpoint } = require("../constant/endpoint");

const { authorize } = require("../middleware/auth");
const { save_message_to_db } = require("../controllers/saveMsg");

router.post("/saveMessage", authorize, async (req, res) => {
  try {
    const { receiver, message, timeStamp } = req.body;
    // console.log(receiver, message);
    const userId = req.userId;
    const receiverName = await save_message_to_db(
      receiver,
      message,
      timeStamp,
      userId
    );
    // console.log(result);

    // Send data to web Hook
    const feedback = await axios.post(
      `${socketIo_endpoint}/webhook/new_message`,
      receiverName
    );
    if (feedback.status === 200) {
      console.log(feedback.data.message);
      // console.log(feedback.status.statusText);
    }

    if (receiverName) {
      res.status(200).json({ message: "save message success" });
    }
  } catch (err) {
    res.status(500).send("interal server error");
    console.log("interal server error:", err.message);
    // console.log("Error saving message to db:", err, err.message);
  }
});

module.exports = router;
