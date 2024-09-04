import React from "react";
import { Link, useParams } from "react-router-dom";
import { useGetFriendsQuery } from "../../app/api/api";

const Friends = () => {
  const params = useParams();
  const id = params.userId;
  const { data, isError, error, isLoading } = useGetFriendsQuery(id);

  return isLoading ? (
    <div className="flex justify-center items-center h-screen text-lg text-gray-700 dark:text-gray-300">
      Loading...
    </div>
  ) : (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Friends
      </h1>
      {data?.payload?.friends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.payload.friends.map((friend) => (
            <div
              key={friend._id}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Link
                to={`/profile/${friend._id}`}
                className="block text-lg font-semibold text-gray-800 dark:text-gray-100 hover:text-orange-500 dark:hover:text-orange-400"
              >
                {friend.name}
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 dark:text-gray-400">
          No friends found.
        </div>
      )}
    </div>
  );
};

export default Friends;
