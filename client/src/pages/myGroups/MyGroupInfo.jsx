import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  HiUsers,
  HiUserPlus,
  HiUserMinus,
  HiShieldCheck,
  HiChatBubbleLeftRight,
  HiPencilSquare,
  HiTrash,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiXMark,
  HiCheck,
  HiSparkles,
  HiArrowTopRightOnSquare,
  HiBolt,
  HiArrowPath,
  HiClock,
} from "react-icons/hi2";

import {
  useAddGroupMembersMutation,
  useDeleteGroupMutation,
  useGetFriendsQuery,
  useGetGroupDetailsQuery,
  useRemoveGroupMembersMutation,
  useRenameGroupChatMutation,
} from "../../app/api/api";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { setEditGroup, setGroupId } from "../../app/features/otherSlice";

// eslint-disable-next-line react/prop-types
const MyGroupInfo = ({ groupId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const userId = useSelector((state) => state.auth.user?._id);

  // Component local states
  const [chatName, setChatName] = useState("");
  const [removeCheckedMembers, setRemoveMemberCheckedMembers] = useState([]);
  const [addMemberCheckedMembers, setAddMemberCheckedMembers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [friendSearchQuery, setFriendSearchQuery] = useState("");

  // Queries
  const { data, isError, isLoading, error, refetch } =
    useGetGroupDetailsQuery(groupId);
  const { data: friendsData } = useGetFriendsQuery(userId);

  // Mutations
  const [renameGroupChat, renameGroupChatLoading] = useAsyncMutation(
    useRenameGroupChatMutation
  );
  const [addGroupMember, addingMemberLoading] = useAsyncMutation(
    useAddGroupMembersMutation
  );
  const [removeGroupMember, removingMemberLoading] = useAsyncMutation(
    useRemoveGroupMembersMutation
  );
  const [deleteGroup, deletingGroupLoading] = useAsyncMutation(
    useDeleteGroupMutation
  );

  const chat = data?.payload?.chat;

  // Sync initial chatName when data changes
  useEffect(() => {
    if (chat?.chatName) {
      setChatName(chat.chatName);
    }
    setRemoveMemberCheckedMembers([]);
    setAddMemberCheckedMembers([]);
  }, [chat?.chatName, groupId]);

  // Rename Handler
  const handleNameSave = async (e) => {
    e?.preventDefault();
    if (!chatName.trim() || chatName.trim() === chat?.chatName) return;
    await renameGroupChat("Updating channel name...", {
      chatId: groupId,
      name: chatName.trim(),
    });
  };

  // Current Members ID Set for O(1) Lookups
  const currentMemberIdSet = useMemo(() => {
    return new Set((chat?.members || []).map((m) => m._id?.toString()));
  }, [chat?.members]);

  // Friends not yet in group
  const friendsNotInGroup = useMemo(() => {
    const allFriends = friendsData?.payload?.friends || [];
    return allFriends.filter((f) => !currentMemberIdSet.has(f._id?.toString()));
  }, [friendsData?.payload?.friends, currentMemberIdSet]);

  // Filtered Current Members
  const filteredCurrentMembers = useMemo(() => {
    const members = chat?.members || [];
    if (!memberSearchQuery.trim()) return members;
    const q = memberSearchQuery.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q)
    );
  }, [chat?.members, memberSearchQuery]);

  // Filtered Friends to Add
  const filteredFriends = useMemo(() => {
    if (!friendSearchQuery.trim()) return friendsNotInGroup;
    const q = friendSearchQuery.toLowerCase().trim();
    return friendsNotInGroup.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.username?.toLowerCase().includes(q)
    );
  }, [friendsNotInGroup, friendSearchQuery]);

  // Non-Admin Members (can be removed)
  const nonAdminMembers = useMemo(() => {
    return (chat?.members || []).filter(
      (m) =>
        m._id?.toString() !== chat?.creator?.toString() &&
        m._id?.toString() !== userId?.toString()
    );
  }, [chat?.members, chat?.creator, userId]);

  // Toggle Member Removal Selection
  const handleRemoveMemberCheckboxChange = useCallback((memberId) => {
    setRemoveMemberCheckedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  // Toggle Friend Add Selection
  const handleAddMemberCheckboxChange = useCallback((friendId) => {
    setAddMemberCheckedMembers((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  }, []);

  // Batch Add Members
  const handleAddMemberClick = async () => {
    if (addMemberCheckedMembers.length < 1) return;
    const res = await addGroupMember("Adding selected members...", {
      groupId,
      members: addMemberCheckedMembers,
    });
    if (res?.success) {
      setAddMemberCheckedMembers([]);
      setFriendSearchQuery("");
    }
  };

  // Batch Remove Members
  const handleRemoveMemberClick = async () => {
    if (removeCheckedMembers.length < 1) return;
    const res = await removeGroupMember("Removing selected members...", {
      groupId,
      members: removeCheckedMembers,
    });
    if (res?.success) {
      setRemoveMemberCheckedMembers([]);
    }
  };

  // Remove Single Member Directly
  const handleRemoveSingleMember = async (memberId) => {
    const res = await removeGroupMember("Removing member...", {
      groupId,
      members: [memberId],
    });
    if (res?.success) {
      setRemoveMemberCheckedMembers((prev) =>
        prev.filter((id) => id !== memberId)
      );
    }
  };

  // Delete Entire Group
  const handleDeleteChat = async () => {
    const res = await deleteGroup("Deleting channel...", groupId);
    if (res?.success) {
      setShowDeleteModal(false);
      dispatch(setGroupId(""));
      dispatch(setEditGroup(false));
      navigate("/my-groups");
    }
  };

  // Format Created At Date
  const formattedDate = useMemo(() => {
    if (!chat?.createdAt) return "Active";
    try {
      return new Date(chat.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Active";
    }
  }, [chat?.createdAt]);

  // Minimum member threshold check
  const isMinimumThreshold = (chat?.members?.length || 0) <= 3;

  // Loading State
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/10 mb-4 animate-pulse">
          <HiArrowPath className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
        <p className="text-sm font-bold text-white tracking-wide">
          Synchronizing Channel Roster...
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Loading encryption keys and member state
        </p>
      </div>
    );
  }

  // Error State
  if (isError || !chat) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-3xl shadow-xl shadow-rose-500/10 mb-4">
          <HiExclamationTriangle className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">
          Unable to Load Channel
        </h3>
        <p className="text-xs text-gray-400 max-w-sm mb-4">
          {error?.data?.errorMessage ||
            error?.message ||
            "This channel may have been removed or you no longer have admin access."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <HiArrowPath className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 space-y-6 text-gray-100 max-w-5xl mx-auto select-none">
      {/* ========================================================= */}
      {/* SECTION 1: HERO BANNER (BENTO CARD) */}
      {/* ========================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent backdrop-blur-2xl border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Subtle Ambient Glow Orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Group Identity Left Stack */}
          <div className="flex items-center gap-4 md:gap-5">
            {/* Stylized Emblem / Initial Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-extrabold text-2xl md:text-3xl shadow-xl shadow-cyan-500/10">
                {chat.chatName ? chat.chatName.charAt(0).toUpperCase() : "G"}
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-[#08090d] border border-cyan-500/40">
                <HiShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  ADMIN CONTROL
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                  <HiClock className="w-3 h-3 text-gray-400" />
                  <span>Created {formattedDate}</span>
                </span>
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight truncate">
                {chat.chatName}
              </h1>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                <span>{chat.members?.length || 0} active members</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">
                  Duplex WebSocket Ready
                </span>
              </p>
            </div>
          </div>

          {/* Quick Chat Shortcut Trigger */}
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => navigate(`/chat/${groupId}`)}
              className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs md:text-sm font-bold shadow-lg shadow-cyan-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <HiChatBubbleLeftRight className="w-4 h-4" />
              <span>Open Chat Room</span>
              <HiArrowTopRightOnSquare className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Home Page Style Specification Capsules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5 relative z-10">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <HiBolt className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Architecture</p>
              <p className="text-xs font-bold text-white">Sub-30ms P2P Mesh</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HiUsers className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Capacity</p>
              <p className="text-xs font-bold text-white">
                {chat.members?.length || 0} / 100 Members
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <HiSparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Role Authority</p>
              <p className="text-xs font-bold text-white">Full Admin Rights</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: CHANNEL IDENTIFIER / RENAME (BENTO CARD) */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <HiPencilSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Channel Name & Identifier
              </h2>
              <p className="text-[11px] text-gray-400">
                Rename this group channel across all participants
              </p>
            </div>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            {chatName.length}/50
          </span>
        </div>

        <form onSubmit={handleNameSave} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={chatName}
            maxLength={50}
            onChange={(e) => setChatName(e.target.value)}
            placeholder="Enter channel title..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs md:text-sm focus:outline-none focus:border-cyan-500/60 focus:bg-white/[0.07] transition-all"
          />
          <button
            type="submit"
            disabled={
              renameGroupChatLoading ||
              !chatName.trim() ||
              chatName.trim() === chat.chatName
            }
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md shadow-cyan-500/15 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {renameGroupChatLoading ? (
              <>
                <HiArrowPath className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Name</span>
            )}
          </button>
        </form>
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: CURRENT MEMBERS MANAGEMENT (BENTO CARD) */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <HiUsers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">Current Members</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
                  {chat.members?.length || 0}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                View, inspect profiles, and manage participants
              </p>
            </div>
          </div>

          {/* Member Search Bar */}
          <div className="relative w-full sm:w-64">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500/50 transition-all"
            />
            {memberSearchQuery && (
              <button
                type="button"
                onClick={() => setMemberSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <HiXMark className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Minimum Threshold Warning Pill if <= 3 members */}
        {isMinimumThreshold && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-amber-300 text-xs">
            <HiExclamationTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              This channel currently has {chat.members?.length} members. Groups
              require a minimum of 3 members. To disband the channel, use Delete
              Group below.
            </span>
          </div>
        )}

        {/* Batch Selection Action Bar */}
        {nonAdminMembers.length > 0 && !isMinimumThreshold && (
          <div className="flex items-center justify-between p-2.5 mb-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
            <button
              type="button"
              onClick={() => {
                if (removeCheckedMembers.length === nonAdminMembers.length) {
                  setRemoveMemberCheckedMembers([]);
                } else {
                  setRemoveMemberCheckedMembers(
                    nonAdminMembers.map((m) => m._id)
                  );
                }
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition cursor-pointer"
            >
              {removeCheckedMembers.length === nonAdminMembers.length
                ? "Deselect All"
                : "Select All Non-Admins"}
            </button>

            {removeCheckedMembers.length > 0 && (
              <button
                type="button"
                onClick={handleRemoveMemberClick}
                disabled={removingMemberLoading}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 hover:text-white font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                {removingMemberLoading ? (
                  <HiArrowPath className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <HiUserMinus className="w-3.5 h-3.5" />
                )}
                <span>Remove ({removeCheckedMembers.length})</span>
              </button>
            )}
          </div>
        )}

        {/* Members List */}
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
          {filteredCurrentMembers.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-400">
              No members found matching "{memberSearchQuery}"
            </div>
          ) : (
            filteredCurrentMembers.map((member) => {
              const isCreator =
                member._id?.toString() === chat?.creator?.toString() ||
                member._id?.toString() === userId?.toString();
              const isChecked = removeCheckedMembers.includes(member._id);

              return (
                <div
                  key={member._id}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                    isChecked
                      ? "bg-rose-500/10 border-rose-500/30 shadow-md shadow-rose-500/5"
                      : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Member Avatar */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-gray-800 flex-shrink-0">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-cyan-500/20 text-cyan-300 font-bold text-sm">
                          {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                    </div>

                    {/* Member Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/profile/${member._id}`}
                          className="text-xs md:text-sm font-bold text-white hover:text-cyan-300 transition truncate"
                        >
                          {member.name}
                        </Link>
                        {isCreator && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate">
                        {member.username ? `@${member.username}` : "Member"}
                      </p>
                    </div>
                  </div>

                  {/* Actions / Removal Checkbox */}
                  <div className="flex items-center gap-3">
                    {isCreator ? (
                      <span className="text-[11px] text-gray-500 font-semibold px-2 py-1">
                        Host
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Quick single-removal button */}
                        {!isMinimumThreshold && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSingleMember(member._id)}
                            disabled={removingMemberLoading}
                            title="Remove member"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          >
                            <HiUserMinus className="w-4 h-4" />
                          </button>
                        )}

                        {/* Multi-select Checkbox */}
                        {!isMinimumThreshold && (
                          <label className="relative flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                handleRemoveMemberCheckboxChange(member._id)
                              }
                              className="sr-only"
                            />
                            <div
                              className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                                isChecked
                                  ? "bg-rose-500 border-rose-400 text-white"
                                  : "bg-white/5 border-white/20 hover:border-white/40"
                              }`}
                            >
                              {isChecked && (
                                <HiCheck className="w-3.5 h-3.5 stroke-[3]" />
                              )}
                            </div>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 4: ADD MEMBERS / INVITE FRIENDS (BENTO CARD) */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HiUserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  Add People to Group
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  {friendsNotInGroup.length} Available
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Invite connected friends directly into this room
              </p>
            </div>
          </div>

          {/* Friend Search Bar */}
          {friendsNotInGroup.length > 0 && (
            <div className="relative w-full sm:w-64">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={friendSearchQuery}
                onChange={(e) => setFriendSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
              />
              {friendSearchQuery && (
                <button
                  type="button"
                  onClick={() => setFriendSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <HiXMark className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {friendsNotInGroup.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/[0.01] border border-white/5">
            <HiCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-white">
              All friends are currently members
            </p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-xs mx-auto">
              You have already invited all eligible friends to this channel. Add
              more friends via the Friends tab to invite them here.
            </p>
          </div>
        ) : (
          <>
            {/* Friends Selection Controls */}
            <div className="flex items-center justify-between p-2.5 mb-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (addMemberCheckedMembers.length === filteredFriends.length) {
                    setAddMemberCheckedMembers([]);
                  } else {
                    setAddMemberCheckedMembers(
                      filteredFriends.map((f) => f._id)
                    );
                  }
                }}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition cursor-pointer"
              >
                {addMemberCheckedMembers.length === filteredFriends.length
                  ? "Deselect All"
                  : "Select All Friends"}
              </button>

              <span className="text-[11px] text-gray-400">
                {addMemberCheckedMembers.length} selected
              </span>
            </div>

            {/* Friend Checkbox Cards */}
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1 mb-4">
              {filteredFriends.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No friends match "{friendSearchQuery}"
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const isChecked = addMemberCheckedMembers.includes(friend._id);
                  return (
                    <div
                      key={friend._id}
                      onClick={() => handleAddMemberCheckboxChange(friend._id)}
                      className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between cursor-pointer select-none ${
                        isChecked
                          ? "bg-emerald-500/10 border-emerald-500/30 shadow-md shadow-emerald-500/5"
                          : "bg-white/[0.02] hover:bg-white/[0.05] border-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-gray-800 flex-shrink-0">
                          {friend.avatar ? (
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-500/20 text-emerald-300 font-bold text-sm">
                              {friend.name ? friend.name.charAt(0).toUpperCase() : "U"}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs md:text-sm font-bold text-white truncate">
                            {friend.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {friend.username ? `@${friend.username}` : "Friend"}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "bg-white/5 border-white/20"
                        }`}
                      >
                        {isChecked && (
                          <HiCheck className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Submit Action */}
            <button
              type="button"
              onClick={handleAddMemberClick}
              disabled={
                addMemberCheckedMembers.length === 0 || addingMemberLoading
              }
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs md:text-sm font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {addingMemberLoading ? (
                <>
                  <HiArrowPath className="w-4 h-4 animate-spin" />
                  <span>Adding Members...</span>
                </>
              ) : (
                <>
                  <HiUserPlus className="w-4 h-4" />
                  <span>
                    Add {addMemberCheckedMembers.length > 0 ? `(${addMemberCheckedMembers.length})` : ""}{" "}
                    Selected Members
                  </span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 5: DANGER ZONE (BENTO CARD) */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-rose-500/[0.03] backdrop-blur-xl border border-rose-500/20 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <HiTrash className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white mb-1">
                Disband & Delete Channel
              </h2>
              <p className="text-xs text-gray-400 max-w-lg leading-relaxed">
                Permanently delete this group channel. All message history,
                attachments, and group membership will be irreversibly erased
                from the server.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <HiTrash className="w-3.5 h-3.5" />
            <span>Delete Group</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CYBER CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0f1017] border border-rose-500/30 p-6 md:p-8 shadow-2xl overflow-hidden">
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <HiExclamationTriangle className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Confirm Deletion
                  </h3>
                  <p className="text-[11px] text-rose-300/80">
                    Irreversible Channel Action
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mb-6">
                Are you sure you want to permanently delete{" "}
                <span className="font-extrabold text-white">
                  "{chat.chatName}"
                </span>
                ? All chat history, shared media, and member connections will be
                immediately wiped.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deletingGroupLoading}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-semibold transition active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteChat}
                  disabled={deletingGroupLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-500/20 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  {deletingGroupLoading ? (
                    <>
                      <HiArrowPath className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <HiTrash className="w-3.5 h-3.5" />
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyGroupInfo;
