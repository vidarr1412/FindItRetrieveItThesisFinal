const mongoose = require('mongoose');

const RetrievalRequestSchema = new mongoose.Schema({
  name: String,
  description: String,
  contactNumber: String,
  id: String,
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Store the userId
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "Pending" },
});

const RetrievalRequest = mongoose.model('RetrievalRequest', RetrievalRequestSchema);
module.exports = RetrievalRequest;
