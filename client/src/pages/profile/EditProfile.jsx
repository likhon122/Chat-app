import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  FaInfoCircle,
  FaCamera,
  FaUser,
  FaEnvelope,
  FaQuoteRight
} from "react-icons/fa";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { useEditProfileMutation } from "../../app/api/api";
import { setUser } from "../../app/features/authSlice";

const EditProfile = () => {
  const params = useParams();
  const user = useSelector((state) => state.auth.user);
  const userId = params.userId;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [changeImage, setChangeImage] = useState(null);
  const [imageChangeButton, setImageChangeButton] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipShowImage, setTooltipShowImage] = useState(false);

  const [editProfile, isLoading, data] = useAsyncMutation(
    useEditProfileMutation
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio);
      setAvatar(user.avatar);
    }
  }, [user]);

  useEffect(() => {
    if (data?.payload?.updatedUser) {
      const updatedUser = data.payload.updatedUser;
      dispatch(setUser(updatedUser));
      setName(updatedUser.name);
      setBio(updatedUser.bio);
      setAvatar(updatedUser.avatar);
    }
  }, [data, dispatch]);

  const handleMouseEnter = () => setShowTooltip(true);
  const handleMouseLeave = () => setShowTooltip(false);
  const handleMouseEnterImage = () => setTooltipShowImage(true);
  const handleMouseLeaveImage = () => setTooltipShowImage(false);

  const handleImageChange = (e) => {
    setChangeImage(e.target.files[0]);
    setImageChangeButton(false);
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setAvatar(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!changeImage || !userId) return;

    const formData = new FormData();
    formData.append("avatar", changeImage);
    formData.append("userId", userId);

    await editProfile("Updating Profile picture...", formData);
  };

  const handleNameChange = async (e) => {
    e.preventDefault();
    if (!name || !userId) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("userId", userId);
    await editProfile("Updating Name...", formData);
  };

  const handleBioChange = async (e) => {
    e.preventDefault();
    if (!bio || !userId) return;

    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("userId", userId);
    await editProfile("Updating Bio...", formData);
  };

  return (
    <div className=" flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 w-full max-w-md transition-all duration-300">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6 flex items-center justify-center">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
            Edit Profile
          </span>
        </h2>

        {/* Avatar Section */}
        <form onSubmit={handleImageSubmit} className="mb-[10px]">
          <div className="relative flex flex-col items-center">
            <div className="group relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg relative mx-auto">
                <img
                  src={
                    selectedImage || avatar || "https://via.placeholder.com/150"
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer"
                  onClick={() => document.getElementById("image-input").click()}
                >
                  <FaCamera className="text-white text-xl" />
                </div>
              </div>
              <input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </div>

            <div className="mt-4 text-center">
              <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span className="mr-1">Click image to change</span>
                <div className="relative inline-block">
                  <FaInfoCircle
                    className="cursor-pointer text-blue-500 hover:text-blue-600 transition-colors"
                    onMouseEnter={handleMouseEnterImage}
                    onMouseLeave={handleMouseLeaveImage}
                  />
                  {tooltipShowImage && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                      When you select a new image, click the Update Avatar
                      button to save your changes.
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={imageChangeButton}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    imageChangeButton
                      ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md hover:translate-y-[-1px]"
                  }
                `}
              >
                Update Avatar
              </button>
            </div>
          </div>
        </form>

        {/* Name Section */}
        <form onSubmit={handleNameChange} className="mb-6">
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
              <FaUser className="mr-2 text-blue-500" />
              Display Name
            </label>
            <input
              type="text"
              value={name}
              spellCheck="false"
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Enter your name"
            />
            <div className="pt-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:translate-y-[-1px] text-sm font-medium"
              >
                Update Name
              </button>
            </div>
          </div>
        </form>

        {/* Email Section (Read-only) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <label className="flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium">
              <FaEnvelope className="mr-2 text-blue-500" />
              Email Address
            </label>
            <div className="relative inline-block">
              <FaInfoCircle
                className="cursor-pointer text-blue-500 hover:text-blue-600 transition-colors"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              />
              {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                  You cannot change your email. Please contact our customer
                  service for assistance.
                  <div className="absolute -bottom-1 right-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              value={user?.email || ""}
              readOnly
              disabled
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 select-none pointer-events-none"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Read only
              </span>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <form onSubmit={handleBioChange} className="mb-6">
          <div className="space-y-2">
            <label className="flex items-center text-gray-700 dark:text-gray-300 text-sm font-medium mb-1">
              <FaQuoteRight className="mr-2 text-blue-500" />
              About Me
            </label>
            <textarea
              value={bio || ""}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
              rows="4"
              spellCheck="true"
              placeholder="Tell the world about yourself..."
            ></textarea>
            <div className="pt-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-all duration-200 hover:shadow-md hover:translate-y-[-1px] text-sm font-medium"
              >
                Update Bio
              </button>
            </div>
          </div>
        </form>

        {/* Status indicator */}
        {isLoading && (
          <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-sm rounded-lg text-center">
            Saving changes...
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
