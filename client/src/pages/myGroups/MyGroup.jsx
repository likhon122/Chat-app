import React, { useEffect, useState } from "react";
import { useGetMyGroupsQuery } from "../../app/api/api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setGroupId } from "../../app/features/otherSlice";

const MyGroup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data, isLoading, error, isError } = useGetMyGroupsQuery();

  useEffect(() => {
    if (data?.payload?.allGroups[0]?._id) {
      dispatch(setGroupId(data.payload.allGroups[0]._id));
    }
  }, [data, dispatch]);

  const handleClick = (chat) => {
    dispatch(setGroupId(chat._id));
    navigate(`/my-groups/${chat._id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[94.7vh] bg-gray-900 dark:bg-gray-900 text-white">
        <h1 className="text-xl font-semibold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="h-[94.7vh] overflow-y-auto bg-gray-900 text-white">
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
