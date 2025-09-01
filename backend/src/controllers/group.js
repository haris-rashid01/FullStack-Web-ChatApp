import cloudinary from "../lib/cloudinary.js";
import Group from "../models/group.js";
import Message from "../models/message.js";
import { io } from "../lib/socket.js";

export const createGroup = async (req, res) => {
  const { name, admin, members } = req.body;
  const group = await Group.create({
    name,
    admin: req.user.id,
    members: [admin, ...members],
  });
  res.json(group);
};

export const addMember = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await Group.findByIdAndUpdate(
    groupId,
    { $addToSet: { members: userId } },
    { new: true }
  );
  res.json(group);
};

export const removeMember = async (req, res) => {
  const { groupId, userId } = req.body;
  const group = await Group.findByIdAndUpdate(
    groupId,
    { $pull: { members: userId } },
    { new: true }
  );
  res.json(group);
};

export const getUserGroups = async (req, res) => {
  const { id } = req.params;
  const groups = await Group.find({ members: id }).populate("members");
  res.json(groups);
};

export const getGroupMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const messages = await Message.find({ groupId: id }).populate(
      "senderId",
      "fullName profilePic"
    );
    res.status(200).json(messages);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: "Server error fetching group messages" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId: id,
      text,
      image: imageUrl,
    });
    await newMessage.save();

    res.status(201).json(newMessage);
    io.to(id).emit("receiveGroupMessage", newMessage);
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ msg: "Internal Server error from sendGroupMessage" });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id; 
    const userId = req.user.id;

    const group = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } }, 
      { new: true }
    );

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({ message: "You left the group", group });
  } catch (err) {
    res.status(500).json({ message: "Error leaving group", error: err.message });
  }
};
