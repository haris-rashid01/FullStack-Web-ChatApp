import React from "react";
import { useChat } from "../store/useChat";
import { useAuthStore } from "../store/useAuthStore";
import { X, Users } from "lucide-react";
import avatar from "../assets/avatar.png";

const ChatHeader = () => {
  const { selectedChat, setSelectedChat, chatType } = useChat();
  const { onlineUsers } = useAuthStore();

  if (!selectedChat) return null;

  const isOnline =
    chatType === "private"
      ? onlineUsers.includes(selectedChat._id)
      : null;

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              {chatType === "private" ? (
                <img
                  src={selectedChat.profilePic || avatar}
                  alt={selectedChat.fullName}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <Users size={20} />
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-medium">
              {chatType === "private"
                ? selectedChat.fullName
                : selectedChat.name}
            </h3>
            {chatType === "private" ? (
              <p className="text-sm text-base-content/70">
                {isOnline ? "Online" : "Offline"}
              </p>
            ) : (
              <p className="text-sm text-base-content/70">
                Group chat ({selectedChat.members.length} members)
              </p>
            )}
          </div>
        </div>

        <button onClick={() => setSelectedChat(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
