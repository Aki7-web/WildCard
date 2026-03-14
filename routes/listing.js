const express = require("express");
const router = express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const ExpressError= require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Listing= require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing}= require("../middleware.js");



//index route

router.get("/",wrapAsync(async(req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index",{allListings});
}));

//new route

router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new");
})

//create route

router.post("/",isLoggedIn ,validateListing, wrapAsync(async (req, res,next) => {
        let listingData = req.body.listing;
        // if image url is empty
        if (!listingData.image || listingData.image.url === "") {
        listingData.image = {
            url: "https://images.unsplash.com/photo-1586495985096-787fb4a54ac0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bWFsZGl2ZXN8ZW58MHx8MHx8fDA%3D",
            filename: "defaultimage"
        };
    }
    const newListing = new Listing(listingData);
    //console.log(req.user);
    newListing.owner= req.user._id;
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

//show route

router.get("/:id", wrapAsync(async(req, res)=>{
    let {id}= req.params;
    const listing= await Listing.findById(id).populate({path:"reviews", populate:{path: "author"}}).populate("owner");
    if(!listing){
         req.flash("error","Listing you requested, does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show",{listing});
    console.log(listing);

}));

//edit route

router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(async (req,res)=>{
     let {id}= req.params;
    const listing= await Listing.findById(id);
    if(!listing){
         req.flash("error","Listing you requested, does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit",{listing});
}));

//update route

router.put("/:id",isLoggedIn,isOwner, wrapAsync(async (req,res)=>{
    if(!req.body.listing){
                    throw new ExpressError(400,"Send valid data for listing");
                }
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});

      req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
}));

//delete route

router.delete("/:id",isLoggedIn,isOwner,wrapAsync(async(req,res)=>{
    let {id}= req.params;
    await Listing.findByIdAndDelete(id);
     req.flash("success","Listing Deleted!");
    res.redirect("/listings");
}));

module.exports= router;