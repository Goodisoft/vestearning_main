/**
 * @fileoverview Investment Plan repository for handling plan-related database operations
 */

const Plan = require("../models/planModel");
const BaseRepository = require("./baseRepository");

/**
 * Repository for investment plan-related database operations
 * @extends BaseRepository
 */
class PlanRepository extends BaseRepository {
  /**
   * Create a new PlanRepository instance
   */
  constructor() {
    super(Plan);
  }

  /**
   * Get all active investment plans
   * @returns {Promise<Array<Plan>>} List of all active plans
   */
  async getActivePlans() {
    try {
      return await Plan.find({ isActive: true }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error getting active plans: ${error.message}`);
    }
  }

  /**
   * Find active investment plans
   * @returns {Promise<Array<Plan>>} List of active plans
   */
  async findActivePlans() {
    try {
      return await Plan.find({ isActive: true }).sort({ minAmount: 1 });
    } catch (error) {
      throw new Error(`Error finding active plans: ${error.message}`);
    }
  }

  /**
   * Find plans by type
   * @param {string} type - Plan type (fixed, flexible, premium)
   * @returns {Promise<Array<Plan>>} List of plans matching the type
   */
  async findPlansByType(type) {
    try {
      return await Plan.find({ type, isActive: true }).sort({ minAmount: 1 });
    } catch (error) {
      throw new Error(`Error finding plans by type: ${error.message}`);
    }
  }

  /**
   * Find plan by shortName
   * @param {string} shortName - Plan shortName
   * @returns {Promise<Plan>} Plan with the given shortName
   */
  async findPlanByShortName(shortName) {
    try {
      const plan = await Plan.findOne({ shortName: shortName.toUpperCase() });
      if (!plan) {
        throw new Error("Plan not found");
      }
      return plan;
    } catch (error) {
      throw new Error(`Error finding plan by shortName: ${error.message}`);
    }
  }

  /**
   * Update plan status
   * @param {string} planId - ID of the plan to update
   * @param {boolean} isActive - New status (active/inactive)
   * @returns {Promise<Plan>} Updated plan
   */
  async updatePlanStatus(planId, isActive) {
    try {
      const plan = await Plan.findByIdAndUpdate(
        planId,
        { isActive },
        { new: true, runValidators: true }
      );

      if (!plan) {
        throw new Error("Plan not found");
      }

      return plan;
    } catch (error) {
      throw new Error(`Error updating plan status: ${error.message}`);
    }
  }

  /**
   * Get investment statistics for all plans
   * @returns {Promise<Object>} Statistics for all plans
   */
  async getPlanStatistics() {
    try {
      const stats = await Plan.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            avgRoi: { $avg: "$roiPercentage" },
            minInvestment: { $min: "$minAmount" },
            maxInvestment: { $max: "$maxAmount" },
          },
        },
      ]);

      const totalStats = await Plan.aggregate([
        {
          $group: {
            _id: null,
            totalPlans: { $sum: 1 },
            avgRoi: { $avg: "$roiPercentage" },
            activePlans: {
              $sum: {
                $cond: [{ $eq: ["$isActive", true] }, 1, 0],
              },
            },
          },
        },
      ]);

      return {
        byType: stats,
        totals: totalStats[0] || {
          totalPlans: 0,
          avgRoi: 0,
          activePlans: 0,
        },
      };
    } catch (error) {
      throw new Error(`Error getting plan statistics: ${error.message}`);
    }
  }

  /**
   * Create a new investment plan
   * @param {Object} planData - Investment plan data
   * @returns {Promise<Plan>} Created plan
   */
  async createPlan(planData) {
    try {
      // If shortName is not provided, generate one from name
      if (!planData.shortName && planData.name) {
        planData.shortName = planData.name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase();
      }

      const plan = new Plan(planData);
      await plan.save();
      return plan;
    } catch (error) {
      throw new Error(`Error creating plan: ${error.message}`);
    }
  }

  /**
   * Update an investment plan
   * @param {string} planId - ID of the plan to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Plan>} Updated plan
   */
  async updatePlan(planId, updateData) {
    try {
      const plan = await Plan.findByIdAndUpdate(planId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!plan) {
        throw new Error("Plan not found");
      }

      return plan;
    } catch (error) {
      throw new Error(`Error updating plan: ${error.message}`);
    }
  }

  /**
   * Delete an investment plan
   * @param {string} planId - ID of the plan to delete
   * @returns {Promise<boolean>} True if deletion was successful
   */
  async deletePlan(planId) {
    try {
      const result = await Plan.findByIdAndDelete(planId);

      if (!result) {
        throw new Error("Plan not found");
      }

      return true;
    } catch (error) {
      throw new Error(`Error deleting plan: ${error.message}`);
    }
  }

  /**
   * Count plans based on query
   * @param {Object} query - Query to filter plans
   * @returns {Promise<number>} Count of matching plans
   */
  async countPlans(query = {}) {
    try {
      return await Plan.countDocuments(query);
    } catch (error) {
      throw new Error(`Error counting plans: ${error.message}`);
    }
  }

  /**
   * Find plans with pagination
   * @param {Object} query - Query to filter plans
   * @param {number} skip - Number of documents to skip
   * @param {number} limit - Maximum number of documents to return
   * @returns {Promise<Array<Plan>>} List of plans matching the query
   */
  async findPlansWithPagination(query = {}, skip = 0, limit = 10) {
    try {
      return await Plan.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      throw new Error(`Error finding plans with pagination: ${error.message}`);
    }
  }
}

module.exports = new PlanRepository();
