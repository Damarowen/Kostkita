const express = require("express")
const router = express.Router()
const Campground_Model = require("../models/campground_export")
const Comment = require("../models/comment_export");
const Review = require("../models/review");
const Middleware = require("../middleware/index")
const {
    cloudinary
} = require("../utils/cloudinary");
var geocoder = require('../utils/geocoder');




//INDEX ROUTE - DISPLAY ALL CAMPGROUNDS
router.get("/", function (req, res) {

    Campground_Model.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err)
        } else {
            res.render("campground/index", {
                all_Campgrounds: allCampgrounds
            })
        }
    })
})
//XXX


//CREATE ROUTE - ADD NEW CAMPGROUND
// upload.single('image') as middleware
router.post("/", Middleware.uploads, async function (req, res) {

    const addCamp = new Campground_Model(req.body.camp)
    addCamp.image = await req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    // add author to campground
    addCamp.author = {
        id: req.user._id,
        username: req.user.username
    }
    console.log(addCamp)
    await addCamp.save()
        .then(() => req.flash("success", "Succesfully Added New Camp"))
        .then(() => res.redirect('/campground'))
        .catch(error => console.log(error.message));



});




//xxx

//NEW ROUTE - DISPLAY FORM TO MAKE NEW CAMP
router.get("/new", Middleware.isLogggedIn, function (req, res) {

    res.render("campground/new")
})


//SHOW ROUTE - DESCRIPTION PAGE
router.get("/:id", function (req, res) {
    //findById adalah method dari Mongoose
    Campground_Model.findById(req.params.id).populate('likes').
    populate({
        path: "comment",
        options: {
            sort: {
                updatedAt: -1
            }
        }
    }).
    populate({
        path: "reviews",
        options: {
            sort: {
                updatedAt: -1
            }
        }
    }).exec((err, foundCamp) => { //populate merujuk ke obj di schema
        if (err || !foundCamp) { //handle error jika data tdk ketemu
            req.flash("error", "Campground Not Found CAMGROUND")
            res.redirect("back")
            console.log(err)
        } else {
            res.render("campground/show", {
                show_camp: foundCamp
            })
        }
    })
})

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", Middleware.checkCampOwner, function (req, res) {
    Campground_Model.findById(req.params.id, function (err, foundCampground) {
        res.render("campground/edit", {
            edit_ejs: foundCampground
        });
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", Middleware.uploads, async function (req, res) {
    console.log(req.body)
    // const campground = await Campground_Model.findByIdAndUpdate(req.params.id, req.body);
    // const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // geocoder.geocode(req.body.location, async function (err, data) {
    //     if (err || !data.length) {
    //         req.flash('error', 'Invalid address');
    //         return res.redirect('back');
    //     }
    //     console.log(data[0])
    //     campground.lat = data[0].latitude;
    //     campground.lng = data[0].longitude;
    //     campground.location = data[0].formattedAddress;
    //     campground.image.push(...imgs);
    //     await campground.save();
    //     console.log("Campground Updated via Cloudinary")
    //     req.flash("success", "Successfully Updated!");
    //     res.redirect(`/campground/${campground._id}`)
    // })

})



router.delete("/:id", Middleware.checkCampOwner, function (req, res) {

    // delete req.body.campground.rating
    Campground_Model.findById(req.params.id, async function (err, deleteCamp) {
        if (!deleteCamp.imageId) {
            // delete camp without image upload
            Campground_Model.findByIdAndDelete(req.params.id, function (err) {
                if (err) {
                    req.flash("error", err.message)
                    res.redirect("/campground")
                }
                console.log("Camp Deleted");
            });

        }

        if (deleteCamp.imageId) {
            // delete camp with image upload
            try {
                await cloudinary.v2.uploader.destroy(deleteCamp.imageId);
                deleteCamp.remove();
            } catch (err) {

                req.flash("error", err.message);
                return res.redirect("back");

            } finally {
                console.log("Camp Deleted from Server Cloudinary");
            }
        }

        // deletes all comments associated with the campground
        Comment.deleteOne({
            "_id": {
                $in: deleteCamp.comment
            }
        }, function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campground");
            }
            console.log("Review Deleted from Campground");
        })

        // deletes all reviews associated with the campground
        Review.deleteOne({
            "_id": {
                $in: deleteCamp.reviews
            }
        }, function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            console.log("Comment Deleted from Campground");

        })
        //  delete the campground
        req.flash("success", "Campground deleted successfully!");
        res.redirect("/campground");
    });
});

router.post("/:id/KostKita/:imageid", async function (req, res) {
    try {
        const camp = await Campground_Model.findById(req.params.id)
        const x = camp.image
        x.deleteOne({
            "filename": `KostKita/${req.params.imageid}`
        }).then(result => console.log(`item ${result}`))
    } catch (err) {
        console.log(err)
    }
})

// Campground Like Route
router.post("/:id/like", Middleware.isLogggedIn, function (req, res) {
    Campground_Model.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campground");
        }

        // check if req.user._id exists in foundCampground.likes
        var userAlreadyLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (userAlreadyLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
            console.log(`total likes ${foundCampground.likes.length}`)
            foundCampground.save()
            return res.redirect("/campground/" + foundCampground._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
            console.log(`total likes ${foundCampground.likes.length}`)
            foundCampground.save()
            return res.redirect("/campground/" + foundCampground._id);
        }

    });
});

module.exports = router;