import mongoose from "mongoose";

export default async function connectUsersDB() {
  try {
    await mongoose.connect(process.env.USERS_URI);
    console.log("Connected to Users Database");
  } catch (error) {
    console.error("Error connecting to Users Database:", error);
  }
}