import User from "../models/users.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { email, fullName, password } = req.body;

  try {
      if (!email || !fullName || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password length should be at least 6" });
    }


    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ msg: "Invalid user data entered" });
    }
  } catch (err) {
    console.log("error in signup controller", err.message);
    res.status(500).json({ msg: "Error in signup controller" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword)
      return res.status(400).json({ msg: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.log("Error in login controller", err.message);
    res.status(500).json({ msg: "Internal error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ msg: "Logged out successfully" });
  } catch (err) {
    console.log("error in logout controller", err.message);
    res.status(500).json({ msg: "Internal server error" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ msg: "Profile pic not found" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updateUser);
  } catch (err) {
    console.log("Error occured in profile auth: ", err.message);
    return res.status(500).json({ msg: "Unable to access profile " });
  }
};

export const checkAuth = async(req, res) => {
  try {    
    res.status(200).json(req.user);    
  } catch (err) {
    console.log("Error occured", err.message);
    res.status(500).json({ msg: "Check auth error" });
  }
};
