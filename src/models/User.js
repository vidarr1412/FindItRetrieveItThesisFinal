const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, default:'' },
  lastName: { type: String, default:'' },
  usertype: { type: String, default: 'admin' }, // Default usertype as 'admin'
  image_Url:{type:String,default:''},
});

module.exports = mongoose.model('User', userSchema);
