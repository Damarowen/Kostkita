const express = require("express")
const router = express.Router()
const Kost = require("../models/Kost")
const Comment = require("../models/Comment");
const Review = require("../models/Review");
const Middleware = require("../middleware/index")
const {
    cloudinary
} = require("../utils/cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_API_KEY;
const geocoder = mbxGeocoding({
    accessToken: mapBoxToken
});



//**INDEX ROUTE - DISPLAY ALL KOST
//** @route  /KOST
//** @access  Public

router.get("/", function (req, res) {

    Kost.find({}, function (err, kost) {
        if (err) {
            console.log(err)
        } else {
            res.render("kost/index", {
                kost: kost
            })
        }
    })
})



//**RENDER NEW KOST
//** @route  /kost/new
//** @access  Private
router.get("/new", Middleware.isLogggedIn, function (req, res) {
    res.render("kost/new")
})




//**CREATE ROUTE - ADD NEW KOST
//** @route  /kost
//** @access  Private
router.post("/", Middleware.uploads, async function (req, res) {
    try {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.kost.location,
            limit: 1
        }).send()
        const addKost = new Kost(req.body.kost)
        addKost.geometry = geoData.body.features[0].geometry;
        addKost.image = await req.files.map(f => ({
            url: f.path,
            filename: f.filename
        }));
        // add author to kost
        addKost.author = {
            id: req.user._id,
            username: req.user.username
        }
        console.log(addKost)
        await addKost.save()
            .then(() => req.flash("success", "Succesfully Added New Kost"))
            .then(() => res.redirect('/kost'))
            .catch(error => console.log(error.message));
    } catch (err) {
        console.log(err)
    }



});



//**SHOW KOST
//** @route  /kost/:ID
//** @access  Public
router.get("/:id", function (req, res) {
    try{
        Kost.findById(req.params.id).populate('likes').
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
        }).exec((err, kost) => { //*populate merujuk ke obj di schema
            if (err || !kost) { //*handle error jika data tdk ketemu
                req.flash("error", "Kost not found")
                res.redirect("back")
                console.log(err)
            } else {
                res.render("kost/show", {
                    kost: kost
                })
            }
        })
    }
    catch(err){
        //* display error from mongoose validation
        console.log(err)
        req.flash("error", `error`);
        res.redirect(`back`)
    }
})

//**RENDER EDIT kost
//** @route  /kost/:ID/edit
//** @access  Private
router.get("/:id/edit", Middleware.checkKostOwner, function (req, res) {
    Kost.findById(req.params.id, (err, found) => {
        res.render("kost/edit", {
            edit_ejs: found
        })
    });
});



//**UPDATE KOST
//** @route  /kost/:ID
//** @access  Private
router.put("/:id", Middleware.ValidateImage, async function (req, res) {
try{
 
    const kost = await Kost.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    const imgs = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    kost.geometry = geoData.body.features[0].geometry;
    kost.image.push(...imgs);
    await kost.save();
    console.log("Kost Updated via Cloudinary")
    req.flash("success", "Successfully Updated!");
    res.redirect(`/kost/${kost._id}`)
}
    catch(err){
        // //* display error from mongoose validation
        // const message = Object.values(err.errors).map(val => val);
        console.log(err)
        req.flash("error", `err`);
        res.redirect(`back`)
    }
})


//**DELETE KOST
//** @route  /kost/:ID
//** @access  Private
router.delete("/:id", Middleware.checkKostOwner, function (req, res) {

    Kost.findById(req.params.id, async function (err, kost) {

        try {

            //* deletes all comments associated with the kost
            Comment.deleteOne({
                "_id": {
                    $in: kost.comment
                }
            }, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/kost");
                }
                console.log("Comment Deleted from Kost");
            })

            //* deletes all reviews associated with the kost
            Review.deleteOne({
                "_id": {
                    $in: kost.reviews
                }
            }, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/kost");
                }
                console.log("Review Deleted from Kost");

            })
            //*  delete image
            for (const x of kost.image) {
                console.log(x)
                await cloudinary.uploader.destroy(x.filename)
            }

            //*  delete kost
            await kost.remove();
            req.flash("success", "Kost deleted successfully!");
            res.redirect("/kost");

        } catch (err) {
            console.log(err)
            req.flash("error", err.message);
            return res.redirect("back");
        }

    });
});


//**DELETE PHOTO CLIENT SIDE
//** @route  /kost/:ID/:cloudinaryFolder/:imageId
//** @access  Private

router.post("/:id/KostKita/:imageid", async function (req, res) {
    try {
        const kost = await Kost.findById(req.params.id)
        const file = `KostKita/${req.params.imageid}`

        //*destroy in local
        await kost.updateOne({
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
        req.flash("error", err.message);
        return res.redirect("back");
    }
})



//**LIKE BUTTON
//** @route  /kost/:ID/Like
//** @access  Private

router.post("/:id/like", Middleware.isLogggedIn, function (req, res) {
    try {
        Kost.findById(req.params.id, function (err, kost) {
            if (err) {
                console.log(err);
                return res.redirect("/kost");
            }
    
            //* check if req.user._id exists in kost.likes
            const userAlreadyLike = kost.likes.some(function (like) {
                return like.equals(req.user._id);
            });
    
            if (userAlreadyLike) {
                //* user already liked, removing like
                kost.likes.pull(req.user._id);
                console.log(`total likes ${kost.likes.length}`)
                kost.save()
                return res.redirect("/kost/" + kost._id);
            } else {
                //* adding the new user like
                kost.likes.push(req.user);
                console.log(`total likes ${kost.likes.length}`)
                kost.save()
                return res.redirect("/kost/" + kost._id);
            }
    
        });
    } catch(err){
        console.log(err)
        req.flash("error", err.message);
        return res.redirect("back");
        
    }
   
});

module.exports = router;