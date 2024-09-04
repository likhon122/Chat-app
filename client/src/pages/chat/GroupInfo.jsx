import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoMdExit } from "react-icons/io";
import {
  useDeleteGroupMutation,
  useGetGroupDetailsQuery,
  useLeaveGroupMutation
} from "../../app/api/api";
import { timeSince } from "../../helper/timeSince";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";

const GroupInfo = ({ chatId }) => {
  const navigate = useNavigate();

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
    return <div className="text-gray-400 text-center">Loading...</div>;

  return (
    <div className="flex flex-col min-h-[94.7vh] dark:bg-gray-900 dark:text-gray-200 px-4 py-8">
      <div className="flex-grow w-full mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-end">
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
                <p className="text-sm md:text-base">Remove Friend and</p>
                <p className="text-sm md:text-base">Delete Chat</p>
              </div>
              <IoMdExit size={24} />
            </div>
          )}
        </div>

        <div className="text-center my-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {data.payload.chat.chatName}
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
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
