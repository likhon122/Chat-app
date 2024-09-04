import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notificationDrawer: false,
  members: [],
  makeGroupDrawer: false,
  groupInfoDrawer: false,
  groupId: "",
  theme: "dark"
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
      console.log(state.theme);
      state.theme = state.theme === "light" ? "dark" : "light";
    }
  }
});

export const {
  setNotificationDrawer,
  setMembers,
  setMakeGroupDrawer,
  setGroupInfoDrawer,
  setGroupId,
  setTheme
} = otherSlice.actions;

export default otherSlice.reducer;
