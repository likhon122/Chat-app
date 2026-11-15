import { Link, useParams } from "react-router-dom";
import { useGetFriendsQuery } from "../../app/api/api";
import { FaUserFriends, FaArrowLeft, FaPhoneAlt, FaVideo } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import DuelSpinner from "../../components/Loaders/DuelSpinner";
import { useCall } from "../../context/CallContext";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

const Friends = () => {
  const params = useParams();
  const id = params.userId;
  const { data, isLoading } = useGetFriendsQuery(id);
  const { initiateCall } = useCall();
  const { isUserOnline } = useOnlineStatus();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0c0d12]">
        <DuelSpinner />
      </div>
    );
  }

  const friends = data?.payload?.friends || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0c0d12] text-gray-900 dark:text-gray-100 p-6 sm:p-8 relative selection:bg-cyan-500 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to={`/profile/${id}`}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white inline-flex items-center gap-1.5 transition"
          >
            <FaArrowLeft className="w-3 h-3" />
            Back to Profile
          </Link>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FaUserFriends className="w-3.5 h-3.5" />
            {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Friend Connections
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Browse all contacts linked with this profile
          </p>
        </div>

        {friends.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {friends.map((friend) => {
              const isOnline = isUserOnline(friend._id) || Boolean(friend.isOnline);
              return (
                <div
                  key={friend._id}
                  className="bg-white dark:bg-[#12131a] rounded-3xl p-5 border border-gray-200/80 dark:border-white/10 shadow-xl flex flex-col items-center text-center group hover:border-cyan-500/40 transition duration-300"
                >
                  <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-[#161822] shadow-lg ring-2 ring-cyan-500/30 group-hover:scale-105 transition">
                      <img
                        src={friend.avatar || "https://via.placeholder.com/150"}
                        alt={friend.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className={`absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#12131a] transition-colors ${
                        isOnline
                          ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
                          : "bg-gray-400 dark:bg-gray-600"
                      }`}
                      title={isOnline ? "Online" : "Offline"}
                    />
                  </div>

                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate w-full group-hover:text-cyan-400 transition">
                  {friend.name}
                </h3>
                <p className="text-xs text-gray-400 truncate w-full mb-4">
                  @{friend.username || "user"}
                </p>

                <div className="w-full flex flex-col gap-2">
                  <Link
                    to={`/profile/${friend._id}`}
                    className="btn-grad text-xs font-semibold py-2 px-4 rounded-xl w-full text-center"
                  >
                    View Profile
                  </Link>

                  <div className="grid grid-cols-2 gap-1.5 w-full">
                    <button
                      type="button"
                      onClick={() =>
                        initiateCall({
                          chatId: friend._id,
                          callType: "audio",
                          to: friend._id,
                          toName: friend.name,
                          toImage: friend.avatar,
                          members: [friend._id]
                        })
                      }
                      className="py-1.5 px-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                      title="Audio Call"
                    >
                      <FaPhoneAlt className="w-2.5 h-2.5" />
                      <span>Audio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        initiateCall({
                          chatId: friend._id,
                          callType: "video",
                          to: friend._id,
                          toName: friend.name,
                          toImage: friend.avatar,
                          members: [friend._id]
                        })
                      }
                      className="py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                      title="Video Call"
                    >
                      <FaVideo className="w-2.5 h-2.5" />
                      <span>Video</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="bg-white dark:bg-[#12131a] rounded-3xl p-12 border border-gray-200/80 dark:border-white/10 shadow-xl text-center text-gray-400">
            <FaUserFriends className="w-12 h-12 mx-auto mb-3 text-cyan-500/50" />
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
              No Friends Found
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              This user has not connected with any friends yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
