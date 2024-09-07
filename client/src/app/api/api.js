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
      providesTags: ["User"] // <-- Add this line to provide "User" tags
    }),

    getMessages: builder.query({
      query: ({ chatId, page }) => ({
        url: `chat/message/${chatId}?page=${page}`,
        credentials: "include"
      }),
      keepUnusedDataFor: 0
    }),

    getUser: builder.query({
      query: (id) => ({
        url: `user/single-user/${id}`,
        credentials: "include"
      }),
      providesTags: ["User"]
    }),

    getFriends: builder.query({
      query: (id) => ({
        url: `user/get-friends/${id}`,
        credentials: "include"
      }),
      providesTags: ["User"]
    }),

    getMyGroups: builder.query({
      query: () => ({
        url: `chat/my-groups`,
        credentials: "include"
      }),
      providesTags: ["Chat"]
    }),

    getGroupDetails: builder.query({
      query: (id, populate = true) => ({
        url: `/chat/${id}?populate=${populate}`,
        credentials: "include"
      }),
      providesTags: ["Chat"]
    }),

    getPendingFriendRequest: builder.query({
      query: () => ({
        url: "/user/pending-requests",
        credentials: "include"
      }),
      keepUnusedDataFor: ["User"]
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
      invalidatesTags: ["User"] // <-- Invalidate "User" tag so that it refetches
    }),

    renameGroupChat: builder.mutation({
      query: (data) => ({
        url: `chat/${data.chatId}`,
        method: "PUT",
        credentials: "include",
        body: { name: data.name }
      }),
      invalidatesTags: ["Chat"]
    }),

    addGroupMembers: builder.mutation({
      query: (data) => ({
        url: `chat/add-group-member`,
        method: "PUT",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["Chat"]
    }),

    removeGroupMembers: builder.mutation({
      query: (data) => ({
        url: `chat/remove-member`,
        method: "PUT",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["Chat"]
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

    makeGroupChat: builder.mutation({
      query: (data) => ({
        url: "chat/create-group",
        method: "POST",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["Chat"]
    }),

    rejectFriendRequest: builder.mutation({
      query: (data) => ({
        url: "user/delete-request",
        method: "DELETE",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["User"] // <-- Invalidate "User" tag so that it refetches
    }),

    deleteGroup: builder.mutation({
      query: (chatId) => ({
        url: `chat/${chatId}`,
        method: "DELETE",
        credentials: "include"
      }),
      invalidatesTags: ["Chat"]
    }),
    leaveGroup: builder.mutation({
      query: (chatId) => ({
        url: `chat/leave-group/${chatId}`,
        method: "DELETE",
        credentials: "include"
      }),
      invalidatesTags: ["Chat"]
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
  useSendAttachmentsMutation,
  useGetUserQuery,
  useGetFriendsQuery,
  useMakeGroupChatMutation,
  useGetMyGroupsQuery,
  useGetGroupDetailsQuery,
  useRenameGroupChatMutation,
  useAddGroupMembersMutation,
  useRemoveGroupMembersMutation,
  useDeleteGroupMutation,
  useLeaveGroupMutation,
  useGetPendingFriendRequestQuery
} = api;
