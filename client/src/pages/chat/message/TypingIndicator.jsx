import { motion, AnimatePresence } from "framer-motion";

const TypingIndicator = ({ userTyping }) => {
  return (
    <AnimatePresence>
      {userTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-[38%] left-[38%]  bottom-2 flex items-center px-4 py-2 mb-2"
        >
          <div className="flex items-center bg-white dark:bg-gray-800 py-2 px-4 rounded-full shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex space-x-1 mr-2">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700"
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    delay: dot * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-gray-500 dark:text-gray-400 font-medium"
            >
             Typing...
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TypingIndicator;
