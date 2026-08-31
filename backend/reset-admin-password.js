import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.js";

const NEW_PASSWORD = "Admin@12345";

async function resetAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    const hashedPassword = await bcrypt.hash(
      NEW_PASSWORD,
      12
    );

    const admin = await User.findOne({
      username: "admin"
    }).select("+password");

    if (!admin) {
      console.log("❌ Admin user not found.");
      return;
    }

    admin.password = hashedPassword;
    admin.role = "admin";
    admin.status = "active";
    admin.authVersion = 0;

    await admin.save();

    console.log("");
    console.log("✅ ADMIN PASSWORD RESET SUCCESSFULLY");
    console.log("");
    console.log("Username:", admin.username);
    console.log("Password:", NEW_PASSWORD);
    console.log("Role:", admin.role);
    console.log("Status:", admin.status);
    console.log("");

    const verification = await bcrypt.compare(
      NEW_PASSWORD,
      admin.password
    );

    console.log(
      "Password verification:",
      verification ? "✅ PASS" : "❌ FAIL"
    );

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

resetAdminPassword();
