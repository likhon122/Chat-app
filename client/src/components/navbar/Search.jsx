import { useEffect, useState } from "react";

import { IoSearch } from "react-icons/io5";
import { toast } from "react-toastify";

import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation
} from "../../app/api/api";
import { useSelector } from "react-redux";
import { useAsyncMutation } from "../../hooks/useAsyncMutationHook";

const Search = () => {
  const [searchBox, setSearchBox] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const sender = useSelector((state) => state.auth?.user?._id);

  const [searchUser, { isLoading, data, isError, error }] =
    useLazySearchUserQuery();

  const [sendFriendRequest, sendFriendRequestIsLoading, sendFriendRequestData] =
    useAsyncMutation(useSendFriendRequestMutation);

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
    if (searchValue) {
      const timeOutId = setTimeout(async () => {
        try {
          await searchUser(searchValue);
        } catch (err) {
          console.error("Search failed:", err);
        }
      }, 1000);
      return () => clearTimeout(timeOutId);
    }
  }, [searchValue, searchUser]);

  return (
    <>
      <div>
        <div className="">
          <div>
            {!searchBox && (
              <div>
                <div
                  className="cursor-pointer "
                  onClick={() => setSearchBox(true)}
                >
                  <IoSearch size={20} />
                </div>
              </div>
            )}
            {searchBox && (
              <div>
                <div>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="search"
                      name=""
                      id=""
                      className="px-2 py-1"
                      onChange={(e) => setSearchValue(e.target.value)}
                      spellCheck={false}
                    />
                    <button>
                      <IoSearch size={20} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
          {searchValue && (
            <div
              className={` ${
                data || isError || isLoading ? "block" : "hidden"
              }`}
            >
              {isLoading ? (
                <div>
                  <h1>Loading...</h1>
                </div>
              ) : (
                ""
              )}
              <div className="">
                <div>
                  <div className="absolute">
                    <div className="flex flex-col gap-4">
                      {data && !isError && data.payload.length > 0 ? (
                        data.payload.map(({ _id, name, avatar, username }) => {
                          return (
                            <div
                              key={_id}
                              className="flex items-center justify-between gap-3 bg-slate-300 hover:bg-stone-400 cursor-pointer"
                            >
                              <div className="flex gap-3 ">
                                <img
                                  src={avatar}
                                  alt="Profile Image"
                                  className="h-10 w-10"
                                />
                                <h3>{name}</h3>
                                <h3>{username}</h3>
                              </div>
                              <div>
                                <button
                                  className="bg-blue-500 hover:bg-blue-200 duration-300"
                                  onClick={() => handleSendFriendRequest(_id)}
                                >
                                  Add Friend
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div>
                          <div>
                            <h1>{error?.data?.errorMessage}</h1>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div></div>
        </div>
      </div>
    </>
  );
};

export default Search;
