const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname : {
        type:String,
        required:true
    },
    lastname : {
        type:String,
        required:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    gender : {
        type:String,
        required:true
    },
    age : {
        type:Number,
        required:true
    },
    phone : {
        type:Number,
        required:true,
        unique:true
    },
    password : {
        type:String,
        required:true
    },
    confirmpassword : {
        type:String,
        required:true
    },
    imageName:{
        type:String
    },
    addpost:{
        type:String
    }

    
})

const Register = new mongoose.model("Register",userSchema);

module.exports = Register;