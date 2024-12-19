import multer from "multer";

const upload = multer({
  limits: 1000 * 60 * 5
});

const singleAvatar = upload.single("avatar");

const uploadSendAttachments = upload.array("attachments", 5);

export { singleAvatar, uploadSendAttachments };
