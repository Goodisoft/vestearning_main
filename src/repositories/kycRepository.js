// repositories/kycRepository.js
const KYC = require("../models/kycModel");
const User = require("../models/userModel");
const KYCSettings = require("../models/kycSettingsModel");
const mongoose = require("mongoose");
const BaseRepository = require("./baseRepository");

class KycRepository extends BaseRepository {
  constructor() {
    super(KYC);
  }

  /**
   * Create a new KYC application
   * @param {Object} kycData - KYC data
   * @returns {Promise<Object>} Created KYC document
   */
  async createKyc(kycData) {
    const kyc = new KYC(kycData);
    return await kyc.save();
  }

  /**
   * Find KYC by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} KYC document
   */
  async findByUserId(userId) {
    return await KYC.findOne({ user: userId }).populate(
      "user",
      "email username firstName lastName"
    );
  }

  /**
   * Update KYC status
   * @param {string} id - KYC ID
   * @param {string} status - New status
   * @param {string} adminId - Admin ID
   * @param {string} rejectReason - Rejection reason (optional)
   * @returns {Promise<Object>} Updated KYC document
   */
  async updateStatus(id, status, adminId, rejectReason = null) {
    const update = {
      status,
      requestedBy: adminId,
      completedAt: status !== "pending" ? new Date() : null,
      rejectReason: status === "rejected" ? rejectReason : null,
    };

    return await KYC.findByIdAndUpdate(id, update, { new: true }).populate(
      "user",
      "email username firstName lastName"
    );
  }

  /**
   * Get KYC with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated KYC data
   */
  async getAllKycWithPagination(options) {
    const { page = 1, limit = 10, search = "", status = "" } = options;

    // Build query
    const query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Build search condition
    if (search) {
      // We need to join with the User model to search by user fields
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((user) => user._id);

      if (userIds.length) {
        query.user = { $in: userIds };
      } else {
        // No users found matching search, return empty result
        return {
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          hasPrevPage: false,
          hasNextPage: false,
          prevPage: null,
          nextPage: null,
        };
      }
    }

    // Count total documents
    const totalDocs = await KYC.countDocuments(query);

    // Calculate pagination values
    const totalPages = Math.ceil(totalDocs / limit);
    const skip = (page - 1) * limit;

    // Get paginated documents
    const docs = await KYC.find(query)
      .populate("user", "email username firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return {
      docs,
      totalDocs,
      totalPages,
      page: parseInt(page),
      limit: parseInt(limit),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? parseInt(page) - 1 : null,
      nextPage: page < totalPages ? parseInt(page) + 1 : null,
    };
  }

  /**
   * Get users with KYC status with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} Paginated user data
   */
  async getUsersWithKycStatus(options) {
    const { page = 1, limit = 10, search = "", kycStatus = "" } = options;

    // Build query
    const query = {};

    // Filter by KYC status if provided
    if (kycStatus) {
      query.kycStatus = kycStatus;
    }

    // Add search condition if provided
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents
    const totalDocs = await User.countDocuments(query);

    // Calculate pagination values
    const totalPages = Math.ceil(totalDocs / limit);
    const skip = (page - 1) * limit;

    // Get paginated documents
    const docs = await User.find(query)
      .select(
        "_id email username firstName lastName profilePicture kycStatus createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get KYC data for these users
    const userIds = docs.map((user) => user._id);
    const kycData = await KYC.find({ user: { $in: userIds } })
      .select("user status requestedAt completedAt")
      .lean();

    // Map KYC data to users
    const docsWithKyc = docs.map((user) => {
      const userObj = user.toObject();
      const kyc = kycData.find(
        (k) => k.user.toString() === user._id.toString()
      );

      if (kyc) {
        userObj.kycData = {
          status: kyc.status,
          requestedAt: kyc.requestedAt,
          completedAt: kyc.completedAt,
        };
      }

      return userObj;
    });

    return {
      docs: docsWithKyc,
      totalDocs,
      totalPages,
      page: parseInt(page),
      limit: parseInt(limit),
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? parseInt(page) - 1 : null,
      nextPage: page < totalPages ? parseInt(page) + 1 : null,
    };
  }

  /**
   * Get KYC details by ID
   * @param {string} id - KYC ID
   * @returns {Promise<Object>} KYC document
   */
  async getKycDetails(id) {
    return await KYC.findById(id)
      .populate("user", "email username firstName lastName")
      .populate("requestedBy", "email username");
  }

  /**
   * Get KYC settings or create default if not exists
   * @returns {Promise<Object>} KYC settings
   */
  async getKycSettings() {
    return await KYCSettings.getSettings();
  }

  /**
   * Update KYC settings
   * @param {Object} settings - New settings
   * @param {string} adminId - Admin ID
   * @returns {Promise<Object>} Updated settings
   */
  async updateKycSettings(settings, adminId) {
    const currentSettings = await this.getKycSettings();

    // Update settings with new values
    Object.keys(settings).forEach((key) => {
      currentSettings[key] = settings[key];
    });

    // Set updatedBy
    currentSettings.updatedBy = adminId;

    // Save and return updated settings
    await currentSettings.save();
    return currentSettings;
  }

  /**
   * Update KYC
   * @param {string} id - KYC ID
   * @param {Object} data - KYC data to update
   * @returns {Promise<Object>} Updated KYC
   */
  async update(id, data) {
    return await KYC.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = new KycRepository();
