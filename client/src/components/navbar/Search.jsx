import { useEffect, useRef, useState } from "react";
import { IoSearch } from "react-icons/io5";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation
} from "../../app/api/api";
import { useSelector } from "react-redux";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";
import SingleSpinner from "../Loaders/SingleSpinner";

const Search = () => {
  const [searchValue, setSearchValue] = useState("");
  const sender = useSelector((state) => state.auth?.user?._id);

  const [searchUser, { isLoading, data, isError, error }] =
    useLazySearchUserQuery();
  const [sendFriendRequest] = useAsyncMutation(useSendFriendRequestMutation);
  const searchResultsRef = useRef(null); // Create a ref for the search results

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchValue) {
      searchUser(searchValue);
    }
  };

  const handleSendFriendRequest = async (receiver) => {
    try {
      await sendFriendRequest("Sending Friend Request!!", { sender, receiver });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (searchValue) {
        searchUser(searchValue);
      }
    }, 1000);
    return () => clearTimeout(timeOutId);
  }, [searchValue, searchUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target)
      ) {
        setSearchValue(""); // Clear search value to hide results
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-xs mx-auto">
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          type="search"
          className="bg-white dark:bg-[#3A3B3C] dark:text-white px-2 py-1 flex-grow border border-[#3A3B3C] rounded-l-md outline-none transition duration-300 hover:shadow-lg focus:shadow-lg text-sm"
          onChange={(e) => setSearchValue(e.target.value)}
          spellCheck={false}
          placeholder="Search users..."
        />
        <button
          type="submit"
          className="dark:bg-[#676767] dark:text-white dark:hover:bg-[#4e4e4e] transition duration-300 px-2 py-1 rounded-r-md flex items-center justify-center" // Smaller button
        >
          <IoSearch size={20} />
        </button>
      </form>
      {searchValue && (
        <div
          ref={searchResultsRef} // Attach ref to the search results container
          className={`absolute mt-2 w-full bg-white dark:bg-[#222222] shadow-lg rounded-md z-10 ${
            data || isError || isLoading ? "block" : "hidden"
          }`}
        >
          {isLoading ? (
            <div className="p-4">
              <SingleSpinner size="h-16 w-16" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data && !isError && data.payload.length > 0 ? (
                data.payload.map(({ _id, name, avatar, username }) => (
                  <div
                    key={_id}
                    className="flex items-center justify-between gap-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition"
                  >
                    <div className="flex gap-3">
                      <img
                        src={avatar}
                        alt="Profile"
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium dark:text-white">{name}</h3>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">
                          {username}
                        </h4>
                      </div>
                    </div>
                    <button
                      className="bg-blue-500 text-white hover:bg-blue-400 rounded-md px-2 py-1 transition duration-300"
                      onClick={() => handleSendFriendRequest(_id)}
                    >
                      Add Friend
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <h1 className="text-red-500">{error?.data?.errorMessage}</h1>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
