import express from "express";
import seedUser from "./seedUser.js";
import { isAdmin } from "../middlewares/auth.js";

const seedRoute = express.Router();

seedRoute.get("/seed-user", isAdmin, seedUser);

export default seedRoute;
