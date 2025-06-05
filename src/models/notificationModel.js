/**
 * @fileoverview Notification model for user notifications
 */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * @typedef {Object} Notification
 * @property {ObjectId} userId - User who owns the notification
 * @property {string} title - Notification title
 * @property {string} message - Notification message content
 * @property {string} type - Type of notification (transaction, system, security)
 * @property {boolean} isRead - Whether the notification has been read
 * @property {Date} createdAt - When the notification was created
 * @property {Date} updatedAt - When the notification was last updated
 */

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["transaction", "system", "security"],
      default: "system",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for performance
notificationSchema.index({ userId: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
