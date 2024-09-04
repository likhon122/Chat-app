import React from "react";
import { BsThreeDots } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setGroupInfoDrawer } from "../../app/features/otherSlice";

const GroupChatNav = ({ chatId }) => {
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const dispatch = useDispatch();

  const handleInfoButton = () => {
    dispatch(setGroupInfoDrawer(!groupInfoDrawer));
  };

  return (
    <>
      <div>
        <div className="bg-[#111827] p-[6px]">
          <div className=" flex items-center justify-end mr-6">
            <BsThreeDots
              size={23}
              onClick={handleInfoButton}
              className="cursor-pointer dark:text-white"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupChatNav;
