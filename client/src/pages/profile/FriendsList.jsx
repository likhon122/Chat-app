import React, { useState } from "react";

const FriendsList = ({ friends }) => {
  // State to manage how many friends to show
  const [visibleCount, setVisibleCount] = useState(4);

  // Limit the friends array based on the visible count
  const displayedFriends = friends.slice(0, visibleCount);

  if (!friends || friends.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-300 text-center mt-4">
        No friends to display.
      </p>
    );
  }

  // Handler for Show More button
  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="flex flex-wrap justify-center gap-6">
        {displayedFriends.map((friend) => (
          <div
            key={friend._id}
            className="flex flex-col items-center w-52 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 p-4"
          >
            <div className="relative w-full">
              <img
                src={friend.avatar.url || "https://via.placeholder.com/150"}
                alt={friend.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 dark:border-blue-700 shadow-md"
              />
              <div className="absolute top-2 right-2">
                <span className="bg-blue-500 text-white text-xs font-semibold rounded-full px-2 py-1">
                  {friend.status || "Offline"}
                </span>
              </div>
            </div>
            <p className="text-gray-800 dark:text-gray-100 mt-4 text-lg font-semibold text-center">
              {friend.name}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              @{friend.username}
            </p>
            <button className="mt-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md px-3 py-1 text-xs font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition duration-200 transform hover:scale-105">
              Message
            </button>
          </div>
        ))}
      </div>
      {visibleCount < friends.length && (
        <button
          onClick={handleShowMore}
          className="mt-4 bg-blue-500 dark:bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium shadow-md hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300"
        >
          Show More
        </button>
      )}
    </div>
  );
};

export default FriendsList;
