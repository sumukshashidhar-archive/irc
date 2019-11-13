var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
    DisplayName: String,
    password: String,
    userType: String,
    walletID: String
})

module.exports = mongoose.model("user", userSchema)