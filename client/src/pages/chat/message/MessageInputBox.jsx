import { FaPaperPlane, FaTimes, FaUpload } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const MessageInputBox = ({
  selectedImage = [],
  getItemClasses,
  handleRemoveImage,
  submitHandler,
  handleFileChange,
  message,
  handleMessageChange,
  messageInputRef,
  getGridClasses,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  emojiRef
}) => {
  return (
    <>
      <div className="relative dark:bg-[#292c33] p-3 border-t border-gray-300 dark:border-gray-600">
        <div>
          {selectedImage.length > 0 && (
            <div
              className={`absolute left-4 md:left-28 bottom-[75px] bg-gray-300 dark:bg-[#374151] p-2 md:p-3 rounded-xl max-h-80 max-w-80 grid gap-2 ${getGridClasses(
                selectedImage.length
              )}`}
            >
              {selectedImage.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.url}
                    alt={`Selected ${index}`}
                    className={`object-cover rounded-lg border border-gray-600 ${getItemClasses()}`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    className="absolute top-0 right-0 bg-gray-500 dark:bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <form
          onSubmit={submitHandler}
          className="flex flex-row items-center space-x-2 sm:space-y-0 sm:space-x-4"
        >
          <label
            htmlFor="file"
            className=" relative text-blue-400 hover:text-blue-300 transition-colors duration-200 ease-in-out flex items-center cursor-pointer"
          >
            <FaUpload className="mr-2" />
            <span className="text-xs hidden sm:block cursor-pointer">
              Select Files
            </span>
            <input
              type="file"
              name="file"
              id="file"
              multiple
              className="opacity-0 absolute z-30 left-0 sm:w-[80px] w-6 cursor-pointer"
              onChange={handleFileChange}
            />
          </label>
          <div className="relative flex-1 w-full">
            <input
              type="text"
              id="messageInput"
              placeholder="Type your message..."
              value={message}
              spellCheck={true}
              className="border border-gray-600 dark:bg-gray-700 px-2 py-1 sm:p-2 rounded-lg dark:text-gray-200 text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all w-full"
              onChange={handleMessageChange}
              ref={messageInputRef}
            />

            <button
              className=" dark:bg-[#1230AE] text-[18px] font-semibold px-[9px] py-[7px] sm:py-[9px]  transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95  absolute right-0 top-[0px] border-y border-l dark:border-[#1230AE] rounded-e-lg border-gray-600"
              type="submit"
            >
              <FaPaperPlane className="text-[18px] sm:text-[22px] text-gray-600 dark:text-white" />
            </button>
          </div>
          <div className="relative hidden md:flex items-center " ref={emojiRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 transition duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle emoji picker"
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50 ">
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    height={400}
                    width={300}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default MessageInputBox;
