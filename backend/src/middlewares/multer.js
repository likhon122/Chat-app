import multer from "multer";

const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 25 // 25MB max per file
  }
});

const singleAvatar = upload.single("avatar");

const uploadSendAttachments = upload.array("attachments", 5);

export { singleAvatar, uploadSendAttachments };
