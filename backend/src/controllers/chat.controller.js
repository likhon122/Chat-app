/* eslint-disable no-await-in-loop */
import { v4 as uuid } from "uuid";
import { userSocketIds } from "../app.js";
import {
  ALERT,
  NEW_ATTACHMENT,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS
} from "../constants/event.js";
import { checkIsChatAdmin, deleteChatWithId } from "../helper/Chat.js";
import {
  deleteFilesFromCloudinary,
  uploadFilesFromCloudinary
} from "../helper/cloudinary.js";
import { errorResponse, successResponse } from "../helper/responseHandler.js";
import { sendNotificationToUser } from "../helper/sendPushNotification.js";
import { emitEvent } from "../helper/socketIo.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const createGroupChat = async (req, res, next) => {
  try {
    const { chatName, members } = req.body;
    const { userId } = req;

    if (!members || members.length < 2) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Group chat will able to make at least 3 members!",
        nextURl: {}
      });
    }

    const allMembers = [...members, userId];

    await Chat.create({
      chatName,
      creator: userId,
      groupChat: true,
      members: allMembers
    });

    emitEvent(req, ALERT, allMembers, `Welcome to ${chatName} group`);
    emitEvent(req, REFETCH_CHATS, members);

    return successResponse(res, {
      statusCode: 201,
      successMessage: "New chat created successfully!",
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

// Also some issue there!!
const getMyChats = async (req, res, next) => {
  try {
    const { userId } = req;
    const chats = await Chat.find({ members: userId }).populate(
      "members",
      "avatar name email"
    );

    if (!chats) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "No Chats found please make any conversion or group!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    const allChats = await Promise.all(
      chats.map(async ({ members, _id, groupChat, chatName }) => {
        // Finding last message of the chat

        const lastMessage = await Message.findOne({ chat: _id }).sort({
          createdAt: -1
        });

        const otherMember = () => {
          return members.find((member) => {
            return member._id.toString() !== userId.toString();
          });
        };

        const membersId = members.map((member) => member._id);

        return {
          chatName,
          _id,
          groupChat,
          avatar: groupChat
            ? members.slice(0, 3).map((member) => {
                return member.avatar?.url;
              })
            : otherMember()?.avatar?.url,
          members: membersId,
          lastMessage:
            lastMessage?.content || lastMessage?.attachment
              ? {
                  lastMessage: lastMessage?.content,
                  lastAttachment: lastMessage?.attachment
                }
              : "No messages yet"
        };
      })
    );

    return successResponse(res, {
      statusCode: 200,
      successMessage: "All chat loaded successfully!",
      payload: { allChats },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getMyGroups = async (req, res, next) => {
  try {
    const { userId } = req;
    const groups = await Chat.find({ creator: userId }).populate(
      "members",
      "avatar name"
    );

    if (!groups) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "No groups found that you are admin!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    const allGroups = groups.map(
      ({ _id, groupChat, creator, members, chatName }) => {
        return {
          _id,
          groupChat,
          creator,
          chatName,
          avatar: members.slice(0, 3).map((member) => {
            return member.avatar.url;
          }),
          members: members.reduce((previous, current) => {
            if (current._id.toString() !== creator.toString()) {
              previous.push(current._id);
            }
            return previous;
          }, [])
        };
      }
    );

    return successResponse(res, {
      statusCode: 200,
      successMessage: "All groups loaded successfully!",
      payload: { allGroups },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

// Bug is here
const addGroupMember = async (req, res, next) => {
  try {
    const { groupId, members } = req.body;

    if (!members || !Array.isArray(members) || members.length < 1) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Add to member any group to send member id is required! Members is always an array type! Please sent data on array type and add at least one member on the group!",
        nextURl: {
          createGroup: "/api/v1/chat/new",
          getMyGroup: "/api/v1/chat/my-group",
          myChat: "/api/v1/chat/my-chat"
        }
      });
    }

    const group = await Chat.findById(groupId);

    if (!group) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Group not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    const allNewMembersNamePromise = members.map((memberId) => {
      return User.findById(memberId, "name");
    });

    const allNewMembersName = await Promise.all(allNewMembersNamePromise);

    if (!allNewMembersName) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "User not found!",
        nextURl: {
          registerUser: "/api/v1/user/process-register",
          login: "/api/v1/auth/login"
        }
      });
    }

    members.map((memberId) => {
      if (!group.members.includes(memberId)) {
        return group.members.push(memberId);
      }
      return true;
    });

    if (group.members.length > 100) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Reach the group members! Please remove some member first!",
        nextURl: {}
      });
    }

    const uniqueNames = [
      ...new Set(
        allNewMembersName.map((user) => {
          return user.name;
        })
      )
    ];

    emitEvent(
      req,
      ALERT,
      group.members,
      `${uniqueNames.map((name) => name)}has been added to ${group.chatName}`
    );

    await group.save();

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Group member added successfully",
      payload: {
        addedPeople: `${uniqueNames.map((name) => name)}has been added to ${group.chatName}`
      },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

// Bug is here
const removeMember = async (req, res, next) => {
  try {
    const { members, groupId } = req.body;

    if (!members || !Array.isArray(members) || members.length < 1) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Removing a member from the group requires a member ID. Members should be an array with at least one ID!",
        nextURl: {}
      });
    }

    const chat = await Chat.findById(groupId);

    if (!chat) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Group not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (chat.members.length <= 3) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Insufficient members to remove from this group. Please add more members or delete this group!",
        nextURl: {
          addMember: "/api/v1/chat/add-group-member"
        }
      });
    }

    const allNewMembersNamePromise = members.map((memberId) => {
      return User.findById(memberId, "name");
    });

    const allNewMembersName = await Promise.all(allNewMembersNamePromise);

    if (allNewMembersName.some((user) => !user)) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "One or more users not found!",
        nextURl: {
          registerUser: "/api/v1/user/process-register",
          login: "/api/v1/auth/login"
        }
      });
    }

    const creatorName = await User.findById(chat.creator, "name");

    if (!creatorName) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Group creator not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.groupChat) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "This is not a group chat!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (members.includes(chat.creator.toString())) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "The admin cannot remove themselves from the group. They can leave or delete the group!",
        nextURl: {}
      });
    }

    const filteredMembers = chat.members.filter(
      (memberId) => !members.includes(memberId.toString())
    );

    chat.members = filteredMembers;

    await chat.save();

    const uniqueNames = [
      ...new Set(allNewMembersName.map((user) => user.name))
    ];

    emitEvent(
      req,
      ALERT,
      chat.members,
      `${uniqueNames.join(", ")} removed from the group ${creatorName.name}`
    );
    emitEvent(req, REFETCH_CHATS, chat.members);

    successResponse(res, {
      statusCode: 200,
      successMessage: `${uniqueNames.join(", ")} removed from the group ${creatorName.name}`,
      payload: {},
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

// Bug is here
const leaveGroup = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const leavedUserId = req.userId;

    const chat = await Chat.findById(groupId);
    const leftUserName = await User.findById(leavedUserId, "name");

    if (!chat) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.groupChat) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Group This is not a group chat!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.members.includes(leavedUserId)) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "You are not member with this group! Please join first!",
        nextURl: {
          addMember: "/api/v1/chat/add-group-member"
        }
      });
    }

    const remainingMembers = chat.members.filter(
      (memberId) => memberId.toString() !== leavedUserId.toString()
    );

    if (chat.creator.toString() === leavedUserId) {
      const randomCreatorIndex = Math.floor(
        Math.random() * remainingMembers.length
      );

      const randomCreator = chat.members[randomCreatorIndex];

      chat.creator = randomCreator;
      await chat.save();
      emitEvent(
        req,
        ALERT,
        chat.members,
        `${leftUserName.name} is left the group!`
      );
      emitEvent(req, REFETCH_CHATS, chat.members);
      return successResponse(res, {
        statusCode: 200,
        successMessage: "Leave and new group admin make successfully!",
        payload: {},
        nextURl: {}
      });
    }

    const filteredMembers = remainingMembers;

    chat.members = filteredMembers;

    try {
      if (chat.members.length < 3) {
        await deleteChatWithId(res, groupId);
        return successResponse(res, {
          statusCode: 200,
          successMessage: "Leave and delete group successfully!",
          payload: {},
          nextURl: {}
        });
      }
    } catch (error) {
      next(error);
    }

    await chat.save();

    emitEvent(
      req,
      ALERT,
      chat.members,
      `${leftUserName.name} is left the group!`
    );
    emitEvent(req, REFETCH_CHATS, chat.members);

    return successResponse(res, {
      statusCode: 200,
      successMessage: `${leftUserName.name} is left the group!`,
      payload: { chat },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const sendAttachments = async (req, res, next) => {
  try {
    const { chatId, message: formMessage } = req.body;

    const { userId } = req;

    const { files } = req;

    if (files.length < 0) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please provide any attachments at least 1 and upto 5!!",
        nextURl: {}
      });
    }
    if (files.length > 5) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please provide any attachments at least 1 and upto 5!!",
        nextURl: {}
      });
    }

    const [chat, userInfo] = await Promise.all([
      Chat.findById(chatId),
      User.findById(userId, "name avatar")
    ]);

    if (!chat) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    const attachments = await uploadFilesFromCloudinary(files);

    const messageForRealTime = {
      content: formMessage ? formMessage : "",
      attachment: attachments,
      chatId,
      realTimeId: uuid(),
      sender: {
        _id: userId,
        name: userInfo.name,
        avatar: userInfo.avatar
      },
      createdAt: new Date().toISOString()
    };

    const dbMessage = {
      sender: userId,
      content: formMessage ? formMessage : "",
      attachment: attachments,
      chat: chatId,
      realTimeId: messageForRealTime.realTimeId
    };

    const message = await Message.create(dbMessage);

    if (!message) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Send attachments failed! Please provide correct information!",
        nextURl: {}
      });
    }

    emitEvent(req, NEW_MESSAGE, chat.members, {
      message: messageForRealTime,
      chatId
    });

    const AllMembers = chat.members;

    for (const member of AllMembers) {
      if (!userSocketIds.has(member.toString())) {
        await sendNotificationToUser({
          content: "Send an attachment!!",
          sender: userId,
          chat: chatId,
          member
        });
      }
    }

    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Send attachments successfully!",
      payload: { message },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getChatDetails = async (req, res, next) => {
  try {
    if (req.query.populate === "true") {
      const chat = await Chat.findById(req.params.id)
        .populate("members", "name avatar")
        .lean();
      if (!chat) {
        errorResponse(res, {
          statusCode: 404,
          errorMessage: "Chat not found!",
          nextURl: {
            createGroup: "/api/v1/chat/new"
          }
        });
      }
      chat.members = chat.members.map(({ avatar, _id, name }) => ({
        _id,
        name,
        avatar: avatar?.url
      }));
      return successResponse(res, {
        statusCode: 200,
        successMessage: "Chat details with populate returned successfully!",
        payload: { chat },
        nextURl: {}
      });
    } else {
      const chat = await Chat.findById(req.params.id);

      if (!chat) {
        errorResponse(res, {
          statusCode: 404,
          errorMessage: "Chat not found!",
          nextURl: {
            createGroup: "/api/v1/chat/new"
          }
        });
      }

      return successResponse(res, {
        statusCode: 200,
        successMessage: "Chat details without populate returned successfully!",
        payload: { chat },
        nextURl: {}
      });
    }
  } catch (error) {
    next(error);
  }
};

const renameGroupChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { userId } = req;
    const { name } = req.body;

    if (!name) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Name is required!",
        nextURl: {}
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.groupChat) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Group This is not a group chat!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.members.includes(userId)) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "You are not a member with this group! Please join first and rename this group!",
        nextURl: {
          addMember: "/api/v1/chat/add-group-member"
        }
      });
    }

    if (!chat.creator.toString() === userId.toString()) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage: "Admin can rename this group! You are not an admin!",
        nextURl: {}
      });
    }

    if (name === chat.chatName) {
      return errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Chat old name or new name is same! Please make this different!",
        nextURl: {}
      });
    }

    chat.chatName = name;

    await chat.save();

    emitEvent(req, REFETCH_CHATS, chat.members, name);

    return successResponse(res, {
      statusCode: 200,
      successMessage: "Group name changed successfully!",
      payload: { chat },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const deleteChat = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { userId } = req;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.groupChat) {
      const user = await User.findOne({ _id: userId }).select("-password");

      const messageWithAttachments = await Message.find({
        chat: chatId,
        attachment: { $exists: true, $ne: [] }
      });

      const publicIds = [];

      messageWithAttachments.forEach(({ attachment }) => {
        attachment.forEach(({ public_id }) => publicIds.push(public_id));
      });

      if (publicIds.length > 0) {
        await deleteFilesFromCloudinary(publicIds);
      }

      const deletedFriend = chat.members.filter(
        (member) => member._id.toString() !== userId.toString()
      );

      const deletedFriendDetails = await User.findOne({
        _id: deletedFriend[0]
      }).select("-password");

      if (!deletedFriendDetails) {
        return errorResponse(res, {
          statusCode: 404,
          errorMessage:
            "Friend not found!! Please provide correct information!!",
          nextURl: {}
        });
      }

      const newFriends = user.friends.filter(
        (friend) => friend.toString() !== deletedFriend[0].toString()
      );

      const newFriendForDeletedFriend = deletedFriendDetails.friends.filter(
        (friend) => friend.toString() !== userId.toString()
      );

      user.friends = newFriends;
      deletedFriendDetails.friends = newFriendForDeletedFriend;

      await Promise.all([
        user.save(),
        deletedFriendDetails.save(),
        Chat.findByIdAndDelete(chatId)
      ]);

      emitEvent(req, REFETCH_CHATS, chat.members);

      return successResponse(res, {
        statusCode: 200,
        successMessage: "Chat delete and unfriend successfully!",
        payload: {},
        nextURl: {}
      });
    }

    const isAdmin = checkIsChatAdmin(res, userId, chat);

    if (!isAdmin) {
      return errorResponse(res, {
        statusCode: 403,
        errorMessage:
          "Your are not able to delete this group chat! Because you are not admin!",
        nextURl: {
          createChat: "/api/v1/chat/new",
          allGroupsThatYouAdmin: "api/v1/chat/my-groups"
        }
      });
    }

    const messageWithAttachments = await Message.find({
      chat: chatId,
      attachment: { $exists: true, $ne: [] }
    });

    const publicIds = [];

    messageWithAttachments.forEach(({ attachment }) => {
      attachment.forEach(({ public_id }) => publicIds.push(public_id));
    });

    if (publicIds.length > 0) {
      await deleteFilesFromCloudinary(publicIds);
    }

    await Chat.findByIdAndDelete(chatId);

    emitEvent(req, REFETCH_CHATS, chat.members);

    successResponse(res, {
      statusCode: 200,
      successMessage: "Group chat deleted successfully!",
      payload: {},
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const fetchOriginalMessagesByUUID = async (uuids) => {
  return Message.find({ realTimeId: { $in: uuids } })
    .populate("sender", "name avatar")
    .lean();
};

const getMessages = async (req, res, next) => {
  try {
    const chatId = req.params.id;
    const { page = 1 } = req.query;

    const limit = 20;
    const skip = (page - 1) * limit;

    const [messages, totalMessagesCount] = await Promise.all([
      Message.find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name avatar")
        .lean(),
      Message.countDocuments({ chat: chatId })
    ]);

    if (!messages.length) {
      return errorResponse(res, {
        statusCode: 404,
        errorMessage: "Messages not found!",
        nextURl: {}
      });
    }

    const replyToUUIDs = messages
      .filter((message) => message.replyTo)
      .map((message) => message.replyTo);

    // Fetch original messages based on UUIDs (if you have a way to do that)
    // Here we assume you have some function to get messages by UUIDs
    const originalMessages = await fetchOriginalMessagesByUUID(replyToUUIDs);

    // Create a lookup for original messages
    const originalMessagesMap = originalMessages.reduce(
      (acc, originalMessage) => {
        acc[originalMessage.realTimeId] = {
          _id: originalMessage._id,
          content: originalMessage.content,
          attachment: originalMessage.attachment,
          sender: {
            _id: originalMessage.sender._id,
            name: originalMessage.sender.name,
            avatar: originalMessage.sender.avatar.url
          },
          createdAt: originalMessage.createdAt
        };
        return acc;
      },
      {}
    );

    // Map original messages to the messages array, including replyTo details
    messages.forEach((message) => {
      if (message.replyTo && originalMessagesMap[message.replyTo]) {
        message.replyTo = originalMessagesMap[message.replyTo];
      } else {
        // If replyTo is not found, you can either set it to null or keep it as is
        message.replyTo = null; // or keep it unchanged
      }
    });

    const totalPages = Math.ceil(totalMessagesCount / limit);

    successResponse(res, {
      statusCode: 200,
      successMessage: "Messages returned successfully!",
      payload: {
        messages,
        pagination: {
          totalMessages: totalMessagesCount,
          page: Number(page),
          limit,
          totalPages
        }
      },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

export {
  createGroupChat,
  getMyChats,
  getMyGroups,
  addGroupMember,
  removeMember,
  leaveGroup,
  deleteChat,
  sendAttachments,
  getChatDetails,
  renameGroupChat,
  getMessages
};
