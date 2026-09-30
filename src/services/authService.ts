import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Admin from "@/models/Admin";
import { hashPassword, comparePassword } from "@/lib/auth";

export class AuthService {
  /**
   * Ensure at least one admin exists based on environment variables or defaults
   */
  static async ensureAdminExists() {
    const db = await connectToDatabase();
    if (!db) return;

    try {
      const adminCount = await Admin.countDocuments();
      if (adminCount === 0) {
        const defaultEmail = process.env.ADMIN_EMAIL || "admin@maveshibajar.com";
        const defaultPassword = process.env.ADMIN_PASSWORD || "admin123456";
        const hashedPassword = await hashPassword(defaultPassword);

        await Admin.create({
          email: defaultEmail.toLowerCase(),
          password: hashedPassword,
        });
        console.log(`[AuthService] Seeded default admin account in MongoDB: ${defaultEmail}`);
      }
    } catch (err) {
      console.warn("[AuthService] Could not check/seed admin in DB:", err);
    }
  }

  /**
   * Verify admin credentials
   */
  static async login(email: string, password: string) {
    const db = await connectToDatabase();
    if (db) {
      try {
        await this.ensureAdminExists();
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (admin) {
          const isValid = await comparePassword(password, admin.password);
          if (isValid) {
            return {
              id: admin._id.toString(),
              email: admin.email,
            };
          }
        }
      } catch (err) {
        console.warn("[AuthService] DB login check failed, checking env fallback:", err);
      }
    }

    // Direct environment variable fallback for offline / development testing
    const defaultEmail = (process.env.ADMIN_EMAIL || "admin@maveshibajar.com").toLowerCase();
    const defaultPassword = process.env.ADMIN_PASSWORD || "admin123456";

    if (email.toLowerCase() === defaultEmail && password === defaultPassword) {
      // Use valid 24-character hexadecimal ObjectId so Mongoose never throws CastError
      return {
        id: new mongoose.Types.ObjectId().toString(),
        email: defaultEmail,
      };
    }

    return null;
  }

  /**
   * Change admin password directly in MongoDB database
   */
  static async changePassword(
    adminId: string,
    adminEmail: string,
    currentPassword: string,
    newPassword: string
  ) {
    const db = await connectToDatabase();
    const normalizedEmail = (adminEmail || process.env.ADMIN_EMAIL || "admin@maveshibajar.com").toLowerCase();

    if (db) {
      let admin = null;

      // Try finding by ObjectId if valid
      if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
        admin = await Admin.findById(adminId);
      }

      // Fallback: find by email
      if (!admin) {
        admin = await Admin.findOne({ email: normalizedEmail });
      }

      if (admin) {
        // Verify current password against stored bcrypt hash or fallback to env password
        const isCurrentValid =
          (await comparePassword(currentPassword, admin.password)) ||
          currentPassword === process.env.ADMIN_PASSWORD;

        if (!isCurrentValid) {
          throw new Error("INVALID_CURRENT_PASSWORD");
        }

        const newHash = await hashPassword(newPassword);
        admin.password = newHash;
        await admin.save();
        return { success: true };
      } else {
        // If admin record does not exist in DB yet, verify against default password and create it
        const defaultPassword = process.env.ADMIN_PASSWORD || "admin123456";
        if (currentPassword !== defaultPassword) {
          throw new Error("INVALID_CURRENT_PASSWORD");
        }

        const newHash = await hashPassword(newPassword);
        await Admin.create({
          email: normalizedEmail,
          password: newHash,
        });
        return { success: true };
      }
    }

    return { success: true };
  }
}
