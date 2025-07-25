import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notificationDrawer: false,
  members: [],
  makeGroupDrawer: false,
  groupInfoDrawer: false,
  groupId: "",
  theme: "dark",
  editGroup: false,
  chatId: "",
  isRinging: false,
  callInfo: null,
  isCallStarted: false,
  incomingOffer: null,
  callerDetails: null,
  selectedChat: null,
  search: true
};

const otherSlice = createSlice({
  name: "other",
  initialState,
  reducers: {
    setNotificationDrawer: (state, action) => {
      state.notificationDrawer = action.payload;
    },
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    setMakeGroupDrawer: (state, action) => {
      state.makeGroupDrawer = action.payload;
    },
    setGroupInfoDrawer: (state, action) => {
      state.groupInfoDrawer = action.payload;
    },
    setGroupId: (state, action) => {
      state.groupId = action.payload;
    },
    setTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setEditGroup: (state, action) => {
      state.editGroup = action.payload;
    },
    setChatId: (state, action) => {
      state.chatId = action.payload;
    },
    setRinging: (state, action) => {
      state.isRinging = action.payload?.isRinging;
      state.callInfo = action.payload?.callInfo || null;
    },
    endRinging: (state) => {
      state.isRinging = false;
      state.callInfo = null;
    },
    callStarted: (state, action) => {
      state.isCallStarted = action.payload;
    },
    setIncomingOffer: (state, action) => {
      state.incomingOffer = action.payload;
    },
    setCallerDetails: (state, action) => {
      state.callerDetails = action.payload;
    },
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },
    setShowSearch: (state, action) => {
      state.search = action.payload;
    }
  }
});

export const {
  setNotificationDrawer,
  setMembers,
  setMakeGroupDrawer,
  setGroupInfoDrawer,
  setGroupId,
  setTheme,
  setEditGroup,
  setChatId,
  setRinging,
  endRinging,
  callStarted,
  setIncomingOffer,
  setCallerDetails,
  setSelectedChat,
  setShowSearch
} = otherSlice.actions;

export default otherSlice.reducer;
