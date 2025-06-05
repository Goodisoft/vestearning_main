/**
 * @fileoverview Notification service for handling notification-related business logic
 */

const notificationRepository = require("../repositories/notificationRepository");
const notificationModel = require("../models/notificationModel");

/**
 * Create a new notification
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @returns {Promise<Object>} Created notification
 */
async function createNotification(userId, title, message, type = "system") {
  try {
    const notification = await notificationRepository.createNotification({
      userId,
      title,
      message,
      type,
    });

    return {
      success: true,
      notification,
      message: "Notification created successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to create notification: ${error.message}`,
    };
  }
}

/**
 * Get unread notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Unread notifications
 */
async function getUnreadNotifications(userId) {
  try {
    const notifications = await notificationRepository.getUnreadNotifications(
      userId
    );

    return {
      success: true,
      notifications,
      count: notifications.length,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get unread notifications: ${error.message}`,
    };
  }
}

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} User notifications
 */
async function getUserNotifications(userId, options = {}) {
  try {
    const notifications = await notificationRepository.getUserNotifications(
      userId,
      options
    );

    return {
      success: true,
      notifications,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get notifications: ${error.message}`,
    };
  }
}

/**
 * Get all notifications for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} User notifications
 */
async function getNotificationWithLimit(userId, limit) {
  try {
    const notifications =
      await notificationRepository.getUserNotificationWithLimit(userId, limit);

    return {
      success: true,
      notifications,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to get notifications: ${error.message}`,
    };
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @param {string} userId - User ID (for verification)
 * @returns {Promise<Object>} Updated notification
 */
async function markAsRead(notificationId, userId) {
  try {
    // Verify notification belongs to user
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      return {
        success: false,
        message: "Notification not found",
      };
    }

    if (notification.userId.toString() !== userId.toString()) {
      return {
        success: false,
        message: "Not authorized to update this notification",
      };
    }

    const updatedNotification = await notificationRepository.markAsRead(
      notificationId
    );

    return {
      success: true,
      notification: updatedNotification,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to mark notification as read: ${error.message}`,
    };
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
async function markAllAsRead(userId) {
  try {
    await notificationRepository.markAllAsRead(userId);

    return {
      success: true,
      message: "All notifications marked as read",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to mark all notifications as read: ${error.message}`,
    };
  }
}

/**
 * Mark a specific notification as read
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Result
 */
async function markNotificationAsRead(userId, notificationId) {

  try {
    // Verify notification belongs to user
    const notification = await notificationModel.findById(notificationId);
    
    if (!notification) {
      return {
        success: false,
        message: "Notification not found",
      };
    }

    if (notification.userId.toString() !== userId.toString()) {
      return {
        success: false,
        message: "Not authorized to update this notification",
      };
    }

    const updatedNotification = await notificationRepository.markAsRead(
      notificationId
    );

    return {
      success: true,
      notification: updatedNotification,
      message: "Notification marked as read",
    };
  } catch (error) {
    console.log(error);
    
    return {
      success: false,
      message: `Failed to mark notification as read: ${error.message}`,
    };
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result
 */
async function markAllNotificationsAsRead(userId) {
  try {
    await notificationRepository.markAllAsRead(userId);

    return {
      success: true,
      message: "All notifications marked as read",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to mark all notifications as read: ${error.message}`,
    };
  }
}

/**
 * Create a transaction notification
 * @param {string} userId - User ID
 * @param {Object} transaction - Transaction data
 * @returns {Promise<Object>} Created notification
 */
async function createTransactionNotification(userId, transaction) {
  let title, message;
  const formattedAmount = (transaction.amount / 100000000).toFixed(8);

  switch (transaction.type) {
    case "deposit":
      if (transaction.status === "pending") {
        title = "Deposit Pending";
        message = `Your deposit of ${formattedAmount} BTC is pending confirmation.`;
      } else if (transaction.status === "completed") {
        title = "Deposit Confirmed";
        message = `Your deposit of ${formattedAmount} BTC has been confirmed.`;
      } else if (transaction.status === "failed") {
        title = "Deposit Failed";
        message = `Your deposit of ${formattedAmount} BTC has failed.`;
      }
      break;
    case "withdrawal":
      if (transaction.status === "pending") {
        title = "Withdrawal Pending";
        message = `Your withdrawal of ${formattedAmount} BTC is being processed.`;
      } else if (transaction.status === "completed") {
        title = "Withdrawal Completed";
        message = `Your withdrawal of ${formattedAmount} BTC has been completed.`;
      } else if (transaction.status === "failed") {
        title = "Withdrawal Failed";
        message = `Your withdrawal of ${formattedAmount} BTC has failed.`;
      }
      break;
    case "investment":
      if (transaction.status === "completed") {
        title = "Investment Successful";
        message = `Your investment of ${formattedAmount} BTC has been confirmed.`;
      }
      break;
    case "earning":
      if (transaction.status === "completed") {
        title = "Investment Earnings";
        message = `You have earned ${formattedAmount} BTC from your investments.`;
      }
      break;
    case "referral":
      if (transaction.status === "completed") {
        title = "Referral Bonus";
        message = `You have received a referral bonus of ${formattedAmount} BTC.`;
      }
      break;
    default:
      title = "Transaction Update";
      message = `Your ${transaction.type} transaction of ${formattedAmount} BTC has been updated to ${transaction.status}.`;
  }

  return await createNotification(userId, title, message, "transaction");
}

module.exports = {
  createNotification,
  getUnreadNotifications,
  getUserNotifications,
  getNotificationWithLimit,
  markAsRead,
  markAllAsRead,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createTransactionNotification,
};
