const mongoose = require("mongoose");



const campgroundSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: [true, 'Please add a name']
    },
    price: {
        type: String,
        required: [true, 'Please add a price']
    },
    image: [{
        url: String,
        filename: String,
    }],
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    location:  {
        type: String,
        required: [true, 'Please add a location']
    },
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






module.exports = mongoose.model("Campground", campgroundSchema, "Campground")