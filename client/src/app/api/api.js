import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { serverUrl } from "../../..";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: `${serverUrl}/api/v1/` }),
  tagTypes: ["Chat", "User", "Auth", "Message", "FriendRequestNotification"],
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
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: "Chat", id })), "Chat"]
          : ["Chat"]
    }),

    searchUser: builder.query({
      query: (name) => ({
        url: `user/search-user?name=${name}`,
        credentials: "include"
      }),
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: "User", id })), "User"]
          : ["User"]
    }),

    friendRequestNotification: builder.query({
      query: () => ({
        url: "user/friend-requests",
        credentials: "include"
      }),
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [...result.map(({ id }) => ({ type: "User", id })), "User"]
          : ["User"]
    }),

    getMessages: builder.query({
      query: ({ chatId, page }) => ({
        url: `chat/message/${chatId}?page=${page}`,
        credentials: "include"
      }),
      providesTags: (result, error, { chatId }) => [
        { type: "Message", id: chatId }
      ],
      keepUnusedDataFor: 0
    }),

    getUser: builder.query({
      query: (id) => ({
        url: `user/single-user/${id}`,
        credentials: "include"
      }),
      providesTags: (result, error, id) => [{ type: "User", id }]
    }),

    getFriends: builder.query({
      query: (id) => ({
        url: `user/get-friends/${id}`,
        credentials: "include"
      }),
      providesTags: (result, error, id) => [{ type: "User", id }]
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
      providesTags: (result, error, id) => [{ type: "Chat", id }]
    }),

    getNotifications: builder.query({
      query: (userId) => ({
        url: `notification/get-chat-notification?userId=${userId}`,
        credentials: "include"
      }),
      providesTags: ["Chat"]
    }),

    getPendingFriendRequest: builder.query({
      query: () => ({
        url: "/user/pending-requests",
        credentials: "include"
      }),
      providesTags: ["User"]
    }),

    getFriendRequestNotificationCount: builder.query({
      query: () => ({
        url: "notification/get-friend-request-notification-count",
        credentials: "include"
      }),
      providesTags: ["FriendRequestNotification"]
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
      invalidatesTags: ["User"]
    }),

    renameGroupChat: builder.mutation({
      query: (data) => ({
        url: `chat/${data.chatId}`,
        method: "PUT",
        credentials: "include",
        body: { name: data.name }
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Chat", id: chatId }
      ]
    }),

    readNotification: builder.mutation({
      query: (data) => ({
        url: "notification/read-notification",
        method: "PUT",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["Chat"]
    }),

    readFriendRequestNotification: builder.mutation({
      query: (data) => ({
        url: "notification/read-friend-request-notification",
        method: "PUT",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["FriendRequestNotification", "User"]
    }),

    addGroupMembers: builder.mutation({
      query: (data) => ({
        url: `chat/add-group-member`,
        method: "PUT",
        credentials: "include",
        body: data
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Chat", id: chatId }
      ]
    }),

    removeGroupMembers: builder.mutation({
      query: (data) => ({
        url: `chat/remove-member`,
        method: "PUT",
        credentials: "include",
        body: data
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Chat", id: chatId }
      ]
    }),

    sendAttachments: builder.mutation({
      query: (data) => ({
        url: "chat/send-attachments",
        method: "POST",
        credentials: "include",
        body: data
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Message", id: chatId }
      ],
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

    makeNotification: builder.mutation({
      query: (data) => ({
        url: "notification/make-chat-notification",
        method: "POST",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["Chat"]
    }),

    makeFriendRequestNotification: builder.mutation({
      query: (data) => ({
        url: "notification/make-friend-request-notification",
        method: "POST",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["FriendRequestNotification", "User"]
    }),

    rejectFriendRequest: builder.mutation({
      query: (data) => ({
        url: "user/delete-request",
        method: "DELETE",
        credentials: "include",
        body: data
      }),
      invalidatesTags: ["User"]
    }),

    deleteGroup: builder.mutation({
      query: (chatId) => ({
        url: `chat/${chatId}`,
        method: "DELETE",
        credentials: "include"
      }),
      invalidatesTags: (result, error, chatId) => [{ type: "Chat", id: chatId }]
    }),

    leaveGroup: builder.mutation({
      query: (chatId) => ({
        url: `chat/leave-group/${chatId}`,
        method: "DELETE",
        credentials: "include"
      }),
      invalidatesTags: (result, error, chatId) => [{ type: "Chat", id: chatId }]
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
  useGetPendingFriendRequestQuery,
  useMakeNotificationMutation,
  useGetNotificationsQuery,
  useReadNotificationMutation,
  useMakeFriendRequestNotificationMutation,
  useGetFriendRequestNotificationCountQuery,
  useReadFriendRequestNotificationMutation
} = api;
