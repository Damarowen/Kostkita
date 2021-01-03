var mongoose = require("mongoose");
var geocoder = require('../utils/geocoder');



var campgroundSchema = new mongoose.Schema({

    name: String,
    price: String,
    image: [{
        url: String,
        filename: String
    }],
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    rating: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})


// Middleware geocde & create location
// pre sebelum save
campgroundSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.location);
    console.log(this.likes.length)
    this.lat = loc[0].latitude;
    this.lng = loc[0].longitude;
    this.location = loc[0].formattedAddress;
    console.log(this.location)
    next();
});



module.exports = mongoose.model("Campground", campgroundSchema, "Campground")