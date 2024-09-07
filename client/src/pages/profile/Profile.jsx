import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetUserQuery } from "../../app/api/api";
import MakeGroup from "./MakeGroup";
import { useDispatch, useSelector } from "react-redux";
import { setMakeGroupDrawer } from "../../app/features/otherSlice";
import axios from "axios";
import { toast } from "react-toastify";
import { removeUser } from "../../app/features/authSlice";
import { serverUrl } from "../../../index";
import FriendsList from "./FriendsList";
import DuelSpinner from "../../components/Loaders/DuelSpinner";
import ProfileModal from "./ProfileModal";
import { FaUserFriends } from "react-icons/fa";

const Profile = () => {
  const userData = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth?.user?._id);
  const { makeGroupDrawer } = useSelector((state) => state.other);
  const id = params.userId;
  const { data, isError, error, isLoading } = useGetUserQuery(id);

  const [isModalOpen, setIsModalOpen] = useState(false);

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
  };

  useEffect(() => {
    if (!userData) {
      setTimeout(() => {
        navigate("/sign-up");
      }, 1000);
    }
  }, [userData, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[94.7vh] text-lg text-gray-700 dark:text-gray-300 dark:bg-gray-900">
        <DuelSpinner />
      </div>
    );
  }

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="relative min-h-[100vh] sm:h-[94.9vh] sm:min-h-max bg-gray-100 dark:bg-gray-900 flex flex-col items-center p-6">
      <div className="w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 mb-6">
        {data?.payload?.user && (
          <div>
            <div className="flex justify-center items-center mb-4 cursor-pointer">
              {" "}
              <img
                src={
                  data.payload.user.avatar || "path/to/placeholder-image.png"
                }
                alt="User Avatar"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4  shadow-lg transition-transform duration-300 transform hover:scale-105" // Added shadow for depth
                onClick={handleImageClick}
              />
            </div>
            <div className="text-center mt-4">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {data.payload.user.name}
              </h1>
              <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                @{data.payload.user.username}
              </h2>
            </div>

            <div className="mt-8">
              <div>
                <div className="mb-[-20px] border-b-2 w-20 ">
                  <h3 className="font-bold text-lg sm:text-xl dark:text-white">
                    Friends
                  </h3>
                </div>
              </div>
              <FriendsList friends={data.payload.user.friends} />
            </div>
            <div className="text-center mt-4">
              <Link
                to={`/friends/${data.payload.user._id}`}
                className="inline-flex items-center justify-center px-4 py-2 text-lg font-semibold text-orange-500 dark:text-gray-300 rounded-md bg-orange-100 dark:bg-orange-800 hover:bg-orange-200 dark:hover:bg-orange-600 transition-all duration-300 ease-in-out shadow-md"
              >
                <span className="mr-2">
                  <FaUserFriends className="h-5 w-5 mr-2" />
                </span>
                See all Friends ({data.payload.user.friends.length})
              </Link>
            </div>

            {userId === id && (
              <div className="flex flex-col sm:flex-row justify-center sm:gap-6 gap-2 mt-8 text-center">
                <button
                  className="bg-blue-600 dark:bg-blue-700 px-8 py-3 rounded-md text-white font-medium hover:bg-blue-700 dark:hover:bg-blue-800 transition duration-300"
                  onClick={handleClick}
                >
                  Make Group
                </button>
                <Link
                  to={`/my-groups/${data.payload.user._id}`}
                  className="bg-green-600 dark:bg-green-700 px-8 py-3 rounded-md text-white font-medium hover:bg-green-700 dark:hover:bg-green-800 transition duration-300"
                >
                  My Groups
                </Link>
              </div>
            )}
            {userData?._id === id && (
              <div className="text-center mt-6">
                <button
                  className="bg-red-600 dark:bg-red-700 px-8 py-3 rounded-md text-white font-medium hover:bg-red-700 dark:hover:bg-red-800 transition duration-300"
                  onClick={handleLogOut}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {makeGroupDrawer && (
        <div className="absolute w-full inset-0 flex justify-center items-center">
          <MakeGroup userId={id} />
        </div>
      )}
      {isModalOpen && (
        <ProfileModal onClose={() => setIsModalOpen(false)}>
          <div className="p-4 flex items-center justify-center flex-col">
            <h2 className="text-lg sm:text-xl font-bold mb-2">
              {data.payload.user.name}
            </h2>
            <img
              src={data.payload.user.avatar}
              alt="User Avatar"
              className="max-h-[260px] max-w-[260px] sm:max-h-[300px] md:max-w-[340px] "
            />
            <p className="mt-2 text-sm sm:text-base ">
              @{data.payload.user.username}
            </p>
          </div>
        </ProfileModal>
      )}
    </div>
  );
};

export default Profile;
