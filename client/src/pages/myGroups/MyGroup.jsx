import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useGetMyGroupsQuery } from "../../app/api/api";
import {
  setEditGroup,
  setGroupId,
  setMakeGroupDrawer,
} from "../../app/features/otherSlice";
import { useGetSocket } from "../../SocketHelper";
import {
  HiUsers,
  HiPlus,
  HiMagnifyingGlass,
  HiXMark,
  HiSparkles,
  HiShieldCheck,
  HiChevronRight,
  HiChatBubbleLeftRight,
} from "react-icons/hi2";

// ==========================================
// MEMOIZED HIGH-PERFORMANCE GROUP CARD
// ==========================================
const GroupCard = memo(({ chat, isActive, onClick }) => {
  const avatarList = Array.isArray(chat?.avatar)
    ? chat.avatar
    : chat?.avatar
    ? [chat.avatar]
    : [];

  const memberCount = Array.isArray(chat?.members)
    ? chat.members.length + 1 // +1 for the creator
    : 1;

  return (
    <div
      onClick={() => onClick(chat)}
      className={`group relative w-full p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer text-left select-none overflow-hidden ${
        isActive
          ? "bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-white/[0.02] border-cyan-500/40 shadow-lg shadow-cyan-500/10"
          : "bg-white/[0.03] hover:bg-white/[0.07] border-white/5 hover:border-white/15"
      }`}
    >
      {/* Active Left Neon Accent Bar */}
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full shadow-[0_0_10px_#22d3ee]" />
      )}

      <div className="flex items-center gap-3.5">
        {/* Overlapping Avatar Stack */}
        <div className="relative flex-shrink-0 flex items-center">
          {avatarList.length > 0 ? (
            <div className="flex items-center">
              {avatarList.slice(0, 3).map((imgUrl, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 border-[#12131a] bg-gray-800 shadow-md ${
                    idx > 0 ? "-ml-3.5" : ""
                  }`}
                  style={{ zIndex: 3 - idx }}
                >
                  <img
                    src={imgUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              ))}
              {avatarList.length > 3 && (
                <div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 border-2 border-[#12131a] flex items-center justify-center text-white text-[11px] font-extrabold -ml-3.5 shadow-md"
                  style={{ zIndex: 0 }}
                >
                  +{avatarList.length - 2}
                </div>
              )}
            </div>
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-base shadow-md">
              {chat?.chatName ? chat.chatName.charAt(0).toUpperCase() : "G"}
            </div>
          )}

          {/* Status Dot */}
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#08090d] flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
          </div>
        </div>

        {/* Group Info & Stats */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h4
              className={`text-sm font-bold truncate transition-colors ${
                isActive
                  ? "text-cyan-300"
                  : "text-white group-hover:text-cyan-200"
              }`}
            >
              {chat?.chatName || "Unnamed Channel"}
            </h4>
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HiShieldCheck className="w-2.5 h-2.5" />
              ADMIN
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="truncate">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
            <HiChevronRight
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isActive
                  ? "text-cyan-400 translate-x-0.5"
                  : "text-gray-500 group-hover:text-gray-300"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

GroupCard.displayName = "GroupCard";

// ==========================================
// SKELETON LOADER
// ==========================================
const RailSkeleton = () => (
  <div className="space-y-3 p-3 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3.5"
      >
        <div className="w-10 h-10 rounded-xl bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/5 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// ==========================================
// MAIN COMPONENT
// ==========================================
const MyGroup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useGetSocket();
  const params = useParams();

  const { groupId: reduxGroupId } = useSelector((state) => state.other);
  const activeGroupId = params.groupId || reduxGroupId;

  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, refetch } = useGetMyGroupsQuery();
  const allGroups = useMemo(
    () => data?.payload?.allGroups || [],
    [data?.payload?.allGroups]
  );

  // Auto-select first group on desktop view if none is currently selected
  useEffect(() => {
    if (
      !activeGroupId &&
      allGroups.length > 0 &&
      typeof window !== "undefined" &&
      window.innerWidth >= 768
    ) {
      dispatch(setGroupId(allGroups[0]._id));
    }
  }, [allGroups, activeGroupId, dispatch]);

  // Live real-time socket synchronization for new groups / removals
  useEffect(() => {
    if (!socket) return;
    const handleRefetch = () => {
      refetch();
    };

    socket.on("REFETCH_CHATS", handleRefetch);
    socket.on("ALERT", handleRefetch);

    return () => {
      socket.off("REFETCH_CHATS", handleRefetch);
      socket.off("ALERT", handleRefetch);
    };
  }, [socket, refetch]);

  // Selection Handler
  const handleSelectGroup = useCallback(
    (chat) => {
      dispatch(setGroupId(chat._id));
      dispatch(setEditGroup(true));
      navigate(`/my-groups/${chat._id}`);
    },
    [dispatch, navigate]
  );

  // Fast Memoized Search Filter
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return allGroups;
    const query = searchQuery.toLowerCase().trim();
    return allGroups.filter((g) =>
      g.chatName?.toLowerCase().includes(query)
    );
  }, [allGroups, searchQuery]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-transparent select-none">
      {/* Top Header Rail */}
      <div className="p-4 border-b border-white/10 bg-white/[0.01] backdrop-blur-md flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <HiUsers className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  My Groups
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/20">
                  {allGroups.length}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Channels you administer
              </p>
            </div>
          </div>

          {/* New Group Quick Trigger */}
          <button
            type="button"
            onClick={() => dispatch(setMakeGroupDrawer(true))}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Create a new group"
          >
            <HiPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Group</span>
          </button>
        </div>

        {/* High-Performance Live Search Input */}
        <div className="relative">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <HiXMark className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Group List Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {isLoading ? (
          <RailSkeleton />
        ) : allGroups.length === 0 ? (
          /* Zero Groups Empty State */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
              <HiUsers className="w-8 h-8 opacity-70" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">
              No Groups Yet
            </h3>
            <p className="text-xs text-gray-400 max-w-[220px] leading-relaxed mb-4">
              You haven't created any group channels yet. Start your first channel now!
            </p>
            <button
              type="button"
              onClick={() => dispatch(setMakeGroupDrawer(true))}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <HiSparkles className="w-3.5 h-3.5" />
              <span>Create Channel</span>
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          /* Zero Search Results State */
          <div className="py-12 px-4 text-center">
            <p className="text-xs text-gray-400 mb-2">
              No channels match "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredGroups.map((chat) => (
            <GroupCard
              key={chat._id}
              chat={chat}
              isActive={chat._id === activeGroupId}
              onClick={handleSelectGroup}
            />
          ))
        )}
      </div>

      {/* Channel Rail Footer Indicator */}
      <div className="p-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Admin Matrix</span>
        </span>
        <span>
          {filteredGroups.length} of {allGroups.length}
        </span>
      </div>
    </div>
  );
};

export default MyGroup;
