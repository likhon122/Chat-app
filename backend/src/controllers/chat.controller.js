import {
  ALERT,
  NEW_ATTACHMENT,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS
} from "../constants/event.js";
import { checkIsChatAdmin, deleteChatWithId } from "../helper/Chat.js";
import { errorResponse, successResponse } from "../helper/responseHandler.js";
import { emitEvent } from "../helper/socketIo.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const createGroupChat = async (req, res, next) => {
  try {
    const { chatName, members } = req.body;
    const { userId } = req;

    if (!members || members.length < 2) {
      errorResponse(res, {
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

    successResponse(res, {
      statusCode: 201,
      successMessage: "New chat created successfully!",
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const getMyChats = async (req, res, next) => {
  try {
    const { userId } = req;
    const chats = await Chat.find({ members: userId }).populate(
      "members",
      "avatar name email"
    );

    const allChats = chats.map(({ members, _id, groupChat, chatName }) => {
      const otherMember = () => {
        return members.find((member) => {
          return member._id.toString() !== userId.toString();
        });
      };

      if (!chats) {
        errorResponse(res, {
          statusCode: 400,
          errorMessage: "No Chats found please make any conversion or group!",
          nextURl: {
            createGroup: "/api/v1/chat/new"
          }
        });
      }

      return {
        chatName,
        _id,
        groupChat,
        avatar: groupChat
          ? members.slice(0, 3).map((member) => {
              return member.avatar.url;
            })
          : otherMember?.avatar.url,
        members: members.reduce((previous, current) => {
          if (current._id.toString() !== userId.toString()) {
            previous.push(current._id);
          }
          return previous;
        }, [])
      };
    });

    successResponse(res, {
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
      errorResponse(res, {
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
    successResponse(res, {
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
      errorResponse(res, {
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
      errorResponse(res, {
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
      errorResponse(res, {
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
      errorResponse(res, {
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

    successResponse(res, {
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

const removeMember = async (req, res, next) => {
  try {
    const { userId, groupId } = req.body;

    const [chat, removeMemberName] = await Promise.all([
      Chat.findById(groupId),
      User.findById(userId, "name")
    ]);

    const creatorName = await User.findById(chat.creator, "name");

    if (!creatorName) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Creator is not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.groupChat) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Group This is not a group chat!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!removeMemberName) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Member not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new",
          addMember: "/api/v1/chat/add-group-member"
        }
      });
    }

    if (chat.creator.toString() === userId) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Admin can leave this group or delete this group but Admin not remove itself for this group!",
        nextURl: {}
      });
    }

    if (!chat.members.includes(userId)) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Member not found with this group! Please add first!",
        nextURl: {
          createGroup: "/api/v1/chat/new",
          addMember: "/api/v1/chat/add-group-member"
        }
      });
    }

    const filteredMembers = chat.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );

    chat.members = filteredMembers;

    if (chat.members.length < 3) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Member is not sufficient to remove this group. Please add some member then remove the member! Because every group must have 3 members! Or delete this group!",
        nextURl: {
          addMember: "/api/v1/chat/add-group-member"
        }
      });
    }

    await chat.save();

    emitEvent(
      req,
      ALERT,
      chat.members,
      `${removeMemberName.name} removed from the group ${creatorName.name}`
    );
    emitEvent(req, REFETCH_CHATS, chat.members);

    successResponse(res, {
      statusCode: 200,
      successMessage: `${removeMemberName.name} removed from the group ${creatorName.name}`,
      payload: {},
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

const leaveGroup = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const leavedUserId = req.userId;

    const chat = await Chat.findById(groupId);
    const leftUserName = await User.findById(leavedUserId, "name");

    if (!chat) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.groupChat) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Group This is not a group chat!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.members.includes(leavedUserId)) {
      errorResponse(res, {
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
      successResponse(res, {
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
        successResponse(res, {
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
    successResponse(res, {
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
    const { chatId } = req.body;
    const { userId } = req;
    const [chat, userInfo] = await Promise.all([
      Chat.findById(chatId),
      User.findById(userId, "name avatar")
    ]);

    if (!chat) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    const reqAttachments = req.files;

    if (reqAttachments.length < 1) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Please provide attachments!",
        nextURl: {}
      });
    }

    const attachments = [];

    const dbMessage = {
      sender: userId,
      content: "",
      attachments,
      chat: chatId
    };
    const messageForRealTime = {
      ...dbMessage,
      sender: {
        _id: userId,
        name: userInfo.name,
        avatar: userInfo.avatar
      }
    };

    const message = await Message.create(dbMessage);

    if (!message) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Send attachments failed! Please provide correct information!",
        nextURl: {}
      });
    }

    emitEvent(req, NEW_ATTACHMENT, chat.members, {
      message: messageForRealTime,
      chatId
    });

    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    successResponse(res, {
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
        avatar: avatar.url
      }));
      successResponse(res, {
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
      successResponse(res, {
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
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.groupChat) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Group This is not a group chat!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.members.includes(userId)) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage:
          "You are not a member with this group! Please join first and rename this group!",
        nextURl: {
          addMember: "/api/v1/chat/add-group-member"
        }
      });
    }

    if (!chat.creator.toString() === userId.toString()) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Admin can rename this group! You are not an admin!",
        nextURl: {}
      });
    }

    if (name === chat.chatName) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage:
          "Chat old name or new name is same! Please make this different!",
        nextURl: {}
      });
    }

    chat.chatName = name;

    await chat.save();

    emitEvent(req, REFETCH_CHATS, chat.members, name);

    successResponse(res, {
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
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    if (!chat.groupChat) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Group This is not a group chat!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
    }

    const isAdmin = checkIsChatAdmin(res, userId, chat);
    if (!isAdmin) {
      errorResponse(res, {
        statusCode: 403,
        errorMessage:
          "Your are not able to delete this group chat! Because you are not admin!",
        nextURl: {
          createChat: "/api/v1/chat/new",
          allGroupsThatYouAdmin: "api/v1/chat/my-groups"
        }
      });
    }

    // await Chat.findByIdAndDelete(chatId);

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
  renameGroupChat
};
