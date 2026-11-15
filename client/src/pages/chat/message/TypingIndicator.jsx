import { motion, AnimatePresence } from "framer-motion";

const TypingIndicator = ({ userTyping }) => {
  return (
    <AnimatePresence>
      {userTyping && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute left-6 bottom-4 z-20 pointer-events-none"
        >
          <div className="flex items-center gap-2 bg-white/90 dark:bg-[#161822]/90 backdrop-blur-md py-1.5 px-3 rounded-full shadow-lg border border-gray-200/80 dark:border-white/10">
            <div className="flex space-x-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-500"
                  animate={{
                    scale: [0.75, 1.25, 0.75],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: dot * 0.18,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
              typing...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TypingIndicator;
