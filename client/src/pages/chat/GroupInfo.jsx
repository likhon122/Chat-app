import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdExit, IoIosArrowBack } from "react-icons/io";
import {
  useDeleteGroupMutation,
  useGetGroupDetailsQuery,
  useLeaveGroupMutation
} from "../../app/api/api";
import { timeSince } from "../../helper/timeSince";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import SingleSpinner from "../../components/Loaders/SingleSpinner";
import { useDispatch, useSelector } from "react-redux";
import { setGroupInfoDrawer } from "../../app/features/otherSlice";

const GroupInfo = ({ chatId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const { data, isError, isLoading } = useGetGroupDetailsQuery(chatId);
  const [leaveGroup, leaveGroupLoading, leaveGroupData] = useAsyncMutation(
    useLeaveGroupMutation
  );
  const [deleteChat, deleteChatLoading, deleteChatData] = useAsyncMutation(
    useDeleteGroupMutation
  );

  const created = timeSince(data?.payload?.chat.createdAt);

  const leaveGroupHandler = () => {
    leaveGroup("Leaving group...", chatId);
  };

  const removeFriendAndDeleteChatHandler = () => {
    deleteChat("Deleting chat and unfriend...", chatId);
  };

  useEffect(() => {
    if (leaveGroupData?.success || deleteChatData?.success) {
      navigate("/chat");
    }
  }, [leaveGroupData, navigate, deleteChatData]);

  if (isError)
    return (
      <div className="text-red-500 text-center">
        Error occurred! Something went wrong.
      </div>
    );

  if (isLoading)
    return (
      <div className="text-gray-400 text-center dark:bg-darkBg h-[85.9vh] overflow-hidden items-center justify-center flex">
        <SingleSpinner size="h-14 w-14" />
      </div>
    );

  return (
    <div className="flex flex-col min-h-[92vh] dark:bg-darkBg dark:text-gray-200 px-3 py-3 rounded-lg border border-gray-600 shadow-md shadow-gray-600 m-2 md:mt-0 relative">
      <div className="flex-grow w-full mx-auto  ">
        <div className="flex justify-end ">
          <div
            onClick={() => dispatch(setGroupInfoDrawer(false))}
            className="cursor-pointer bg-gray-600 hover:bg-gray-400 duration-500  rounded-md px-1 py-[6px] absolute left-3 top-2 xl:hidden"
          >
            <IoIosArrowBack size={22} className="font-bold " />
          </div>

          {data.payload.chat.groupChat ? (
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-red-500"
              onClick={leaveGroupHandler}
            >
              <p className="underline text-sm md:text-base">Leave Group</p>
              <IoMdExit size={24} />
            </div>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-red-500"
              onClick={removeFriendAndDeleteChatHandler}
            >
              <div className="flex flex-col text-center">
                <p className="text-sm ">Remove Friend and Delete Chat</p>
              </div>
              <IoMdExit size={24} />
            </div>
          )}
        </div>

        <div className="text-center my-4">
          {data.payload.chat.groupChat ? (
            <div className="grid grid-cols-2  w-24 h-24 overflow-hidden rounded-full mx-auto">
              {data.payload.chat.members.slice(0, 3).map((member, index) => (
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
          ) : (
            <img
              src={
                data.payload.chat.members.filter(
                  (member) => member._id !== user._id
                )[0].avatar
              }
              alt="sender Image"
              className="w-24 h-24 rounded-full  object-cover bg-cover mx-auto"
            />
          )}

          <h2 className=" text-[13px] mt-3 font-semibold text-gray-800 dark:text-gray-200 md:text-[14px] ">
            {data.payload.chat.chatName
              .split("-")
              .filter((name) => name !== user.userName)[0].length > 20
              ? data.payload.chat.chatName
                  .split("-")
                  .filter((name) => name !== user.userName)[0]
                  .split(0, 20) + "..."
              : data.payload.chat.chatName
                  .split("-")
                  .filter((name) => name !== user.userName)[0]}
          </h2>
          <p className="text-gray-400 text-[10px] md:text-[13px] font-semibold">
            Created: {created}
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-2">Members</h2>
          <div className="space-y-2">
            {data.payload.chat.members.length > 0 ? (
              data.payload.chat.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-2 p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <Link
                    to={`/profile/${member._id}`}
                    className="text-orange-400 font-semibold hover:underline"
                  >
                    {member.name}
                  </Link>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No members found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
