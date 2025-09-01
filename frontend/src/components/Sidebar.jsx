import React, { useEffect, useState } from "react";
import { useChat } from "../store/useChat";
import SidebarSkeleton from "../Skeletons/sidebarSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import {
  Users,
  MessageSquare,
  Plus,
  UserPlus,
  UserMinus,
  X,
} from "lucide-react";
import avatar from "../assets/avatar.png";

const Sidebar = () => {
  const {
    users,
    groups,
    getUsers,
    getGroups,
    isUsersLoading,
    isGroupsLoading,
    setSelectedChat,
    selectedChat,
    chatType,
    createGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    leaveGroup,
  } = useChat();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    getUsers();
    getGroups();
  }, []);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading || isGroupsLoading) return <SidebarSkeleton />;

  const toggleMemberSelection = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    await createGroup({ name: newGroupName, members: selectedMembers });
    setNewGroupName("");
    setSelectedMembers([]);
    setShowGroupModal(false);
  };

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Chats</span>
        </div>
        <button
          onClick={() => setShowGroupModal(true)}
          className="btn btn-xs btn-primary"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Online toggle */}
      <div className="mt-3 hidden lg:flex items-center gap-2 px-5">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
            className="checkbox checkbox-sm"
          />
          <span className="text-sm">Show online only</span>
        </label>
        <span className="text-xs text-zinc-500">
          ({Math.max(onlineUsers.length - 1, 0)} online)
        </span>
      </div>

      {/* Users list */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedChat(user, "private")}
            className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
              selectedChat?._id === user._id && chatType === "private"
                ? "bg-base-300 ring-1 ring-base-300"
                : ""
            }`}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || avatar}
                alt={user.fullName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
              )}
            </div>
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>

      {/* Groups list */}
      <div className="border-t border-base-300 mt-auto">
        <h4 className="p-3 font-medium hidden lg:block">Groups</h4>
        <div className="overflow-y-auto w-full py-3">
          {groups.map((group) => (
            <div
              key={group._id}
              className="flex items-center justify-between px-3"
            >
              <button
                onClick={() => setSelectedChat(group, "group")}
                className={`flex-1 flex items-center gap-3 p-2 hover:bg-base-300 transition-colors rounded ${
                  selectedChat?._id === group._id && chatType === "group"
                    ? "bg-base-300 ring-1 ring-base-300"
                    : ""
                }`}
              >
                <div className="mx-auto lg:mx-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <MessageSquare size={20} />
                </div>
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{group.name}</div>
                  <div className="text-sm text-zinc-400">
                    {group.members.length} members
                  </div>
                </div>
              </button>

              <div className="flex gap-1">
                <button
                  className="btn btn-xs"
                  onClick={() => {
                    setActiveGroup(group);
                    setShowMemberModal(true);
                  }}
                >
                  Manage
                </button>

                <button
                  className="btn btn-xs btn-warning flex items-center gap-1"
                  onClick={() => leaveGroup(group._id)}
                >
                  Leave
                </button>
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No groups</div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Create Group</h3>
              <button onClick={() => setShowGroupModal(false)}>
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="input input-bordered w-full mb-3"
            />
            <div className="max-h-40 overflow-y-auto">
              {users.map((user) => (
                <label key={user._id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user._id)}
                    onChange={() => toggleMemberSelection(user._id)}
                    className="checkbox checkbox-sm"
                  />
                  {user.fullName}
                </label>
              ))}
            </div>
            <button
              className="btn btn-primary mt-4 w-full"
              onClick={handleCreateGroup}
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMemberModal && activeGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">
                Manage Members - {activeGroup.name}
              </h3>
              <button onClick={() => setShowMemberModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {users.map((user) => {
                const isMember = activeGroup.members.includes(user._id);
                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between mb-2"
                  >
                    <span>{user.fullName}</span>
                    {isMember ? (
                      <button
                        className="btn btn-xs btn-error flex items-center gap-1"
                        onClick={() =>
                          removeMemberFromGroup(activeGroup._id, user._id)
                        }
                      >
                        <UserMinus size={14} /> Remove
                      </button>
                    ) : (
                      <button
                        className="btn btn-xs btn-success flex items-center gap-1"
                        onClick={() =>
                          addMemberToGroup(activeGroup._id, user._id)
                        }
                      >
                        <UserPlus size={14} /> Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
