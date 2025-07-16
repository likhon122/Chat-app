import { useState, useEffect } from "react";
import { Link, redirect, useNavigate, useParams } from "react-router-dom";
import { useGetUserQuery } from "../../app/api/api";
import MakeGroup from "./MakeGroup";
import { useDispatch, useSelector } from "react-redux";
import {
  setMakeGroupDrawer,
  setShowSearch
} from "../../app/features/otherSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { removeUser } from "../../app/features/authSlice";
import { serverUrl } from "../../../index";
import FriendsList from "./FriendsList";
import DuelSpinner from "../../components/Loaders/DuelSpinner";
// import ProfileModal from "./ProfileModal";
import {
  FaUserFriends,
  FaEdit,
  FaSignOutAlt,
  FaUsers,
  FaUserPlus,
  FaEnvelope,
  // FaBirthdayCake,
  FaMapMarkerAlt
} from "react-icons/fa";
import { motion } from "framer-motion";

const Profile = () => {
  const userData = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth?.user?._id);
  const { makeGroupDrawer } = useSelector((state) => state.other);
  const id = params.userId;
  const { data, isLoading } = useGetUserQuery(id);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showSearch = useSelector((state) => state.other.search);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showSearch && !window.matchMedia("(min-width: 768px)").matches) {
      dispatch(setShowSearch(false));
    }
  }, [dispatch, showSearch]);

  const handleClick = () => {
    dispatch(setMakeGroupDrawer(true));
  };

  const handleLogOut = async () => {
    let loadingToastId = toast.loading("Logging out...");
    try {
      await axios.get(`${serverUrl}/api/v1/auth/log-out`, {
        withCredentials: true
      });
      toast.update(loadingToastId, {
        render: "Log Out successful!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
        closeButton: true
      });
      dispatch(removeUser());
      navigate("/login");
    } catch (error) {
      toast.update(loadingToastId, {
        render: "Something went wrong!",
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeButton: true
      });
    }
    redirect("/");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="backdrop-blur-sm bg-white/30 dark:bg-black/30 p-10 rounded-2xl shadow-xl">
          <DuelSpinner />
        </div>
      </div>
    );
  }

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleEditProfile = () => {
    navigate(`/edit-profile/${id}`);
  };

  // Get a default banner image based on the username
  const getBannerStyle = () => {
    const patterns = [
      "bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200')] bg-cover",
      "bg-[url('https://images.unsplash.com/photo-1579546929662-711aa81148cf?q=80&w=1200')] bg-cover",
      "bg-[url('https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1200')] bg-cover",
      "bg-[url('https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=1200')] bg-cover",
      "bg-[url('https://images.unsplash.com/photo-1554147090-e1221a04a025?q=80&w=1200')] bg-cover"
    ];

    if (!data?.payload?.user?.username) return patterns[0];
    const index = data.payload.user.username.length % patterns.length;
    return patterns[index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black pt-6 pb-12">
      {data?.payload?.user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4"
        >
          {/* Banner */}
          <motion.div
            className={`h-60 sm:h-72 w-full rounded-3xl ${getBannerStyle()} relative overflow-hidden shadow-2xl border border-white/20 dark:border-gray-700/20`}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <div className="font-light text-xs tracking-wider opacity-80">
                PROFILE
              </div>
              <div className="text-3xl font-bold tracking-tight mt-1">
                {data.payload.user.name || data.payload.user.username}
              </div>
            </div>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            className={`bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-visible relative z-10 px-6 sm:px-8 pb-8 -mt-24 backdrop-blur-md bg-white/90 dark:bg-gray-800/90 border border-white/50 dark:border-gray-700/50 ${
              isScrolled ? "shadow-2xl ring-1 ring-blue-500/20" : ""
            } transition-all duration-500`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Avatar */}
            <div className=" flex justify-between items-start pt-16 sm:pt-20 px-4">
              <motion.div
                className="ring-4 ring-white dark:ring-gray-800 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-2xl -mt-16 sm:-mt-24 ml-2"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src={
                    data.payload.user.avatar ||
                    "https://via.placeholder.com/150"
                  }
                  alt={`${data.payload.user.name}'s avatar`}
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover cursor-pointer hover:opacity-90 transition-all duration-300"
                  onClick={handleImageClick}
                />
              </motion.div>

              {userId === id && (
                <motion.button
                  onClick={handleEditProfile}
                  className="flex items-center px-5 py-2 rounded-full text-white font-medium 
                  bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
                  transform hover:scale-105 transition-all duration-300 shadow-lg text-sm mt-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </motion.button>
              )}
            </div>

            {/* User Info */}
            <div className=" px-4 pt-4">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                {data.payload.user.name || data.payload.user.username}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 flex items-center relative">
                @{data.payload.user.username}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500 mx-2"></span>
                <span className="text-xs py-1 px-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full">
                  Active User
                </span>
                <div className="-mt-4 h-5 w-5 -ml-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </p>

              {/* Bio */}
              {data.payload.user.bio && (
                <motion.div
                  className="mt-4 mb-6 bg-gray-50 dark:bg-gray-900/70 rounded-xl p-4 border border-gray-100 dark:border-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                >
                  <p className="text-gray-600 dark:text-gray-300">
                    {data.payload.user.bio}
                  </p>
                </motion.div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 mt-5">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FaEnvelope className="mr-2 text-blue-500" />
                  <span className="text-sm">
                    {data.payload.user.email || "user@example.com"}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <FaMapMarkerAlt className="mr-2 text-rose-500" />
                  <span className="text-sm">
                    {data.payload.user.location || "Location not specified"}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-around my-6 border-y border-gray-100 dark:border-gray-700/50 py-5">
                <motion.div
                  className="text-center px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  whileHover={{ y: -5 }}
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 inline-block text-transparent bg-clip-text">
                    {data.payload.user.friends?.length || 0}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Friends
                  </p>
                </motion.div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent my-auto"></div>
                <motion.div
                  className="text-center px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  whileHover={{ y: -5 }}
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 inline-block text-transparent bg-clip-text">
                    {data.payload.user.groups?.length || 0}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Groups
                  </p>
                </motion.div>
                <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-200 dark:via-gray-700 to-transparent my-auto"></div>
                <motion.div
                  className="text-center px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                  whileHover={{ y: -5 }}
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 inline-block text-transparent bg-clip-text">
                    {data.payload.user.posts?.length || 0}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Posts
                  </p>
                </motion.div>
              </div>

              {/* Friends Section */}
              <motion.div
                className="mt-8 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                    <FaUserFriends className="mr-2 text-blue-500" /> Friends
                  </h3>
                  <Link
                    to={`/friends/${data.payload.user._id}`}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 
                    transition-colors duration-200 text-sm flex items-center group"
                  >
                    See all ({data.payload.user.friends.length})
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/70 rounded-2xl p-5 border border-gray-100 dark:border-gray-800/50 shadow-inner">
                  <FriendsList friends={data.payload.user.friends} />
                </div>
              </motion.div>

              {/* Action Buttons */}
              {userId === id && (
                <motion.div
                  className="mt-10 space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.button
                      onClick={handleClick}
                      className="flex items-center justify-center px-6 py-3.5 rounded-xl text-white 
                      bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                      transition-all duration-300 shadow-lg shadow-emerald-500/20"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <FaUserPlus className="mr-2" />
                      Create New Group
                    </motion.button>

                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        to={`/my-groups/${data.payload.user._id}`}
                        className="flex items-center justify-center px-6 py-3.5 rounded-xl text-white 
                        bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700
                        transition-all duration-300 shadow-lg shadow-purple-500/20 w-full"
                      >
                        <FaUsers className="mr-2" />
                        My Groups
                      </Link>
                    </motion.div>
                  </div>

                  {userData?._id === id && (
                    <div className="mt-8 pb-2">
                      <motion.button
                        onClick={handleLogOut}
                        className="flex items-center justify-center px-6 py-3.5 rounded-xl text-white 
                        bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700
                        transition-all duration-300 shadow-lg shadow-rose-500/20 mx-auto"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <FaSignOutAlt className="mr-2" />
                        Log Out
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <div className="absolute top-40 right-12 h-24 w-24 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-60 left-12 h-32 w-32 bg-purple-500/10 rounded-full blur-3xl"></div>
        </motion.div>
      )}

      {makeGroupDrawer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-xl mx-4"
          >
            <MakeGroup userId={id} />
          </motion.div>
        </div>
      )}

      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl max-w-md w-full mx-4"
          >
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-800 dark:text-gray-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 flex items-center justify-center flex-col">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
                {data.payload.user.name}
              </h2>
              <div className="rounded-xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-2xl">
                <motion.img
                  src={
                    data.payload.user.avatar ||
                    "https://via.placeholder.com/400"
                  }
                  alt="User Avatar"
                  className="max-h-[400px] max-w-full object-cover"
                  layoutId="profileImage"
                />
              </div>
              <p className="mt-6 text-gray-600 dark:text-gray-300 flex items-center">
                <span className="text-blue-500 mr-2">@</span>
                {data.payload.user.username}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
