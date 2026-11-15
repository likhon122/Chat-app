import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetUserQuery } from "../../app/api/api";
import MakeGroup from "./MakeGroup";
import { useDispatch, useSelector } from "react-redux";
import { setMakeGroupDrawer, setShowSearch } from "../../app/features/otherSlice";
import axios from "axios";
import { toast } from "../../utils/alert";
import { removeUser } from "../../app/features/authSlice";
import { serverUrl } from "../../../index";
import FriendsList from "./FriendsList";
import DuelSpinner from "../../components/Loaders/DuelSpinner";
import {
  FaUserFriends,
  FaEdit,
  FaSignOutAlt,
  FaUsers,
  FaUserPlus,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimes,
  FaPhoneAlt,
  FaVideo
} from "react-icons/fa";
import { HiSparkles, HiChatBubbleLeftRight, HiShieldCheck } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useCall } from "../../context/CallContext";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

const Profile = () => {
  const userData = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth?.user?._id);
  const { makeGroupDrawer } = useSelector((state) => state.other);
  const id = params.userId;
  const { data, isLoading } = useGetUserQuery(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { initiateCall } = useCall();
  const { isUserOnline } = useOnlineStatus();

  const handleStartAudioCall = () => {
    if (!profileUser?._id) return;
    initiateCall({
      chatId: profileUser._id,
      callType: "audio",
      to: profileUser._id,
      toName: profileUser.name,
      toImage: profileUser.avatar,
      members: [profileUser._id]
    });
  };

  const handleStartVideoCall = () => {
    if (!profileUser?._id) return;
    initiateCall({
      chatId: profileUser._id,
      callType: "video",
      to: profileUser._id,
      toName: profileUser.name,
      toImage: profileUser.avatar,
      members: [profileUser._id]
    });
  };

  const showSearch = useSelector((state) => state.other.search);

  useEffect(() => {
    if (showSearch && !window.matchMedia("(min-width: 768px)").matches) {
      dispatch(setShowSearch(false));
    }
  }, [dispatch, showSearch]);

  const handleClick = () => {
    dispatch(setMakeGroupDrawer(true));
  };

  const handleLogOut = async () => {
    toast.confirm("Are you sure you want to log out?", {
      confirmText: "Log Out",
      cancelText: "Stay",
      onConfirm: async () => {
        const loadingId = toast.loading("Logging out...");
        try {
          await axios.get(`${serverUrl}/api/v1/auth/log-out`, {
            withCredentials: true
          });
          toast.success("Logged out successfully!", { id: loadingId });
          dispatch(removeUser());
          navigate("/login");
        } catch (error) {
          toast.error(error?.response?.data?.errorMessage || "Failed to log out.", {
            id: loadingId
          });
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0c0d12]">
        <DuelSpinner />
      </div>
    );
  }

  const profileUser = data?.payload?.user;
  const isOwnProfile = userId === id;
  const isProfileOnline =
    isOwnProfile ||
    isUserOnline(profileUser?._id) ||
    Boolean(profileUser?.isOnline);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-[#0c0d12] text-gray-900 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8 relative selection:bg-cyan-500 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {profileUser && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Cover Card */}
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 dark:border-white/10 shadow-xl bg-gradient-to-r from-[#16222A] via-[#1c2e3d] to-[#16222A] h-52 sm:h-64 flex items-end p-6 sm:p-8">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between w-full gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md mb-2">
                  <HiSparkles className="w-3.5 h-3.5" />
                  Verified Profile
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {profileUser.name || profileUser.username}
                </h1>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => navigate(`/edit-profile/${id}`)}
                  className="btn-grad text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-2"
                >
                  <FaEdit className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Main Bento Profile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-16 sm:-mt-20 relative z-20">
            {/* Left Card: Avatar & Bio */}
            <div className="md:col-span-1 bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-gray-200/80 dark:border-white/10 shadow-xl flex flex-col items-center text-center">
              <div
                className="relative group cursor-pointer -mt-16 sm:-mt-20"
                onClick={() => setIsModalOpen(true)}
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#12131a] shadow-2xl ring-2 ring-cyan-500/50 bg-[#161822]">
                  <img
                    src={profileUser.avatar || "https://via.placeholder.com/150"}
                    alt={profileUser.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div
                  className={`absolute bottom-1 right-2 w-4 h-4 rounded-full ring-2 ring-white dark:ring-[#12131a] transition-colors ${
                    isProfileOnline
                      ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                      : "bg-gray-400 dark:bg-gray-600"
                  }`}
                  title={isProfileOnline ? "Online" : "Offline"}
                />
              </div>

              <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {profileUser.name}
              </h2>
              <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                @{profileUser.username}
              </p>

              {profileUser.bio && (
                <div className="mt-4 w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed text-left">
                  {profileUser.bio}
                </div>
              )}

              {/* Contact metadata */}
              <div className="mt-5 w-full space-y-2.5 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-white/10 pt-4 text-left">
                <div className="flex items-center gap-2 truncate">
                  <FaEnvelope className="text-cyan-500 flex-shrink-0" />
                  <span className="truncate">{profileUser.email}</span>
                </div>
                {profileUser.location && (
                  <div className="flex items-center gap-2 truncate">
                    <FaMapMarkerAlt className="text-rose-500 flex-shrink-0" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
              </div>

              {/* Direct message and Call buttons if viewing another user */}
              {!isOwnProfile && (
                <div className="w-full mt-6 space-y-2">
                  <Link
                    to={`/chat`}
                    className="btn-grad w-full text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <HiChatBubbleLeftRight className="w-4 h-4" />
                    Send Message
                  </Link>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleStartAudioCall}
                      className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      title="Start Voice Call"
                    >
                      <FaPhoneAlt className="w-3 h-3" />
                      <span>Audio</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleStartVideoCall}
                      className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      title="Start Video Call"
                    >
                      <FaVideo className="w-3 h-3" />
                      <span>Video</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card: Stats, Actions, & Friends */}
            <div className="md:col-span-2 space-y-6">
              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-[#12131a] p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    {profileUser.friends?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                    Friends
                  </div>
                </div>

                <div className="bg-white dark:bg-[#12131a] p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    {profileUser.groups?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                    Groups
                  </div>
                </div>

                <div className="bg-white dark:bg-[#12131a] p-4 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm text-center">
                  <div className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    {profileUser.posts?.length || 0}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
                    Posts
                  </div>
                </div>
              </div>

              {/* Action Buttons (For account owner) */}
              {isOwnProfile && (
                <div className="bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-gray-200/80 dark:border-white/10 shadow-xl space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Quick Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleClick}
                      className="btn-grad text-xs font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
                    >
                      <FaUserPlus className="w-3.5 h-3.5" />
                      Create New Group
                    </button>

                    <Link
                      to={`/my-groups/${profileUser._id}`}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-gray-200 inline-flex items-center gap-2 transition"
                    >
                      <FaUsers className="w-3.5 h-3.5 text-purple-400" />
                      My Groups
                    </Link>

                    <button
                      onClick={handleLogOut}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 inline-flex items-center gap-2 transition ml-auto"
                    >
                      <FaSignOutAlt className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}

              {/* Friends List Container */}
              <div className="bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-gray-200/80 dark:border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaUserFriends className="text-cyan-500" />
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Friends ({profileUser.friends?.length || 0})
                    </h3>
                  </div>
                  <Link
                    to={`/friends/${profileUser._id}`}
                    className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <FriendsList friends={profileUser.friends} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Avatar View Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#12131a] rounded-3xl p-6 border border-gray-200/80 dark:border-white/10 shadow-2xl max-w-md w-full relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 p-2 rounded-full hover:bg-white/10 transition"
              >
                <FaTimes />
              </button>
              <h3 className="text-lg font-bold mb-4">{profileUser.name}</h3>
              <div className="w-full aspect-square rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={profileUser.avatar}
                  alt={profileUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-3 text-xs text-center text-gray-400">
                @{profileUser.username}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
