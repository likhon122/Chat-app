import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notificationDrawer: false,
  members: []
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
    }
  }
});

export const { setNotificationDrawer, setMembers } = otherSlice.actions;

export default otherSlice.reducer;
