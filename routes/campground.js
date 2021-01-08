const express = require("express")
const router = express.Router()
const Campground_Model = require("../models/campground_export")
const Comment = require("../models/comment_export");
const Review = require("../models/review");
const Middleware = require("../middleware/index")
const {
    cloudinary
} = require("../utils/cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_API_KEY;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });



//**INDEX ROUTE - DISPLAY ALL CAMPGROUNDS
//** @route  /campground
//** @access  Public

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



//**RENDER NEW CAMP
//** @route  /campground/new
//** @access  Private
router.get("/new", Middleware.isLogggedIn, function (req, res) {
    res.render("campground/new")
})




//**CREATE ROUTE - ADD NEW CAMPGROUND
//** @route  /campground
//** @access  Private
router.post("/", Middleware.uploads, async function (req, res) {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.camp.location,
        limit: 1
    }).send()
    const addCamp = new Campground_Model(req.body.camp)
    addCamp.geometry = geoData.body.features[0].geometry;
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



//**SHOW CAMP
//** @route  /campground/:ID
//** @access  Public
router.get("/:id", function (req, res) {
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
    }).exec((err, foundCamp) => { //*populate merujuk ke obj di schema
        if (err || !foundCamp) { //*handle error jika data tdk ketemu
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

//**RENDER EDIT CAMP
//** @route  /campground/:ID/edit
//** @access  Private
router.get("/:id/edit", Middleware.checkCampOwner, function (req, res) {
    Campground_Model.findById(req.params.id, (err, found) => {
        res.render("campground/edit", {
            edit_ejs: found
        })
    });
});



//**UPDATE CAMP
//** @route  /campground/:ID
//** @access  Private
router.put("/:id", Middleware.ValidateImage, async function (req, res) {

    const campground = await Campground_Model.findByIdAndUpdate(req.params.id, req.body);
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    campground.geometry = geoData.body.features[0].geometry;
    campground.image.push(...imgs);
    await campground.save();
    console.log("Campground Updated via Cloudinary")
    req.flash("success", "Successfully Updated!");
    res.redirect(`/campground/${campground._id}`)
})


//**DELETE CAMP
//** @route  /campground/:ID
//** @access  Private
router.delete("/:id", Middleware.checkCampOwner, function (req, res) {

    Campground_Model.findById(req.params.id, async function (err, deleteCamp) {

        try {

            //* deletes all comments associated with the campground
            Comment.deleteOne({
                "_id": {
                    $in: deleteCamp.comment
                }
            }, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campground");
                }
                console.log("Comment Deleted from Campground");
            })

            //* deletes all reviews associated with the campground
            Review.deleteOne({
                "_id": {
                    $in: deleteCamp.reviews
                }
            }, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                console.log("Review Deleted from Campground");

            })
            //*  delete image
            for (const x of deleteCamp.image) {
                console.log(x)
                await cloudinary.uploader.destroy(x.filename)
            }

            //*  delete the campground
            await deleteCamp.remove();
            req.flash("success", "Campground deleted successfully!");
            res.redirect("/campground");

        } catch (err) {
            console.log(err)
            req.flash("error", err.message);
            return res.redirect("back");
        }

    });
});


//**DELETE PHOTO CLIENT SIDE
//** @route  /campground/:ID/:cloudinaryFolder/:imageId
//** @access  Private

router.post("/:id/KostKita/:imageid", async function (req, res) {
    try {
        const camp = await Campground_Model.findById(req.params.id)
        const file = `KostKita/${req.params.imageid}`

        //*destroy in local
        await camp.updateOne({
            $pull: {
                image: {
                    filename: file
                }
            }
        })
        //*destroy in cloud
        await cloudinary.uploader.destroy(file)
        console.log(`${file} Deleted...`)
    } catch (err) {
        console.log(err)
    }
})



//**LIKE BUTTON
//** @route  /campground/:ID/Like
//** @access  Private

router.post("/:id/like", Middleware.isLogggedIn, function (req, res) {
    Campground_Model.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campground");
        }

        //* check if req.user._id exists in foundCampground.likes
        const userAlreadyLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (userAlreadyLike) {
            //* user already liked, removing like
            foundCampground.likes.pull(req.user._id);
            console.log(`total likes ${foundCampground.likes.length}`)
            foundCampground.save()
            return res.redirect("/campground/" + foundCampground._id);
        } else {
            //* adding the new user like
            foundCampground.likes.push(req.user);
            console.log(`total likes ${foundCampground.likes.length}`)
            foundCampground.save()
            return res.redirect("/campground/" + foundCampground._id);
        }

    });
});

module.exports = router;