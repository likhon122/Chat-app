import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { serverUrl } from "../../..";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: `${serverUrl}/api/v1/` }),
  tagTypes: ["Chat", "User", "Auth", "Message"],
  endpoints: (builder) => ({
    verifyUser: builder.query({
      query: () => ({
        url: "auth",
        credentials: "include"
      }),
      providesTags: ["Auth"]
    }),

    getChats: builder.query({
      query: () => ({
        url: "chat/my-chats",
        credentials: "include"
      }),
      providesTags: ["Chat"]
    }),

    searchUser: builder.query({
      query: (name) => ({
        url: `user/search-user?name=${name}`,
        credentials: "include"
      }),
      providesTags: ["User"]
    }),

    friendRequestNotification: builder.query({
      query: () => ({
        url: "user/friend-requests",
        credentials: "include"
      }),
      providesTags: ["User"]
    }),

    getMessages: builder.query({
      query: ({ chatId, page }) => ({
        url: `chat/message/${chatId}?page=${page}`,
        credentials: "include"
      }),
      keepUnusedDataFor: 0
    }),

    sendFriendRequest: builder.mutation({
      query: (data) => ({
        url: "user/send-request",
        method: "POST",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["User"]
    }),

    loginUser: builder.mutation({
      query: (data) => ({
        url: "auth/login",
        method: "POST",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["Auth"]
    }),

    acceptFriendRequest: builder.mutation({
      query: (data) => ({
        url: "user/accept-request",
        method: "PUT",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["Auth", "User", "Chat"]
    }),
    sendAttachments: builder.mutation({
      query: (data) => ({
        url: "chat/send-attachments",
        method: "POST",
        credentials: "include",
        body: data
      }),
      keepUnusedDataFor: 0
    }),

    rejectFriendRequest: builder.mutation({
      query: (data) => ({
        url: "user/delete-request",
        method: "DELETE",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["User"]
    })
  })
});

export default api;

export const {
  useGetChatsQuery,
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
  useFriendRequestNotificationQuery,
  useAcceptFriendRequestMutation,
  useLoginUserMutation,
  useVerifyUserQuery,
  useRejectFriendRequestMutation,
  useGetMessagesQuery,
  useSendAttachmentsMutation
} = api;
