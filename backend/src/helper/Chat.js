import Chat from "../models/chat.model.js";
import { errorResponse } from "./responseHandler.js";

const deleteChatWithId = async (res, chatId) => {
  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      errorResponse(res, {
        statusCode: 404,
        errorMessage: "Chat not found!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
      return false;
    }

    if (!chat.groupChat) {
      errorResponse(res, {
        statusCode: 400,
        errorMessage: "Group This is not a group chat!",
        nextURl: {
          createGroup: "/api/v1/chat/new"
        }
      });
      return false;
    }

    await Chat.findByIdAndDelete(chatId);

    return true;
  } catch (error) {
    throw error;
  }
};

const checkIsChatAdmin = (res, userId, chatDetails) => {
  try {
    if (chatDetails.creator.toString() === userId.toString()) {
      return true;
    }
    errorResponse(res, {
      statusCode: 403,
      errorMessage:
        "Your are not chat admin! Some operation you don't able to access! Please make your own group and get all operations access!",
      nextURl: {
        createChat: "/api/v1/chat/new",
        allGroupsThatYouAdmin: "api/v1/chat/my-groups"
      }
    });
    return false;
  } catch (error) {
    throw error;
  }
};

export { deleteChatWithId, checkIsChatAdmin };
