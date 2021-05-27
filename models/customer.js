const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customerSchema  = new Schema({
  name : String,
  email : String,
  balance : Number
},{timestamps : true})

const Customer = mongoose.model('Customer', customerSchema)

module.exports = Customer;
