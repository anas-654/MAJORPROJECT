const Listing=require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js"); 


module.exports.isLoggedIn= async(req,res,next)=>{
if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
req.flash("error","You must be logged in to create listings");
return res.redirect("/login");
    }
    next();

}

module.exports.saveRedirectUrl=async(req,res,next)=>{
if(req.session.redirectUrl){
    res.locals.redirectUrl= req.session.redirectUrl;
}
next();
}

module.exports.isOwner=async(req,res,next)=>{
    let {id} = req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing");
        return  res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports. validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    } else {
        next();
    }
};


