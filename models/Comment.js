const mongoose = require("mongoose")


const commentSchema = mongoose.Schema({

    text: {
        type: String
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    //* kost associated with the review
    kost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Kost"
    }
}, {
    //* if timestamps are set to true, mongoose assigns createdAt and updatedAt fields to your schema, the type assigned is Date.
    timestamps: true

})


//* const Book = mongoose.model(<model_name>, BookSchema, <collection_name>);

module.exports = mongoose.model("Comment", commentSchema, "Comment")