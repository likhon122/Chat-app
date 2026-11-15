import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaInfoCircle,
  FaCamera,
  FaUser,
  FaEnvelope,
  FaQuoteRight,
  FaArrowLeft
} from "react-icons/fa";
import { HiSparkles, HiShieldCheck } from "react-icons/hi2";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import { useEditProfileMutation } from "../../app/api/api";
import { setUser } from "../../app/features/authSlice";
import { toast } from "../../utils/alert";

const EditProfile = () => {
  const params = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const userId = params.userId;

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [changeImage, setChangeImage] = useState(null);
  const [imageChangeButton, setImageChangeButton] = useState(true);

  const [editProfile, isLoading, data] = useAsyncMutation(
    useEditProfileMutation
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    if (data?.payload?.updatedUser) {
      const updatedUser = data.payload.updatedUser;
      dispatch(setUser(updatedUser));
      setName(updatedUser.name || "");
      setBio(updatedUser.bio || "");
      setAvatar(updatedUser.avatar || "");
    }
  }, [data, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setChangeImage(file);
      setImageChangeButton(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!changeImage || !userId) return;

    const formData = new FormData();
    formData.append("avatar", changeImage);
    formData.append("userId", userId);

    await editProfile("Updating profile picture...", formData);
    setImageChangeButton(true);
  };

  const handleNameChange = async (e) => {
    e.preventDefault();
    if (!name.trim() || !userId) return;

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("userId", userId);
    await editProfile("Updating name...", formData);
  };

  const handleBioChange = async (e) => {
    e.preventDefault();
    if (!userId) return;

    const formData = new FormData();
    formData.append("bio", bio.trim());
    formData.append("userId", userId);
    await editProfile("Updating bio...", formData);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 bg-gray-50 dark:bg-[#0c0d12] text-gray-900 dark:text-gray-100 relative selection:bg-cyan-500 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="bg-white dark:bg-[#12131a] rounded-3xl shadow-2xl border border-gray-200/80 dark:border-white/10 p-6 sm:p-8 w-full max-w-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/profile/${userId}`)}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white inline-flex items-center gap-1.5 transition"
          >
            <FaArrowLeft className="w-3 h-3" />
            Back to Profile
          </button>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <HiSparkles className="w-3 h-3" />
            Customization
          </span>
        </div>

        <h1 className="text-2xl font-extrabold text-center mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
          Edit Profile
        </h1>

        {/* Avatar Section */}
        <form onSubmit={handleImageSubmit} className="mb-8">
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-100 dark:border-[#1a1c26] shadow-xl ring-2 ring-cyan-500/40 relative">
                <img
                  src={
                    selectedImage || avatar || "https://via.placeholder.com/150"
                  }
                  alt="Avatar"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200"
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

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Click photo to choose a new avatar
            </p>

            <button
              type="submit"
              disabled={imageChangeButton}
              className={`mt-3 text-xs font-semibold px-4 py-2 rounded-xl transition ${
                imageChangeButton
                  ? "bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-600 cursor-not-allowed"
                  : "btn-grad"
              }`}
            >
              Save New Photo
            </button>
          </div>
        </form>

        {/* Display Name Section */}
        <form onSubmit={handleNameChange} className="mb-6 space-y-2">
          <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
            <FaUser className="mr-2 text-cyan-500" />
            Display Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              spellCheck="false"
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#161822] text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              placeholder="Your full name"
            />
            <button
              type="submit"
              className="btn-grad text-xs font-semibold px-4 py-2.5 rounded-xl flex-shrink-0"
            >
              Update
            </button>
          </div>
        </form>

        {/* Read-Only Email Section */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              <FaEnvelope className="mr-2 text-cyan-500" />
              Email Address
            </label>
            <span className="text-[10px] text-gray-400">Verified & Locked</span>
          </div>
          <input
            type="text"
            value={user?.email || ""}
            readOnly
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-100/70 dark:bg-white/5 text-sm text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* Bio Section */}
        <form onSubmit={handleBioChange} className="space-y-2">
          <label className="flex items-center text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
            <FaQuoteRight className="mr-2 text-cyan-500" />
            Bio / About Me
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="3"
            spellCheck="true"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#161822] text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none"
            placeholder="Tell friends what you are building or passionate about..."
          />
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="btn-grad text-xs font-semibold px-5 py-2.5 rounded-xl"
            >
              Save Bio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
