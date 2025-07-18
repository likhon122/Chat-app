import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/authSlice";
import api from "../api/api";
import OtherReducer from "../features/otherSlice";
import ChatReducer from "../features/chatSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
    other: OtherReducer,
    chat: ChatReducer
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    api.middleware
  ]
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
