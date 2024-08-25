import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaXmark } from "react-icons/fa6";

import {
  useAcceptFriendRequestMutation,
  useFriendRequestNotificationQuery,
  useRejectFriendRequestMutation
} from "../../app/api/api";
import { setNotificationDrawer } from "../../app/features/otherSlice";
import { toast } from "react-toastify";

const NotificationDrawer = () => {
  // const drawerToggle = useSelector((state) => state.other);
  const { data, isLoading, error } = useFriendRequestNotificationQuery();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(setNotificationDrawer(false));
  };

  const handleConfirmRequest = async (id) => {
    try {
      await acceptFriendRequest({ acceptId: id });
    } catch (error) {
      toast.error("Something Went wrong!!");
    }
  };

  const handleRejectRequest = async (id) => {
    try {
      await rejectFriendRequest({ deleteId: id });
    } catch (error) {
      toast.error("Something Went wrong!!");
    }
  };
  return (
    <>
      <div className="absolute right-0 mt-1 bg-neutral-200 min-h-[500px] max-h-screen overflow-y-scroll p-4 ">
        <div>
          <div className="cursor-pointer m-2" onClick={handleClick}>
            <FaXmark size={22} />
          </div>
        </div>

        <div className="">{isLoading && <h3>Loading...</h3>}</div>

        <div>
          {!isLoading && !error && data?.payload?.friendRequests.length > 0
            ? data.payload.friendRequests.map(({ _id, sender }) => (
                <div
                  key={_id}
                  className="flex justify-center items-center hover:bg-slate-400 p-2 cursor-pointer border border-black gap-3"
                >
                  <img src={sender.avatar} className="h-14 w-14" />
                  <h3>{sender.name}</h3>
                  <button
                    className="bg-green-300 p-2 hover:bg-slate-50"
                    onClick={() => handleConfirmRequest(_id)}
                  >
                    Confirm
                  </button>
                  <button
                    className="bg-red-300 p-2 hover:bg-slate-50"
                    onClick={() => handleRejectRequest(_id)}
                  >
                    Reject
                  </button>
                </div>
              ))
            : "No notification here!!"}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
