const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);

app.get("/", (req,res)=>{
    res.send("PAWFECT API running");
});

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("MongoDB Connected");
        app.listen(2002, ()=>{
            console.log("Server running on port 2002");
        });
    })
    .catch((err)=>console.log(err));