const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res)=>{
    try {
        const {name, email, password} = req.body;
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name, email, password: hashedPassword
        });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: "User registered successfully",
        });
    }catch(error){
        res.status(500).json({message: "Server Error"});
    }
};

exports.loginUser = async (req, res)=>{
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        //check if email exits
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        //check if password is correct
        if(!isMatch){
            return res.status(400).json({message: "Invalid email or password"});
        }
        //Generate JWT
        const token = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn : "7d"}
        );
        //send response
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token
        });


    }catch(error){
        res.status(500).json({message: "Server error"});
    }
};