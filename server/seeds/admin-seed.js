import UserModel from "../models/users-model.js";

const seedAdmin = async () => {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    console.log("Admin seed skipped: set ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD.");
    return;
  }

  const existingAdmin = await UserModel.findOne({ email });

  if (existingAdmin) {
    console.log(`Admin seed skipped: a user with ${email} already exists.`);
    return;
  }

  await UserModel.create({
    username,
    email,
    password,
    role: "admin",
  });

  console.log(`Admin seed created: ${email}`);
};

export default seedAdmin;
