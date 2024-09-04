import React, { useEffect } from "react";
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

const Profile = () => {
  const userData = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth?.user?._id);
  const { makeGroupDrawer } = useSelector((state) => state.other);
  const id = params.userId;
  const { data, isError, error, isLoading } = useGetUserQuery(id);

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
      navigate("/sign-up");
    }
  }, [userData, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[94.7vh] text-lg text-gray-700 dark:text-gray-300 dark:bg-gray-900">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative h-[94.9vh] bg-gray-100 dark:bg-gray-900 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 mb-6">
        {data?.payload?.user && (
          <div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {data.payload.user.name}
              </h1>
              <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4">
                @{data.payload.user.username}
              </h2>
            </div>
            <div className="text-center mb-6">
              <Link
                to={`/friends/${data.payload.user._id}`}
                className="text-orange-500 dark:text-orange-400 font-semibold underline"
              >
                Friends ({data.payload.user.friends.length})
              </Link>
            </div>
            <div className="mt-8">
              <FriendsList friends={data.payload.user.friends} />
            </div>
            {userId === id && (
              <div className="flex justify-center gap-6 mt-8">
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
            <div className="text-center mt-6">
              <button
                className="bg-red-600 dark:bg-red-700 px-8 py-3 rounded-md text-white font-medium hover:bg-red-700 dark:hover:bg-red-800 transition duration-300"
                onClick={handleLogOut}
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
      {makeGroupDrawer && (
        <div className="absolute w-full inset-0 flex justify-center items-center">
          <MakeGroup userId={id} />
        </div>
      )}
    </div>
  );
};

export default Profile;
