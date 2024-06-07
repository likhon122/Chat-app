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

    await Chat.findByIdAndDelete(chatId);

    return true;
  } catch (error) {
    throw error;
  }
};

export { deleteChatWithId };
