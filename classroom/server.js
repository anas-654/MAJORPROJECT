const express = require("express");
const app = express();
 const users=require("./routes/user");
 const posts=require("./routes/post");
const path=require("path");
const session=require("express-session");

const flash=require("connect-flash");

const sessionoptions={
    secret:"mysupersecretstring",
    resave:false,
    saveUninitialized:true
 };
app.use(session(sessionoptions));
app.use(flash());
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use((req,res,next)=>{
    res.locals.errorMsg=req.flash("error");
    res.locals.successMsg=req.flash("success");
    res.locals.name=req.flash("naming");
    next();
})
 app.get("/register",(req,res)=>{
    let {name="anonymous"}=req.query;
    if(name=="anonymous"){
        req.flash("error","user not registered");
    }
    else{
        req.flash("success","user registered successfully");
    }
  
   req.flash("naming",`${name}`);
    res.redirect("/hello");
 });

 app.get("/hello",(req,res)=>{
 res.render("page.ejs");
 });



app.listen(3000,()=>{
    console.log("server is listening on port 3000");
});