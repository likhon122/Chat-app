import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiUserCircle, HiArrowRight } from "react-icons/hi2";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

const FriendsList = ({ friends }) => {
  const [visibleCount, setVisibleCount] = useState(6);
  const { isUserOnline } = useOnlineStatus();

  if (!friends || friends.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-gray-500 dark:text-gray-400">
        No friends added yet. Start connecting with others!
      </div>
    );
  }

  const displayedFriends = friends.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayedFriends.map((friend) => {
          const isOnline = isUserOnline(friend._id) || Boolean(friend.isOnline);

          return (
            <Link
              to={`/profile/${friend._id}`}
              key={friend._id}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition duration-200 group"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={
                    friend.avatar?.url ||
                    friend.avatar ||
                    "https://via.placeholder.com/150"
                  }
                  alt={friend.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-white/10 group-hover:scale-105 transition"
                />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#12131a] transition-colors ${
                    isOnline
                      ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
                      : "bg-gray-400 dark:bg-gray-600"
                  }`}
                  title={isOnline ? "Online" : "Offline"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-cyan-400 transition">
                  {friend.name}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  @{friend.username || "user"}
                </p>
              </div>

              <div className="text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition flex-shrink-0">
                <HiArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>

      {visibleCount < friends.length && (
        <div className="text-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + 6)}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
          >
            Show more ({friends.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
