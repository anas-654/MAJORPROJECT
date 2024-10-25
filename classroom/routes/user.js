const express=require("express");
const router=express.Router();

// Index Route
router.get("/",(req,res)=>{
    res.send("GET for users");
});

// Show Route
router.get("/:id",(req,res)=>{
    res.send("GET for user id");
})

// POST Route
router.post("/",(req,res)=>{
    res.send("POST for users");
})
// DELETE Route
router.delete("/:id",(req,res)=>{
    res.send("DELETE for users");
})

module.exports=router;