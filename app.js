// require from npm package
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const path = require("path");
const ejsMate = require("ejs-mate");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const session=require("express-session");
const flash=require("connect-flash");
// require from different files
const { listingSchema, reviewSchema } = require("./schema.js");
const Listing = require("./models/listing.js");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const User=require("./models/user.js");
const listingRouter=require("./routes/listing.js");
const userRouter=require("./routes/user.js");

main()
    .then(() => {
        console.log("Connected to db");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const sessionoptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true
    }
 };
 
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
const methodOverride = require("method-override");
const Review = require("./models/review.js");
const { isLoggedIn } = require("./middleware.js");
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.listen(8080, (req, res) => {
    console.log("server is listening on port 8080");
});



app.use(session(sessionoptions));
 app.use(flash());

 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

//  for flash 
 app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
res.locals.error=req.flash("error");
res.locals.currUser=req.user;
    next();
 })

// for authentication

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"abc@gmail.com",
//         username:"student-1"
//     })

//    let user1= await User.register(fakeUser,"helloworld");
// res.send(user1);
// })

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const errorMsg = error.details.map(el => el.message).join(",");
        throw new ExpressError(400, errorMsg);
    } else {
        next();
    }
};

const isReviewAuthor=async(req,res,next)=>{
    let {id,reviewId}=req.params;
    let review=await Review.findById(reviewId);
    if(review&&!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return  res.redirect(`/listings/${id}`);
    }

    next();
}
app.use("/listings",listingRouter);
app.use("/",userRouter);

// Review Post Route->
app.post("/listings/:id/reviews", 
    isLoggedIn,
    validateReview,
    wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
   
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New Review Created");
    res.redirect(`/listings/${req.params.id}`);
}));


// Delete Review route

app.delete("/listings/:id/reviews/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(async(req,res)=>{
let {id,reviewId}=req.params;
await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
await Review.findByIdAndDelete(reviewId);
req.flash("success"," Review Deleted");
res.redirect(`/listings/${id}`);
}));


app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});


