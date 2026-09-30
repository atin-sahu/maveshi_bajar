import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

async function main() {
  await mongoose.connect(uri);
  const hash = await bcrypt.hash("atin@123", 10);
  const res = await mongoose.connection.db.collection("admins").updateOne(
    { email: "admin@maveshibajar.com" },
    { $set: { password: hash, updatedAt: new Date() } },
    { upsert: true }
  );
  console.log("Admin password updated successfully to atin@123");
  await mongoose.disconnect();
}

main().catch(console.error);
