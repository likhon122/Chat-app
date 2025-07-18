import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, AuthState } from "../../types";

const initialState: AuthState = {
  user: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = null;
      state.user = action.payload;
    },
    removeUser: (state) => {
      state.user = null;
    }
  }
});

export const { setUser, removeUser } = authSlice.actions;
export default authSlice.reducer;
