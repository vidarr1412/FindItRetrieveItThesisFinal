const mongoose = require("mongoose");
const { MdDescription } = require("react-icons/md");

const complaintSchema = new mongoose.Schema({
  complainer: { type: String, required: true },
  itemname: { type: String, required: true },
  type: { type: String, required: true },
  contact: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  time: { type: String, required: true },
description: { type: String, required: true },
  status: { type: String, default: "Not Found" },
  finder: { type: String, default: "N/A" },
 userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Store the userId
});

module.exports = mongoose.model("Complaint", complaintSchema);
