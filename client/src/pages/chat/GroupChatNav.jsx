import React, { useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setGroupInfoDrawer } from "../../app/features/otherSlice";
import { FaXmark } from "react-icons/fa6";
import { useGetGroupDetailsQuery } from "../../app/api/api";
import { useNavigate } from "react-router-dom";

const GroupChatNav = ({ chatId }) => {
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const user = useSelector((state) => state.auth.user);
  const { data, isLoading } = useGetGroupDetailsQuery(chatId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInfoButton = () => {
    dispatch(setGroupInfoDrawer(!groupInfoDrawer));
  };

  const handleClick = () => {
    if (!data?.payload?.chat.groupChat) {
      const friend = data.payload.chat.members.filter(
        (member) => member._id !== user._id
      );
      navigate(`/profile/${friend[0]._id}`);
    }
  };

  useEffect(() => {
    dispatch(setGroupInfoDrawer(false));
  }, []);

  if (isLoading) return <div>Loading...</div>;

  const { chatName, members } = data.payload.chat;

  // Filter out the current user from members
  const friendMembers = members.filter((member) => member._id !== user._id);

  return (
    <>
      <div className="bg-[#111827] p-[6px]">
        <div className="flex items-center justify-between">
          {data?.payload?.chat.groupChat ? (
            <div className="flex items-center cursor-default">
              {members.slice(0, 3).map((member) => (
                <img
                  key={member._id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
              ))}
              {/* Display chat name */}
              <span className="text-white text-[10px]">
                {chatName?.split("-").filter((name) => name !== user.name)}
              </span>
            </div>
          ) : (
            <div
              className="flex items-center cursor-pointer"
              onClick={handleClick}
            >
              {friendMembers.map((member) => (
                <img
                  key={member._id}
                  src={member.avatar}
                  alt={member.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
              ))}
              {/* Display chat name */}
              <span className="text-white text-[10px]">
                {chatName?.split("-").filter((name) => name !== user.name)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-end">
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
