const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  ITEM: String,
  DESCRIPTION: String,
  DATE_FOUND: String,
  TIME_RETURNED: String,  // Change this to String to store it as a time in string format
  FINDER: String,
  CONTACT_OF_THE_FINDER: String,
  FOUND_LOCATION: String,
  OWNER: String,
  DATE_CLAIMED: String,
  STATUS: String,
  IMAGE_URL:String,
});

const Item = mongoose.model('Item', itemSchema);


module.exports = Item;
