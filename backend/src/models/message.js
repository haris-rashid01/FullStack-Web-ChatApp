import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recieverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, 
    text: String,
    image: String,
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
