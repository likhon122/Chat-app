import React, { useRef } from "react";
import {
  HiPaperAirplane,
  HiPhoto,
  HiFaceSmile,
  HiArrowPath,
  HiPlus
} from "react-icons/hi2";
import {
  FaXmark,
  FaFilePdf,
  FaFileLines,
  FaFileAudio,
  FaFileVideo
} from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker from "emoji-picker-react";

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getFileCategory = (item) => {
  const type = item.type || "";
  const name = item.name?.toLowerCase() || "";
  if (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name)
  )
    return "image";
  if (
    type.startsWith("video/") ||
    /\.(mp4|webm|mov|mkv|avi)$/i.test(name)
  )
    return "video";
  if (
    type.startsWith("audio/") ||
    /\.(mp3|wav|ogg|m4a|aac)$/i.test(name)
  )
    return "audio";
  if (type.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  return "document";
};

const MessageInputBox = ({
  attachments = [],
  selectedImage = [],
  handleRemoveAttachment,
  handleRemoveImage,
  handleClearAll,
  submitHandler,
  handleFileChange,
  message,
  handleMessageChange,
  messageInputRef,
  showEmojiPicker,
  setShowEmojiPicker,
  handleEmojiClick,
  emojiRef,
  isUploading = false
}) => {
  const fileInputRef = useRef(null);

  // Normalize attachments list
  const activeAttachments =
    attachments && attachments.length > 0 ? attachments : selectedImage;

  const hasContent =
    message.trim().length > 0 || activeAttachments.length > 0;

  const removeHandler = (item, index) => {
    if (handleRemoveAttachment) {
      handleRemoveAttachment(item.id || index);
    } else if (handleRemoveImage) {
      handleRemoveImage(index);
    }
  };

  const clearAllHandler = () => {
    if (handleClearAll) {
      handleClearAll();
    } else if (handleRemoveImage) {
      for (let i = activeAttachments.length - 1; i >= 0; i--) {
        handleRemoveImage(i);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-[#12131a] border-t border-gray-100 dark:border-white/5 p-2.5 sm:p-3 relative">
      {/* Attachments Preview Dock */}
      <AnimatePresence>
        {activeAttachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute left-2.5 right-2.5 bottom-[calc(100%+8px)] max-w-2xl mx-auto bg-white/95 dark:bg-[#161822]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-white/10 p-3 z-30"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2.5 px-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
                <span>
                  {activeAttachments.length}{" "}
                  {activeAttachments.length === 1 ? "attachment" : "attachments"}{" "}
                  <span className="text-gray-400 font-normal">(max 5)</span>
                </span>
              </div>
              <button
                type="button"
                onClick={clearAllHandler}
                disabled={isUploading}
                className="text-gray-400 hover:text-rose-500 text-xs font-medium px-2 py-0.5 rounded-lg hover:bg-rose-500/10 transition disabled:opacity-50"
              >
                Clear all
              </button>
            </div>

            {/* Attachments Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-0.5">
              {activeAttachments.map((item, index) => {
                const category = getFileCategory(item);
                const isImage = category === "image";
                const isVideo = category === "video";
                const isAudio = category === "audio";
                const isPdf = category === "pdf";

                return (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/25 flex flex-col h-24 sm:h-28 shadow-sm transition hover:border-cyan-500/40"
                  >
                    {/* Visual Preview */}
                    {isImage ? (
                      <div className="relative w-full h-full overflow-hidden bg-black/10">
                        <img
                          src={item.url}
                          alt={item.name || `Preview ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-1.5 left-2 right-2 text-left pointer-events-none">
                          <p className="text-[11px] font-semibold text-white truncate drop-shadow-sm">
                            {item.name || `Image ${index + 1}`}
                          </p>
                          <p className="text-[9px] text-gray-300 drop-shadow-sm">
                            {formatFileSize(item.size)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                        <div className="mb-1 flex items-center justify-center">
                          {isPdf ? (
                            <div className="text-rose-500 bg-rose-500/10 p-2 rounded-xl">
                              <FaFilePdf className="w-5 h-5" />
                            </div>
                          ) : isVideo ? (
                            <div className="text-cyan-500 bg-cyan-500/10 p-2 rounded-xl">
                              <FaFileVideo className="w-5 h-5" />
                            </div>
                          ) : isAudio ? (
                            <div className="text-amber-500 bg-amber-500/10 p-2 rounded-xl">
                              <FaFileAudio className="w-5 h-5" />
                            </div>
                          ) : (
                            <div className="text-blue-500 bg-blue-500/10 p-2 rounded-xl">
                              <FaFileLines className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate w-full px-1">
                          {item.name || `File ${index + 1}`}
                        </p>
                        <p className="text-[9px] text-gray-500 dark:text-gray-400">
                          {formatFileSize(item.size)}
                        </p>
                      </div>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHandler(item, index);
                      }}
                      disabled={isUploading}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center backdrop-blur-md transition shadow-md opacity-90 group-hover:opacity-100 disabled:opacity-50"
                      title="Remove attachment"
                    >
                      <FaXmark className="w-2.5 h-2.5" />
                    </button>
                  </motion.div>
                );
              })}

              {/* Add More Slot (if fewer than 5) */}
              {activeAttachments.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-xl border border-dashed border-gray-300 dark:border-white/15 hover:border-cyan-500/60 dark:hover:border-cyan-400/60 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-cyan-500/[0.05] flex flex-col items-center justify-center h-24 sm:h-28 text-gray-400 hover:text-cyan-500 transition group disabled:opacity-50"
                  title="Add more attachments"
                >
                  <HiPlus className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium">Add more</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input Form */}
      <form onSubmit={submitHandler} className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          id="chatFileInput"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFileChange(e);
            e.target.value = "";
          }}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        {/* File / Media Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-cyan-600 dark:text-cyan-400 border border-transparent dark:border-white/5 transition active:scale-95 disabled:opacity-50"
          title="Attach photos, videos, or documents"
        >
          <HiPhoto className="w-5 h-5" />
        </button>

        {/* Text Input Container */}
        <div className="relative flex-1">
          <input
            type="text"
            id="messageInput"
            placeholder={
              isUploading
                ? "Uploading attachments, please wait..."
                : activeAttachments.length > 0
                ? "Add a caption or send files..."
                : "Type your message..."
            }
            value={message}
            spellCheck={true}
            autoComplete="off"
            className="w-full pl-4 pr-12 py-2.5 bg-gray-50 dark:bg-[#161822] rounded-2xl border border-gray-200 dark:border-white/10 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition disabled:opacity-60"
            onChange={handleMessageChange}
            ref={messageInputRef}
            disabled={isUploading}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!hasContent || isUploading}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              hasContent && !isUploading
                ? "btn-grad text-white shadow-md cursor-pointer hover:scale-105 active:scale-95"
                : "bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed opacity-50"
            }`}
            title="Send"
          >
            {isUploading ? (
              <HiArrowPath className="w-4 h-4 animate-spin text-white" />
            ) : (
              <HiPaperAirplane className="w-4 h-4 transform rotate-45 -ml-0.5" />
            )}
          </button>
        </div>

        {/* Emoji Picker Button */}
        <div className="relative flex-shrink-0" ref={emojiRef}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`flex items-center justify-center w-10 h-10 rounded-2xl transition border ${
              showEmojiPicker
                ? "bg-cyan-500/10 text-cyan-500 border-cyan-500/30"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 border-transparent dark:border-white/5"
            }`}
            aria-label="Toggle emoji picker"
            title="Add emoji"
            disabled={isUploading}
          >
            <HiFaceSmile className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full right-0 mb-3 z-50 shadow-2xl rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  height={360}
                  width={300}
                  theme="auto"
                  searchPlaceholder="Search emoji..."
                  previewConfig={{ showPreview: false }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
};

export default MessageInputBox;
