const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/feedback", feedbackRoutes);

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