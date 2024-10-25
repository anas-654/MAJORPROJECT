const express=require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const {isLoggedIn, isOwner,validateListing}=require("../middleware.js");

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get("/", wrapAsync(async (req, res) => {
const allListings = await Listing.find({});
  res.render("index.ejs", {allListings});
}));



// New Route->
router.get("/new",isLoggedIn, wrapAsync(async (req, res) => {
   
    res.render("new.ejs");
}));

// Show route->
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let lists = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author"
        },
    })
    .populate("owner");
    if(!lists){
        req.flash("error","Listing does not exists");
        res.redirect("/listings");
      }
      console.log(lists);
    res.render("show.ejs", { listing: lists });
   
}));

// Create New Route
router.post("/",validateListing, wrapAsync(async (req, res, next) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Please send valid data!");
    }
    
    const listing2 =new Listing(req.body.listing);
    listing2.owner=req.user._id;
    await listing2.save();

    req.flash("success","New Listing Created");
    res.redirect("/listings");


}));

// Edit Route->
router.get("/:id/edit",isLoggedIn,
    isOwner, 
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listings = await Listing.findById(id);
  if(!listings){
    req.flash("error","Listing does not exists");
    res.redirect("/listings");
  }
    res.render("edit.ejs", { listing: listings });
    
}));

// Update Route
router.put("/:id",
    validateListing,
    isLoggedIn,
    isOwner, 
    wrapAsync(async (req, res) => {
    if (!req.body.listing) {
        throw new ExpressError(400, "Please send valid data!");
    }
    let {id} = req.params;
    let listing=await Listing.findById(id);
    
   await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   req.flash("success"," Listing Updated");
    res.redirect(`/listings/${id}`);
   
}));

// Delete route
router.delete("/:id",isLoggedIn, 
    isOwner, 
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success"," Listing Deleted");
    res.redirect("/listings");
}));

module.exports=router;