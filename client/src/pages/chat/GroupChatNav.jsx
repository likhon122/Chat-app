import React, { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { setGroupInfoDrawer } from "../../app/features/otherSlice";
import { FaXmark } from "react-icons/fa6";
import { useGetGroupDetailsQuery } from "../../app/api/api";
import { useNavigate } from "react-router-dom";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useGetSocket } from "../../SocketHelper";
import CallButtons from "./message/CallButtons";
import CallWindow from "./message/CallWindow";
import SingleSpinner from "../../components/Loaders/SingleSpinner";

const GroupChatNav = ({ chatId }) => {
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const chatMembers = useSelector((state) => state.other.members);
  const [isCallStarted, setIsCallStarted] = useState(false);

  // console.log(chatMembers);

  const user = useSelector((state) => state.auth.user);
  const { data, isLoading } = useGetGroupDetailsQuery(chatId);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useGetSocket();

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

  const isGroupChat = data?.payload?.chat.groupChat;
  const member = data?.payload?.chat.members.filter(
    (member) => member._id !== user._id
  );

  // if (isLoading) return <div>Loading...</div>;

  const chat = data?.payload?.chat;

  // Filter out the current user from members
  const friendMembers = chat?.members.filter(
    (member) => member._id !== user._id
  );

  return (
    <>
      <div className="bg-[#292c33] h-[5%] px-3 shadow-gray-600">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center justify-between w-full">
            {isLoading ? (
              <SingleSpinner size="h-6 w-6" />
            ) : (
              <div>
                {isGroupChat ? (
                  <div className="flex items-center cursor-default">
                    <div className="grid grid-cols-2  w-8 h-8 sm:w-8 sm:h-8 overflow-hidden rounded-full">
                      {chat.members.slice(0, 3).map((member, index) => (
                        <img
                          key={member._id}
                          src={member.avatar}
                          alt={member.name}
                          className={`object-cover bg-center ${
                            index === 2 ? "col-span-2" : ""
                          } w-full h-full`}
                        />
                      ))}
                    </div>
                    <span className="text-white ml-1 font-semibold text-[11px]">
                      {chat.chatName
                        ?.split("-")
                        .filter((name) => name !== user.name)}
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
                        className="w-8 h-8 rounded-full mr-2 object-cover bg-cover"
                      />
                    ))}
                    <span className="text-white font-semibold text-[11px]">
                      {chat.chatName
                        ?.split("-")
                        .filter((name) => name !== user.name)}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="pr-6">
              {!isGroupChat ? (
                <CallButtons chatId={chatId} member={member} />
              ) : (
                <div className="text-white text-xs">
                  Group Call is coming soon
                </div>
              )}
            </div>
          </div>
          <div
            className="flex items-center justify-end bg-gray-600 hover:bg-gray-400 duration-500 cursor-pointer h-[3.7vh] rounded-md px-1 mr-1"
            onClick={handleInfoButton}
          >
            {groupInfoDrawer ? (
              <FaXmark size={23} className="cursor-pointer dark:text-white" />
            ) : (
              <BsThreeDots
                size={23}
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
