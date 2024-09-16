const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
  products: {
    type: Array,
    default: [],
  },
  pictures: String,
  gstnum: String,
});

module.exports = mongoose.model("admin", adminSchema);
