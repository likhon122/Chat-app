import { useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { FaXmark } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { setGroupInfoDrawer } from "../../app/features/otherSlice";
import { useGetGroupDetailsQuery } from "../../app/api/api";
import CallButtons from "./message/CallButtons";
import SingleSpinner from "../../components/Loaders/SingleSpinner";

const GroupChatNav = ({ chatId }) => {
  const { groupInfoDrawer } = useSelector((state) => state.other);

  // console.log(chatMembers);

  const user = useSelector((state) => state.auth.user);
  const { data, isLoading, isError } = useGetGroupDetailsQuery(chatId);

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

  useEffect(() => {
    if (isError) {
      navigate("/chat");
      toast.error("Something went wrong!");
    }
  }, [isError, navigate]);

  const isGroupChat = data?.payload?.chat.groupChat;
  const member = data?.payload?.chat.members.filter(
    (member) => member._id !== user._id
  );

  const chat = data?.payload?.chat;

  const friendMembers = chat?.members.filter(
    (member) => member._id !== user._id
  );

  return (
    <>
      <div className="dark:bg-[#292c33] h-[5%]  bg-[#F3F4F6] px-3 border-gray-300 border-b dark:shadow-gray-600 dark:border-b-gray-600 dark:shadow-md">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center justify-between w-full h-full">
            {isLoading ? (
              <SingleSpinner size="h-6 w-6" />
            ) : (
              <div>
                {isGroupChat ? (
                  <div className="flex items-center cursor-default">
                    <div className="grid grid-cols-2  w-8 h-8 sm:w-8 overflow-hidden rounded-full">
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
                    <span className="dark:text-white text-gray-600 ml-1 font-semibold text-[11px]">
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
                    {friendMembers?.map((member) => (
                      <img
                        key={member._id}
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full mr-2 object-cover bg-cover"
                      />
                    ))}
                    <span className="dark:text-white text-gray-600  font-semibold text-[11px]">
                      {
                        chat?.chatName
                          .split("-")
                          .filter((name) => name !== user.name)[0]
                      }
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="mr-6 ">
              {!isGroupChat ? (
                <CallButtons chatId={chatId} member={member} />
              ) : (
                <div className="dark:text-white text-gray-600  text-xs">
                  Group Call is coming soon
                </div>
              )}
            </div>
          </div>
          <div
            className="flex items-center justify-end dark:bg-gray-600 bg-gray-400 hover:bg-gray-500 dark:hover:bg-gray-400 duration-500 cursor-pointer h-[3.7vh] rounded-md px-1 mr-1"
            onClick={handleInfoButton}
          >
            {groupInfoDrawer ? (
              <FaXmark
                size={23}
                className="cursor-pointer dark:text-white text-white"
              />
            ) : (
              <BsThreeDots
                size={23}
                className="cursor-pointer dark:text-white text-white"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GroupChatNav;
