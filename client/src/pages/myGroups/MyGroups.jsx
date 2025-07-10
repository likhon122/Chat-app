import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import MyGroup from "./MyGroup";
import MyGroupInfo from "./MyGroupInfo";

const MyGroups = () => {
  const { groupId, editGroup } = useSelector((state) => state.other);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 640);
  const navigate = useNavigate();

  console.log(isMobileView);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBackToList = () => {
    navigate("/my-groups");
  };

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop View */}
      <div className="hidden sm:flex h-full">
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 h-full overflow-hidden">
          <MyGroup />
        </div>
        <div className="w-2/3 h-full overflow-hidden">
          {groupId && <MyGroupInfo groupId={groupId} />}
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden h-full">
        {editGroup && groupId ? (
          <div className="h-full relative">
            <button
              onClick={handleBackToList}
              className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-md flex items-center justify-center"
            >
              <FaChevronLeft className="text-gray-700 dark:text-white" />
            </button>
            <MyGroupInfo groupId={groupId} />
          </div>
        ) : (
          <MyGroup />
        )}
      </div>
    </div>
  );
};

export default MyGroups;
