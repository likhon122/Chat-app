import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetMyGroupsQuery } from "../../app/api/api";
import { setEditGroup, setGroupId } from "../../app/features/otherSlice";
import { useGetSocket } from "../../SocketHelper";
import SingleSpinner from "../../components/Loaders/SingleSpinner";

const MyGroup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useGetSocket();

  const { data, isLoading, isFetching, refetch } = useGetMyGroupsQuery();

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
      <div className="flex items-center justify-center h-[80.7vh] dark:bg-[#181818] text-white">
        <h1 className="text-xl font-semibold flex items-center justify-center h-full">
          <SingleSpinner size="w-10 h-10 " />
        </h1>
      </div>
    );
  }

  return (
    <div className="h-[94.7vh] overflow-y-auto dark:bg-[#181818] text-white">
      {(!data?.payload?.allGroups?.length ||
        data.payload.allGroups.length === 0) && (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-lg font-semibold text-gray-400">
            Please send a Friend request!
          </h1>
        </div>
      )}
      {data?.payload?.allGroups?.length > 0 && (
        <div className="p-4 space-y-4">
          {data.payload.allGroups.map((chat) => (
            <article
              key={chat._id}
              className="bg-gray-800 border border-gray-700 hover:bg-gray-700 transition duration-200 ease-in-out rounded-lg cursor-pointer"
              onClick={() => handleClick(chat)}
            >
              <div className="flex items-center p-4">
                {chat.groupChat ? (
                  <div className="flex space-x-2">
                    {chat.avatar.map((avatar, index) => (
                      <img
                        key={index}
                        src={avatar}
                        className="w-12 h-12 rounded-full object-cover"
                        alt="Group Avatar"
                      />
                    ))}
                  </div>
                ) : (
                  <img
                    src={chat.avatar}
                    className="w-12 h-12 rounded-full object-cover"
                    alt="Group Avatar"
                  />
                )}
                <h2 className="ml-4 text-lg font-semibold truncate">
                  {chat.chatName}
                </h2>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGroup;
