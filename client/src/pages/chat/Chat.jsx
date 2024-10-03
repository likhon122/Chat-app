import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import GroupChatNav from "./GroupChatNav";
import GroupInfo from "./GroupInfo";
import Message from "./message/Message";
import MyChats from "./MyChats";

const Chat = () => {
  const { groupInfoDrawer } = useSelector((state) => state.other);
  const params = useParams();
  const { chatId } = params;

  return (
    <>
      <div className="md:hidden block">
        <div
          className={`${
            groupInfoDrawer ? "" : "h-[94vh] overflow-clip"
          } px-1 py-1 `}
        >
          <div className="">
            <GroupChatNav chatId={chatId} />
            {groupInfoDrawer ? (
              <div className="  ">
                <GroupInfo chatId={chatId} />
              </div>
            ) : (
              <div className="h-[92vh]">
                <Message chatId={chatId} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="hidden md:block  grid-cols-1 px-5 py-3">
        <div
          className={` ${
            groupInfoDrawer
              ? "md:grid grid-cols-[400px_1fr] xl:grid-cols-[400px_1fr_300px] gap-4"
              : "grid grid-cols-[400px_1fr] gap-5"
          }`}
        >
          <div className="">
            <MyChats />
          </div>
          <div
            className={`${
              groupInfoDrawer ? "hidden xl:block" : ""
            } border dark:border-gray-700 shadow-md shadow-gray-300 border-gray-300 dark:shadow-gray-700 rounded-md h-[92vh] overflow-hidden `}
          >
            <GroupChatNav chatId={chatId} />
            <Message chatId={chatId} />
          </div>
          {groupInfoDrawer && (
            <div className="">
              <GroupInfo chatId={chatId} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
