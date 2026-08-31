import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true
    },

    status: {
      type: String,
      enum: [
        "active",
        "disabled",
        "locked"
      ],
      default: "active",
      index: true
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car"
      }
    ],

    lastLoginAt: {
      type: Date,
      default: null
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0
    },

    lockedUntil: {
      type: Date,
      default: null
    },

    authVersion: {
      type: Number,
      default: 0,
      min: 0
    }

  },
  {
    timestamps: true
  }
);

export default mongoose.model(
  "User",
  userSchema
);