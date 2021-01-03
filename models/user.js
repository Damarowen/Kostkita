var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose")
    bcrypt = require('bcrypt')

var UserSchema = new mongoose.Schema ({

    username : String,
    password : String,
    email: String,
    avatar: String,
    isAdmin: { type : Boolean, default: false}

})

UserSchema.plugin(passportLocalMongoose)




module.exports = mongoose.model("User", UserSchema, "User");