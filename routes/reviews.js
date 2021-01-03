var express = require("express"),
    Campground = require("../models/campground_export"),
    router = express.Router({
        mergeParams: true
    }),
    Review = require("../models/review"),
    middleware = require("../middleware/index")




// Reviews Index
router.get("/", function (req, res) {
    Campground.findById(req.params.id).populate({
        path: "reviews",
        options: {
            sort: {
                createdAt: -1
            }
        } // sorting the populated reviews array to show the latest first
    }).exec(function (err, campground) {
        if (err || !campground) {
            req.flash("error", "sssssss");
            return res.redirect("back");
        }
        res.render("reviews/index", {
            campground: campground
        });
    });
});

// Reviews New
router.get("/new", middleware.checkReviewExistence, function (req, res) {
    // middleware.checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed
    Campground.findById(req.params.id, function (err, campground) {
        if (err || !campground) {
            req.flash("error", "asuuuuuuu");
            return res.redirect("back");
        }
        res.render("reviews/new", {
            campground: campground
        });

    });
});

// Reviews Create
router.post("/", middleware.checkReviewExistence, function (req, res) {


    try {
        //lookup campground using ID
        Campground.findById(req.params.id).populate("reviews").exec( async function (err, campground) {
            if (err || !campground) {
                req.flash("error", "anying");
                return res.redirect("back");
            }
            var new_review = await new Review(req.body.review)
            //add author username/id and associated campground to the review
            new_review.author.id = req.user._id;
            new_review.author.username = req.user.username;
            new_review.campground = campground;
            // save review
            await new_review.save();
            await campground.reviews.push(new_review);
            // calculate the new average review for the campground
            campground.rating = calculateAverage(campground.reviews);
            //save campground
            await campground.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/campground/' + campground._id);;
        });

    } catch (err) {
        req.flash("error", err.message);
        return res.redirect("back");
    } finally {
      console.log("New Review Added !!")

    }

});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err || !foundReview) {
            req.flash("error", "ERROR 404");
            return res.redirect("back");
        }
        res.render("reviews/edit", {
            campground_id: req.params.id,
            review: foundReview
        });
    });
});


// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {
        new: true
    }, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.send("ERROR 404");
        }
        Campground.findById(req.params.id).populate("reviews").exec(function (err, campground) {
            if (err || !campground) {
                req.flash("error", "Camp Not Existed");
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/campground/' + campground._id);
        });
    });
});


// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        //delete review in campground first
        Campground.findByIdAndUpdate(req.params.id, {
            $pull: {
                reviews: req.params.review_id
            }
        }, {
            new: true
        }).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Review deleted successfully.");
            res.redirect("/campground/" + req.params.id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;