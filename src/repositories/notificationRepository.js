/**
 * @fileoverview Notification repository for handling notification-related database operations
 */

const Notification = require("../models/notificationModel");
const BaseRepository = require("./baseRepository");

/**
 * Repository for notification-related database operations
 * @extends BaseRepository
 */
class NotificationRepository extends BaseRepository {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  }

  /**
   * Get unread notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Unread notifications
   */
  async getUnreadNotifications(userId) {
    return await Notification.find({
      userId,
      isRead: false,
    }).sort({ createdAt: -1 });
  }

  /**
   * Get 2 notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User notifications
   */
  async getUserNotificationWithLimit(userId, limit = 2) {

    return await Notification.find({ userId,}).sort({ createdAt: -1 }).limit(limit);
  }

  /**
   * Get all notifications for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} User notifications
   */
  async getUserNotifications(userId, options = {}) {
    const { limit = 20, skip = 0, sort = { createdAt: -1 } } = options;

    return await Notification.find({
      userId,
    })
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Update result
   */
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
  }
}

module.exports = new NotificationRepository();
