import { faker } from "@faker-js/faker";
import bcryptjs from "bcryptjs";

import User from "../models/user.model.js";
import { successResponse } from "../helper/responseHandler.js";

const seedUser = async (req, res, next) => {
  try {
    await User.deleteMany();
    const usersPromise = [];
    const hashedPassword = await bcryptjs.hash("Likhon122", 10);
    for (let i = 0; i < 10; i += 1) {
      const tempUser = User.create({
        name: faker.person.fullName(),
        username: faker.internet.userName(),
        email: faker.internet.email(),
        bio: faker.lorem.sentence(5),
        password: hashedPassword,
        avatar: {
          url: faker.image.avatar(),
          publicId: faker.system.fileName()
        }
      });
      usersPromise.push(tempUser);
    }

    const users = await Promise.all(usersPromise);
    successResponse(res, {
      statusCode: 201,
      successMessage: "Users seeded successful!",
      payload: { users },
      nextURl: {}
    });
  } catch (error) {
    next(error);
  }
};

export default seedUser;
