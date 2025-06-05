/**
 * @fileoverview Investment Plan service for handling plan-related business logic
 */

const planRepository = require("../repositories/planRepository");

/**
 * Create a new investment plan
 * @param {Object} planData - Plan data to create
 * @returns {Promise<Object>} Created plan
 */
async function createPlan(planData) {
  try {
    // Create the plan
    const plan = await planRepository.create(planData);

    return {
      success: true,
      plan,
      message: "Investment plan created successfully",
    };
  } catch (error) {   
    console.log("error", error);
 
    return {
      success: false,
      message: `Failed to create investment plan: ${error.message}`,
    };
  }
}

/**
 * Update an existing investment plan
 * @param {string} planId - Plan ID
 * @param {Object} updateData - Plan data to update
 * @returns {Promise<Object>} Updated plan
 */
async function updatePlan(planId, updateData) {
  try {
    // Update the plan
    const plan = await planRepository.update(planId, updateData);

    return {
      success: true,
      plan,
      message: "Investment plan updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update investment plan: ${error.message}`,
    };
  }
}

/**
 * Get all investment plans
 * @param {Object} query - Query parameters
 * @returns {Promise<Object>} List of plans
 */
async function getAllPlans(query = {}) {
  try {
    let plans;

    // Filter by type if specified
    if (query.type) {
      plans = await planRepository.findPlansByType(query.type);
    }
    // Filter by active status if specified
    else if (query.active === "true") {
      plans = await planRepository.findActivePlans();
    }
    // Otherwise get all plans
    else {
      plans = await planRepository.findAll();
    }

    return {
      success: true,
      plans: plans,
      count: plans.length,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to retrieve investment plans: ${error.message}`,
    };
  }
}

/**
 * Get plan by ID
 * @param {string} planId - Plan ID
 * @returns {Promise<Object>} Plan details
 */
async function getPlanById(planId) {
  try {
    const plan = await planRepository.findById(planId);

    return {
      success: true,
      plan: plan,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to retrieve investment plan: ${error.message}`,
    };
  }
}

/**
 * Get plan by shortName
 * @param {string} shortName - Plan shortName
 * @returns {Promise<Object>} Plan details
 */
async function getPlanByShortName(shortName) {
  try {
    const plan = await planRepository.findPlanByShortName(shortName);

    return {
      success: true,
      plan: plan,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to retrieve investment plan: ${error.message}`,
    };
  }
}

/**
 * Toggle plan active status
 * @param {string} planId - Plan ID
 * @returns {Promise<Object>} Updated plan
 */
async function togglePlanStatus(planId) {
  try {
    const plan = await planRepository.findById(planId);
    const updatedPlan = await planRepository.updatePlanStatus(
      planId,
      !plan.isActive
    );

    return {
      success: true,
      plan: updatedPlan,
      message: `Investment plan ${
        updatedPlan.isActive ? "activated" : "deactivated"
      } successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to update plan status: ${error.message}`,
    };
  }
}

/**
 * Delete a plan
 * @param {string} planId - Plan ID
 * @returns {Promise<Object>} Result of deletion
 */
async function deletePlan(planId) {
  try {
    await planRepository.delete(planId);

    return {
      success: true,
      message: "Investment plan deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to delete investment plan: ${error.message}`,
    };
  }
}

/**
 * Get investment plan statistics
 * @returns {Promise<Object>} Plan statistics
 */
async function getPlanStatistics() {
  try {
    const stats = await planRepository.getPlanStatistics();

    return {
      success: true,
      statistics: stats,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to retrieve plan statistics: ${error.message}`,
    };
  }
}

module.exports = {
  createPlan,
  updatePlan,
  getAllPlans,
  getPlanById,
  getPlanByShortName,
  togglePlanStatus,
  deletePlan,
  getPlanStatistics,
};
