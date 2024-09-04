import React, { useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setGroupInfoDrawer } from "../../app/features/otherSlice";
import { FaXmark } from "react-icons/fa6";

const GroupChatNav = ({ chatId }) => {
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const dispatch = useDispatch();

  const handleInfoButton = () => {
    dispatch(setGroupInfoDrawer(!groupInfoDrawer));
  };

  useEffect(() => {
    dispatch(setGroupInfoDrawer(false));
  }, []);

  return (
    <>
      <div>
        <div className="bg-[#111827] p-[6px] md:block hidden">
          <div className=" flex items-center justify-end mr-6">
            {groupInfoDrawer ? (
              <FaXmark
                size={23}
                onClick={handleInfoButton}
                className="cursor-pointer dark:text-white"
              />
            ) : (
              <BsThreeDots
                size={23}
                onClick={handleInfoButton}
                className="cursor-pointer dark:text-white"
              />
            )}
          </div>
        </div>
        <div className="bg-[#111827] p-[6px] md:hidden">
          <div className=" flex items-center justify-end mr-6">
            {groupInfoDrawer ? (
              <FaXmark
                size={23}
                onClick={handleInfoButton}
                className="cursor-pointer dark:text-white"
              />
            ) : (
              <BsThreeDots
                size={23}
                onClick={handleInfoButton}
                className="cursor-pointer dark:text-white"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupChatNav;
