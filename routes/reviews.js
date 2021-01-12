const express = require("express"),
    Kost = require("../models/Kost"),
    router = express.Router({
        mergeParams: true
    }),
    Review = require("../models/Review"),
    middleware = require("../middleware/index")




//* Reviews Index
router.get("/", function (req, res) {
    Kost.findById(req.params.id).populate({
        path: "reviews",
        options: {
            sort: {
                 //* sorting the populated reviews array to show the latest first
                createdAt: -1
            }
        }
    }).exec(function (err, kost) {
        if (err || !kost) {
            req.flash("error", "sssssss");
            return res.redirect("back");
        }
        res.render("reviews/index", {
            kost: kost
        });
    });
});

//* Reviews New
router.get("/new", middleware.checkReviewExistence, function (req, res) {
    //* middleware.checkReviewExistence checks if a user already reviewed, 
    //* only one review per user is allowed
    Kost.findById(req.params.id, function (err, kost) {
        if (err || !kost) {
            console.log(err)
            req.flash("error", "Something Wrong on Reviews New Route");
            return res.redirect("back");
        }
        res.render("reviews/new", {
            kost: kost
        });

    });
});

//* Reviews Create
router.post("/", middleware.checkReviewExistence, function (req, res) {


    try {
        //*lookup kost using ID
        Kost.findById(req.params.id).populate("reviews").exec( async function (err, kost) {
            if (err || !kost) {
                console.log(err)
                req.flash("error", "Something wrong on Review Post Route");
                return res.redirect("back");
            }
            const new_review = await new Review(req.body.review)
            //*add author username/id and associated kost to the review
            new_review.author.id = req.user._id;
            new_review.author.username = req.user.username;
            new_review.kost = kost;
            //* save review
            await new_review.save();
            await kost.reviews.push(new_review);
            //* calculate the new average review for the kost
            kost.rating = calculateAverage(kost.reviews);
            await kost.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect(`/kost/${kost._id}`);;
        });

    } catch (err) {
        console.log(err)
        req.flash("error", err.message);
        return res.redirect("back");
    } finally {
      console.log("New Review Added !!")
    }
});

//* Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err || !foundReview) {
            console.log(err)
            req.flash("error", "Something wrong on Review Edit Route");
            return res.redirect("back");
        }
        res.render("reviews/edit", {
            kost_id: req.params.id,
            review: foundReview
        });
    });
});


//* Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {
        new: true
    }, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.send("ERROR 404");
        }
        Kost.findById(req.params.id).populate("reviews").exec(function (err, kost) {
            if (err || !kost) {
                console.log('err')
                req.flash("error", "Kost not existed");
                return res.redirect("back");
            }
            //* recalculate kost average
            kost.rating = calculateAverage(kost.reviews);
            //*save changes
            kost.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect(`/kost/${kost._id}`);
        });
    });
});


//* Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        //*delete review in kost first
        Kost.findByIdAndUpdate(req.params.id, {
            $pull: {
                reviews: req.params.review_id
            }
        }, {
            new: true
        }).populate("reviews").exec(async function (err, kost) {
            if (err) {
                console.log(err)
                req.flash("error", err.message);
                return res.redirect("back");
            }
            //* recalculate kost average
            kost.rating = calculateAverage(kost.reviews);
            await kost.save();
            req.flash("success", "Review deleted successfully.");
            res.redirect("/kost/" + req.params.id);
        });
    });
});


//*function 
function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    let sum = 0;
    reviews.forEach(val => {
        sum += val.rating;
    });
    return sum / reviews.length;
}

module.exports = router;