var mongoose = require('mongoose')

var transactionSchema = new mongoose.Schema({
	groupID: String
	payer: String
	payee: String
	signature: String


})

module.exports = mongoose.model("Transaction", transactionSchema)