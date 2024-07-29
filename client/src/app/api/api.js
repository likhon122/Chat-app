import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { serverUrl } from "../../..";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: `${serverUrl}/api/v1/` }),
  tagTypes: ["Chat"],
  endpoints: (builder) => ({
    getChats: builder.query({
      query: () => ({
        url: "chat/my-chats",
        credentials: "include"
      }),
      providesTags: ["Chat"]
    })
  })
});

export default api;

export const { useGetChatsQuery } = api;
