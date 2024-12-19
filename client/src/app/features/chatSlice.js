import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  requestNotification: 0,
  messageNotification: [
    {
      chatId: "",
      count: 0
    }
  ]
};

const chatSlice = createSlice({
  name: "other",
  initialState,
  reducers: {
    setRequestNotificationCount: (state) => {
      state.requestNotification += 1;
    },
    resetRequestNotificationCount: (state) => {
      state.requestNotification = 0;
    },
    setMessageNotification: (state, action) => {
      const index = state.messageNotification.findIndex((item) => {
        return item.chatId === action.payload.chatId;
      });

      if (index !== -1) {
        state.messageNotification[index].count += 1;
      } else {
        state.messageNotification.push({
          chatId: action.payload.chatId,
          count: 1
        });
      }
    },
    resetMessageNotification: (state, action) => {
      state.messageNotification = state.messageNotification.filter(
        (notification) => notification.chatId !== action.payload
      );
    }
  }
});

export const {
  setRequestNotificationCount,
  resetRequestNotificationCount,
  setMessageNotification,
  resetMessageNotification
} = chatSlice.actions;

export default chatSlice.reducer;
