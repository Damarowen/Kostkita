const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose")
    bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema ({

    username : String,
    password : String,
    email: String,
    avatar: String,
    isAdmin: { type : Boolean, default: false}

})

UserSchema.plugin(passportLocalMongoose)




module.exports = mongoose.model("User", UserSchema, "User");