import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa6";
import { HiUsers, HiSparkles } from "react-icons/hi2";

import MyGroup from "./MyGroup";
import MyGroupInfo from "./MyGroupInfo";
import { setEditGroup, setGroupId } from "../../app/features/otherSlice";

const MyGroups = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const { groupId: reduxGroupId, editGroup } = useSelector(
    (state) => state.other
  );
  const activeGroupId = params.groupId || reduxGroupId;

  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  // Lock body scroll while in MyGroups dashboard for ultra-clean fixed viewport
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Sync URL params with Redux
  useEffect(() => {
    if (params.groupId && params.groupId !== reduxGroupId) {
      dispatch(setGroupId(params.groupId));
      dispatch(setEditGroup(true));
    }
  }, [params.groupId, reduxGroupId, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBackToList = () => {
    dispatch(setEditGroup(false));
    navigate("/my-groups");
  };

  return (
    <div className="h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] bg-[#08090d] text-gray-100 overflow-hidden flex flex-col relative select-none">
      {/* Cyber ambient background lighting orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/[0.06] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/[0.06] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 h-full min-h-0 relative z-10 flex overflow-hidden">
        {/* Desktop View: Split Rail & Content */}
        <div className="hidden md:flex h-full w-full">
          {/* Left Channel Rail */}
          <div className="w-80 lg:w-96 flex-shrink-0 h-full border-r border-white/10 bg-white/[0.02] dark:bg-[#12131a]/60 backdrop-blur-xl overflow-hidden flex flex-col">
            <MyGroup />
          </div>

          {/* Right Dashboard Content */}
          <div className="flex-1 h-full overflow-hidden bg-white/[0.01] dark:bg-[#0c0d12]/70 backdrop-blur-xl flex flex-col">
            {activeGroupId ? (
              <MyGroupInfo groupId={activeGroupId} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-3xl shadow-xl shadow-cyan-500/10 mb-5 relative group">
                  <div className="absolute -inset-2 rounded-3xl bg-cyan-500/20 animate-pulse pointer-events-none" />
                  <HiUsers className="w-10 h-10 text-cyan-400 relative z-10" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">
                  Select a Group to Manage
                </h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">
                  Select any group you administer from the channel rail to edit its
                  name, view and manage members, invite friends, or configure settings.
                </p>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-cyan-300 font-semibold">
                  <HiSparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Admin Hub • Real-Time Synchronization</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View: Dynamic Switcher */}
        <div className="md:hidden h-full w-full">
          {editGroup && activeGroupId ? (
            <div className="h-full w-full relative flex flex-col">
              {/* Floating Mobile Return Pill */}
              <button
                type="button"
                onClick={handleBackToList}
                className="absolute top-3 left-3 z-30 p-2.5 rounded-xl bg-[#12131a]/90 backdrop-blur-md border border-white/15 text-white shadow-lg active:scale-95 transition flex items-center justify-center cursor-pointer"
                title="Back to groups list"
              >
                <FaChevronLeft className="w-4 h-4 text-cyan-400" />
              </button>
              <MyGroupInfo groupId={activeGroupId} />
            </div>
          ) : (
            <MyGroup />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyGroups;
