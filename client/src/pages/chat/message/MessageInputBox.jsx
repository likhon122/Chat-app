import React from "react";
import { FaPaperPlane, FaTimes, FaImage, FaSmile } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
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
  emojiRef,
  isUploading = false
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 relative">
      {/* Selected Images Preview */}
      <AnimatePresence>
        {selectedImage.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-1 bottom-[80px] w-[85%] max-w-lg bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2 px-1">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <FaImage className="mr-2 text-blue-500" />
                <span className="text-sm font-medium">
                  {selectedImage.length}{" "}
                  {selectedImage.length === 1 ? "image" : "images"} selected
                </span>
              </div>
              <button
                onClick={() =>
                  selectedImage.forEach((_, index) => handleRemoveImage(index))
                }
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div
              className={`grid gap-3 ${getGridClasses(selectedImage.length)}`}
            >
              {selectedImage.map((image, index) => (
                <motion.div
                  key={index}
                  className="relative rounded-lg overflow-hidden group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <img
                    src={image.url}
                    alt={`Selected ${index}`}
                    className={`object-cover w-full h-24 rounded-lg ${getItemClasses()}`}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/40 transition-colors"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input Form */}
      <form onSubmit={submitHandler} className="flex items-center space-x-3">
        {/* File Upload Button */}
        <motion.label
          htmlFor="file"
          className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-colors shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaImage className="text-blue-500 dark:text-blue-400" />
          <input
            type="file"
            name="file"
            id="file"
            multiple
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          />
        </motion.label>

        {/* Message Input */}
        <div className="relative flex-1">
          <input
            type="text"
            id="messageInput"
            placeholder="Type your message..."
            value={message}
            spellCheck={true}
            className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-700 rounded-full border-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-800 dark:text-gray-100 transition-all"
            onChange={handleMessageChange}
            ref={messageInputRef}
            disabled={isUploading}
          />

          {/* Send Button */}
          <motion.button
            className={`absolute right-1 top-1 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full ${
              message.trim() || selectedImage.length > 0
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                : "bg-gray-300 dark:bg-gray-600"
            } transition-colors`}
            type="submit"
           
            whileTap={{ scale: 0.92 }}
          >
            <FaPaperPlane className="text-white" size={14} />
          </motion.button>
        </div>

        {/* Emoji Picker */}
        <div className="relative" ref={emojiRef}>
          <motion.button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              showEmojiPicker
                ? "bg-blue-100 text-blue-500 dark:bg-blue-900/40 dark:text-blue-400"
                : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            } transition-all shadow-sm`}
            aria-label="Toggle emoji picker"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isUploading}
          >
            <FaSmile />
          </motion.button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-full right-0 mb-2 z-50"
              >
                <div className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    {/* Triangle pointer */}
                    <div className="absolute -bottom-6 right-4 w-4 h-4 bg-white dark:bg-gray-800 transform rotate-45 border-r border-b border-gray-200 dark:border-gray-700"></div>

                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      height={350}
                      width={300}
                      searchPlaceholder="Search emoji..."
                      previewConfig={{ showPreview: false }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
};

export default MessageInputBox;
