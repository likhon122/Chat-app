import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetMyGroupsQuery } from "../../app/api/api";
import { setEditGroup, setGroupId } from "../../app/features/otherSlice";
import { useGetSocket } from "../../SocketHelper";
import { FaUsers, FaUserFriends } from "react-icons/fa";
import { BsChatDots } from "react-icons/bs";

const MyGroup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useGetSocket();

  const { data, isLoading, refetch } = useGetMyGroupsQuery();

  useEffect(() => {
    if (data?.payload?.allGroups[0]?._id) {
      dispatch(setGroupId(data.payload.allGroups[0]._id));
    }
  }, [data, dispatch]);

  const handleClick = (chat) => {
    dispatch(setGroupId(chat._id));
    dispatch(setEditGroup(true));
    navigate(`/my-groups/${chat._id}`);
  };

  useEffect(() => {
    const newMessageAlertHandler = () => {
      refetch();
    };

    socket.on("REFETCH_CHATS", newMessageAlertHandler);

    return () => {
      socket.off("REFETCH_CHATS", newMessageAlertHandler);
    };
  }, [socket, refetch]);

  useEffect(() => {
    dispatch(setEditGroup(false));
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 relative">
          <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          <div className="w-10 h-10 absolute top-3 left-3 rounded-full border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm font-medium">
          Loading your groups...
        </p>
      </div>
    );
  }

  const noGroups =
    !data?.payload?.allGroups?.length || data.payload.allGroups.length === 0;

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <FaUsers className="mr-2 text-blue-500" />
          My Groups
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {noGroups
            ? "No groups yet"
            : `${data.payload.allGroups.length} groups`}
        </p>
      </div>

      {/* Empty State */}
      {noGroups && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full">
            <FaUserFriends className="text-4xl text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
            No Groups Yet
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-xs">
            Send friend requests and create your first group to start chatting!
          </p>
        </div>
      )}

      {/* Group List */}
      {!noGroups && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {data.payload.allGroups.map((chat) => (
            <div
              key={chat._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => handleClick(chat)}
            >
              <div className="p-4 flex items-center">
                {/* Group Avatar(s) */}
                <div className="relative">
                  {chat.groupChat ? (
                    <div className="flex">
                      {chat.avatar.slice(0, 2).map((avatar, index) => (
                        <div
                          key={index}
                          className={`w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden ${
                            index > 0 ? "-ml-4" : ""
                          }`}
                          style={{ zIndex: 2 - index }}
                        >
                          <img
                            src={avatar}
                            className="w-full h-full object-cover"
                            alt="Group member"
                          />
                        </div>
                      ))}
                      {chat.avatar.length > 2 && (
                        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center -ml-4 border-2 border-white dark:border-gray-800 text-white font-medium text-xs">
                          +{chat.avatar.length - 2}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                      <img
                        src={chat.avatar}
                        className="w-full h-full object-cover"
                        alt="Group Avatar"
                      />
                    </div>
                  )}

                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border border-white dark:border-gray-800">
                    <BsChatDots className="text-white text-xs" />
                  </div>
                </div>

                {/* Group Info */}
                <div className="ml-4 flex-1 overflow-hidden">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                    {chat.chatName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {chat.groupChat
                      ? `${chat.avatar.length} members`
                      : "Direct message"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroup;
