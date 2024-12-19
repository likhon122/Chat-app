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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        Friends
      </h1>
      {data?.payload?.friends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.payload.friends.map((friend) => (
            <Link
              to={`/profile/${friend._id}`}
              key={friend._id}
              className="flex flex-col items-center w-full max-w-xs bg-gray-100 dark:bg-gray-700 rounded-lg shadow-lg transition-transform duration-300 transform hover:scale-105 p-4 mx-auto"
            >
              <div className="relative w-full">
                <img
                  src={friend.avatar || "https://via.placeholder.com/150"}
                  alt={friend.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-blue-500 dark:border-blue-700 shadow-md"
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

              <button className="mt-3 bg-blue-600 dark:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium shadow-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition duration-200 transform hover:scale-105">
                View Profile
              </button>
            </Link>
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
