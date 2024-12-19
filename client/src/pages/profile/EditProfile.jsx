import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FaInfoCircle } from "react-icons/fa";
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-darkBg p-4 sm:p-6">
      <div className="border border-gray-900 shadow-gray-600 shadow-sm rounded-lg p-8 w-full max-w-md">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 dark:text-white mb-4 sm:mb-6">
          Edit Profile
        </h2>

        <form onSubmit={handleImageSubmit}>
          <div className="mb-4 sm:mb-6 relative">
            <div className="flex justify-center mb-2 sm:mb-4">
              <img
                src={selectedImage || avatar}
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-300 dark:border-gray-600 object-cover cursor-pointer"
                onClick={() => document.getElementById("image-input").click()}
              />
            </div>
            <input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            <div>
              <div className="ml-2 relative">
                <span
                  className="text-gray-600 dark:text-gray-400 cursor-pointer"
                  onMouseEnter={handleMouseEnterImage}
                  onMouseLeave={handleMouseLeaveImage}
                >
                  <FaInfoCircle />
                </span>
                {tooltipShowImage && (
                  <div className="absolute z-10 w-40 sm:w-48 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg text-center">
                    When you click change image button then you can change your
                    image. Without it, it's not changeable.
                  </div>
                )}
              </div>
              <button
                className="mt-2 bg-gray-700 text-white py-1 px-3 rounded-md hover:bg-gray-600 transition duration-200"
                type="submit"
                disabled={imageChangeButton}
              >
                Change Image
              </button>
            </div>
          </div>
        </form>

        <form onSubmit={handleNameChange}>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Change Name
            </h3>
            <input
              type="text"
              value={name}
              spellCheck="false"
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your name"
            />
            <button className="mt-2 bg-gray-700 text-white py-1 px-3 rounded-md hover:bg-gray-600 transition duration-200">
              Change Name
            </button>
          </div>
        </form>

        <div className="mb-4 sm:mb-6">
          <div className="flex items-center">
            <h3 className="text-xs sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Change Email
            </h3>
            <div className="ml-2 relative">
              <span
                className="text-gray-600 dark:text-gray-400 cursor-pointer"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <FaInfoCircle />
              </span>
              {showTooltip && (
                <div className="absolute z-10 w-40 sm:w-48 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg text-center">
                  You do not change your email! Please contact our customer
                  service or email us!!
                </div>
              )}
            </div>
          </div>

          <input
            type="text"
            value={user?.email}
            readOnly
            disabled
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white select-none pointer-events-none"
            style={{ userSelect: "none", pointerEvents: "none" }}
          />
        </div>

        <form onSubmit={handleBioChange}>
          <div className="mb-4 sm:mb-6">
            <h3 className="text-xs sm:text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Change Bio
            </h3>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
              spellCheck="true"
              placeholder="Tell us about yourself"
            ></textarea>
            <button className="mt-2 bg-gray-700 text-white py-1 px-3 rounded-md hover:bg-gray-600 transition duration-200">
              Change Bio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
