import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";

const getBase64 = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const uploadFilesFromCloudinary = async (files = []) => {
  const uploadPromises = files.map((file) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        getBase64(file),
        {
          resource_type: "auto",
          public_id: uuid()
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
  });

  try {
    const results = await Promise.all(uploadPromises);

    const formattedResult = results.map((res) => ({
      public_id: res.public_id,
      url: res.secure_url
    }));

    return formattedResult;
  } catch (error) {
    throw new Error(
      "Error uploading files to Cloudinary! Please provide correct files.",
      error
    );
  }
};

const deleteFilesFromCloudinary = async (publicIds) => {};

export { deleteFilesFromCloudinary, uploadFilesFromCloudinary };
