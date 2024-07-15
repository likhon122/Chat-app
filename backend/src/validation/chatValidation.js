import { body, check, param } from "express-validator";

const createGroupChatValidation = [
  body("chatName")
    .trim()
    .notEmpty()
    .withMessage(
      "Creating a new group chat must be an chat name. Please provide a group name!"
    ),

  body("members")
    .trim()
    .notEmpty()
    .withMessage(
      "Creating a new group must be at least 3 to 100 active members!! Please add 3 to 100 members!!"
    )
    .isArray({ min: 2, max: 99 })
    .withMessage(
      "Members is must be an array. Please sent members an array type! And remember it's length minimum 2 and maximum 99 !!"
    )
];

const addGroupMemberValidation = [
  body("groupId")
    .trim()
    .notEmpty()
    .withMessage(
      "Adding a new person to this group make sure you provide groupId. Adding a new person must be required groupId!"
    ),

  body("members")
    .trim()
    .notEmpty()
    .withMessage(
      "Members is must be an array. Please sent members an array type!!"
    )
    .isArray({ min: 1 })
    .withMessage(
      "Members is must be an array. Please sent members an array type! And make sure it's length minimum 1!!"
    )
];

const removeMemberValidation = [
  body("groupId")
    .trim()
    .notEmpty()
    .withMessage(
      "Removing a person to this group make sure you provide groupId. Removing a new person must be required groupId!"
    ),
  body("userId")
    .trim()
    .notEmpty()
    .withMessage(
      "Removing a person to this group make sure you provide userId. Removing a new person must be required userId!"
    )
];

const leaveGroupValidation = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Leave any group make sure you provide a params value witch is your userId! Without provide this you don't leave any group!!"
    )
];

const sendAttachmentsValidation = [
  body("groupId")
    .trim()
    .notEmpty()
    .withMessage(
      "Sending any attachments to this group make sure you provide groupId. Sending any attachments must be required userId!"
    ),
  check("attachments")
    .notEmpty()
    .withMessage(
      "Attachments is must be an array format! Its length min 1 to max 5! Please Provide attachments!"
    )
    .isArray({ min: 1, max: 5 })
    .withMessage(
      "Attachments is must be an array format! Its length min 1 to max 5! Please Provide attachments!"
    )
];

const getMessagesValidation = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Get any messages make sure you provide a params value witch is your chatId! Without provide this chatId you don't access any messages!!"
    )
];

const renameGroupChatValidation = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Rename this group make sure you provide a params value witch is your chatId! Without provide this chatId you don't access to rename this group!!"
    ),
  body("name")
    .trim()
    .notEmpty()
    .withMessage(
      "Rename this group make sure you provide a new group name at this group, witch is name property! Without provide this name you don't access to rename this group!!"
    )
];

const deleteChatValidation = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Delete this chat make sure you provide a params value witch is your chatId! Without provide this chatId you don't delete this chat!!"
    )
];

export {
  createGroupChatValidation,
  addGroupMemberValidation,
  removeMemberValidation,
  leaveGroupValidation,
  sendAttachmentsValidation,
  getMessagesValidation,
  renameGroupChatValidation,
  deleteChatValidation
};
