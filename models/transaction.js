const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema  = new Schema({
  sender_id : mongoose.ObjectId,
  receiver_id : mongoose.ObjectId,
  sender_name : String,
  receiver_name : String,
  amount_transferred : Number
},{timestamps : true})

const Transaction = mongoose.model('Transaction', transactionSchema)

module.exports = Transaction;
