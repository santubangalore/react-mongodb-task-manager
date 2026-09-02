const { string } = require("joi");
const mongoose = require ("mongoose");

const userSchema= new mongoose.Schema({
    name: String,
    email : String,
    password: String,

});


const User= mongoose.models.User|| mongoose.model("User",userSchema);

module.exports = User;
