const mongoose = require("mongoose");
const geocoder = require('../utils/geocoder');



const campgroundSchema = new mongoose.Schema({

    name: String,
    price: String,
    image: [{
        url: String,
        filename: String
    }],
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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


// campgroundSchema.pre('save', function(req, res, next) {
//     if (this.image.length > 1) throw(" exceeds maximum array size (5)!");
//     req.flash('error', 'maximum reached')
//     res.redirect('back')
//     next();
// });




module.exports = mongoose.model("Campground", campgroundSchema, "Campground")