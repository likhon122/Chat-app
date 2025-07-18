import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { OtherState, User, Chat, CallInfo } from "../../types";

const initialState: OtherState = {
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
    setNotificationDrawer: (state, action: PayloadAction<boolean>) => {
      state.notificationDrawer = action.payload;
    },
    setMembers: (state, action: PayloadAction<User[]>) => {
      state.members = action.payload;
    },
    setMakeGroupDrawer: (state, action: PayloadAction<boolean>) => {
      state.makeGroupDrawer = action.payload;
    },
    setGroupInfoDrawer: (state, action: PayloadAction<boolean>) => {
      state.groupInfoDrawer = action.payload;
    },
    setGroupId: (state, action: PayloadAction<string>) => {
      state.groupId = action.payload;
    },
    setTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setEditGroup: (state, action: PayloadAction<boolean>) => {
      state.editGroup = action.payload;
    },
    setChatId: (state, action: PayloadAction<string>) => {
      state.chatId = action.payload;
    },
    setRinging: (state, action: PayloadAction<{ isRinging: boolean; callInfo?: CallInfo }>) => {
      state.isRinging = action.payload?.isRinging;
      state.callInfo = action.payload?.callInfo || null;
    },
    endRinging: (state) => {
      state.isRinging = false;
      state.callInfo = null;
    },
    callStarted: (state, action: PayloadAction<boolean>) => {
      state.isCallStarted = action.payload;
    },
    setIncomingOffer: (state, action: PayloadAction<any>) => {
      state.incomingOffer = action.payload;
    },
    setCallerDetails: (state, action: PayloadAction<User | null>) => {
      state.callerDetails = action.payload;
    },
    setSelectedChat: (state, action: PayloadAction<Chat | null>) => {
      state.selectedChat = action.payload;
    },
    setShowSearch: (state, action: PayloadAction<boolean>) => {
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
