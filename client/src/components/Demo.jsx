import React from "react";
import { toast } from "../utils/alert";
import {
  HiCheckCircle,
  HiExclamationTriangle,
  HiXCircle,
  HiInformationCircle,
  HiArrowPath,
  HiBolt,
  HiSparkles
} from "react-icons/hi2";

function Demo() {
  const showSuccess = () => {
    toast.success("Profile updated successfully!", {
      description: "Your display settings and avatar are now live."
    });
  };

  const showError = () => {
    toast.error("Failed to connect to backend", {
      description: "Please check your network connection and try again."
    });
  };

  const showWarning = () => {
    toast.warning("Unsaved changes detected", {
      description: "Make sure to save before navigating away."
    });
  };

  const showInfo = () => {
    toast.info("New message received", {
      description: "Alex sent you an encrypted media attachment."
    });
  };

  const showLoadingAndResolve = () => {
    const id = toast.loading("Encrypting and uploading media...");
    setTimeout(() => {
      toast.success("File uploaded and encrypted!", {
        id,
        description: "Your file is ready to share."
      });
    }, 2000);
  };

  const showPromise = () => {
    const fakeAsyncAction = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.3 ? resolve({ name: "Release_v2.zip" }) : reject(new Error("Timeout"));
      }, 2000);
    });

    toast.promise(fakeAsyncAction, {
      loading: "Synchronizing cloud messages...",
      success: (data) => `Synced ${data.name} successfully!`,
      error: "Sync failed! Server busy."
    });
  };

  const showAction = () => {
    toast.action("Chat moved to archive", {
      actionLabel: "Undo",
      onAction: () => toast.success("Chat restored to inbox!"),
      description: "You have 5 seconds to undo this action."
    });
  };

  const showConfirm = () => {
    toast.confirm("Leave group conversation?", {
      description: "You will no longer receive new messages from this group.",
      confirmText: "Leave Group",
      cancelText: "Stay",
      onConfirm: () => toast.success("You left the group"),
      onCancel: () => toast.info("Action cancelled")
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0d12] text-gray-900 dark:text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-[#12131a] rounded-3xl p-8 border border-gray-200 dark:border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <HiSparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Modern Mobile-Friendly Alerts</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interactive testbed powered by Sonner • Swipe to dismiss on mobile
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            onClick={showSuccess}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium transition text-left"
          >
            <HiCheckCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold">Success Alert</div>
              <div className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
                Green badge with checkmark
              </div>
            </div>
          </button>

          <button
            onClick={showError}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium transition text-left"
          >
            <HiXCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold">Error Alert</div>
              <div className="text-xs text-rose-600/70 dark:text-rose-400/70">
                Red crimson notification
              </div>
            </div>
          </button>

          <button
            onClick={showWarning}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium transition text-left"
          >
            <HiExclamationTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold">Warning Alert</div>
              <div className="text-xs text-amber-600/70 dark:text-amber-400/70">
                Amber validation badge
              </div>
            </div>
          </button>

          <button
            onClick={showInfo}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium transition text-left"
          >
            <HiInformationCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold">Info Alert</div>
              <div className="text-xs text-sky-600/70 dark:text-sky-400/70">
                Blue informative notification
              </div>
            </div>
          </button>

          <button
            onClick={showLoadingAndResolve}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium transition text-left"
          >
            <HiArrowPath className="w-5 h-5 flex-shrink-0 animate-spin" />
            <div>
              <div className="text-sm font-semibold">Loading & Update</div>
              <div className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
                Smooth spinner → success
              </div>
            </div>
          </button>

          <button
            onClick={showPromise}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium transition text-left"
          >
            <HiBolt className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold">Promise Alert</div>
              <div className="text-xs text-purple-600/70 dark:text-purple-400/70">
                Automatic lifecycle management
              </div>
            </div>
          </button>

          <button
            onClick={showAction}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-300 dark:border-white/10 bg-gray-100/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 font-medium transition text-left"
          >
            <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              ⌘
            </div>
            <div>
              <div className="text-sm font-semibold">Action Alert</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Alert with "Undo" button
              </div>
            </div>
          </button>

          <button
            onClick={showConfirm}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium transition text-left"
          >
            <div className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
              ?
            </div>
            <div>
              <div className="text-sm font-semibold">Confirm Alert</div>
              <div className="text-xs text-amber-700/70 dark:text-amber-300/70">
                Interactive confirmation
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-center sm:text-left">
            Swipe up or right on mobile screens to dismiss instantly.
          </p>
          <a
            href="/"
            className="btn-grad text-xs py-2 px-5 rounded-lg font-semibold inline-flex items-center"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default Demo;
