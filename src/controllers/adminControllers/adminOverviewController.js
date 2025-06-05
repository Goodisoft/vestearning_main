const userRepository = require("../../repositories/userRepository");
const transactionRepository = require("../../repositories/transactionRepository");
const investmentRepository = require("../../repositories/planRepository");
const walletRepository = require("../../repositories/walletRepository");
const InvestmentModel = require("../../models/investmentModel");
const TransactionModel = require("../../models/transactionModel");
const WithdrawalModel = require("../../models/withdrawalModel");
const Plan = require("../../models/planModel");
const mongoose = require("mongoose");

class AdminOverviewController {
  /**
   * Get site statistics for the admin dashboard
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {Object} - JSON response with site statistics
   */
  static async getSiteStatistics(req, res) {
    try {
      // Get counts of pending requests
      const pendingWithdrawals = await WithdrawalModel.countDocuments({
        status: "pending",
      });
      const pendingDeposits = await TransactionModel.countDocuments({
        type: { $in: ["investment", "loan", "promo"] },
        status: "pending",
      });
      const pendingReferrals = await TransactionModel.countDocuments({
        type: "referral",
        status: "pending",
      });

      // Get user statistics
      const totalUsers = await userRepository.countAllDocuments({});
      const activeUsers = await userRepository.countAllDocuments({
        status: "active",
      });
      const newUsersToday = await userRepository.countAllDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });

      // Get total registered users with a 7-day trend
      const usersLastWeek = await userRepository.countAllDocuments({
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 14)),
          $lt: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      });

      const usersThisWeek = await userRepository.countAllDocuments({
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
        },
      });

      // Calculate percentage change
      const usersTrend = usersThisWeek > usersLastWeek ? "up" : "down";
      let usersPercentChange = 0;
      if (usersLastWeek > 0) {
        usersPercentChange = Math.abs(
          ((usersThisWeek - usersLastWeek) / usersLastWeek) * 100
        ).toFixed(1);
      }

      return res.status(200).json({
        success: true,
        statistics: {
          pendingWithdrawals,
          pendingDeposits,
          pendingReferrals,
          totalUsers,
          activeUsers,
          newUsersToday,
          usersTrend,
          usersPercentChange,
        },
      });
    } catch (error) {
      console.error("Error fetching site statistics:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch site statistics",
      });
    }
  }

  /**
   * Get deposit statistics for the admin dashboard
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {Object} - JSON response with deposit statistics
   */
  static async getDepositStatistics(req, res) {
    try {
      // Get total deposits
      const totalDeposits = await TransactionModel.aggregate([
        {
          $match: {
            type: { $in: ["investment", "loan", "promo"] },
            status: "completed",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const total = totalDeposits.length > 0 ? totalDeposits[0].total : 0;

      // Get deposits for the last 7 days
      const weekDeposits = await TransactionModel.aggregate([
        {
          $match: {
            type: { $in: ["investment", "loan", "promo"] },
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const week = weekDeposits.length > 0 ? weekDeposits[0].total : 0;

      // Get deposits for the last 30 days
      const monthDeposits = await TransactionModel.aggregate([
        {
          $match: {
            type: { $in: ["investment", "loan", "promo"] },
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const month = monthDeposits.length > 0 ? monthDeposits[0].total : 0;

      // Get deposits for previous period (30-60 days ago) for comparison
      const prevPeriodDeposits = await TransactionModel.aggregate([
        {
          $match: {
            type: { $in: ["investment", "loan", "promo"] },
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 60)),
              $lt: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const prevPeriod =
        prevPeriodDeposits.length > 0 ? prevPeriodDeposits[0].total : 0;

      // Calculate percentage change
      const trend = month >= prevPeriod ? "up" : "down";
      let percentChange = 0;
      if (prevPeriod > 0) {
        percentChange = Math.abs(
          ((month - prevPeriod) / prevPeriod) * 100
        ).toFixed(1);
      }

      // Generate chart data for the last 6 months
      const chartData = await AdminOverviewController.generateMonthlyChartData(
        "deposit"
      );

      return res.status(200).json({
        success: true,
        deposits: {
          total,
          week,
          month,
          trend,
          percentChange,
          chartData,
        },
      });
    } catch (error) {
      console.error("Error fetching deposit statistics:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch deposit statistics",
      });
    }
  }

  /**
   * Get withdrawal statistics for the admin dashboard
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {Object} - JSON response with withdrawal statistics
   */
  static async getWithdrawalStatistics(req, res) {
    try {
      // Get total withdrawals
      const totalWithdrawals = await WithdrawalModel.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const total = totalWithdrawals.length > 0 ? totalWithdrawals[0].total : 0;

      // Get withdrawals for the last 7 days
      const weekWithdrawals = await WithdrawalModel.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const week = weekWithdrawals.length > 0 ? weekWithdrawals[0].total : 0;

      // Get withdrawals for the last 30 days
      const monthWithdrawals = await WithdrawalModel.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const month = monthWithdrawals.length > 0 ? monthWithdrawals[0].total : 0;

      // Get withdrawals for previous period (30-60 days ago) for comparison
      const prevPeriodWithdrawals = await WithdrawalModel.aggregate([
        {
          $match: {
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 60)),
              $lt: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const prevPeriod =
        prevPeriodWithdrawals.length > 0 ? prevPeriodWithdrawals[0].total : 0;

      // Calculate percentage change
      const trend = month >= prevPeriod ? "up" : "down";
      let percentChange = 0;
      if (prevPeriod > 0) {
        percentChange = Math.abs(
          ((month - prevPeriod) / prevPeriod) * 100
        ).toFixed(1);
      }

      // Generate chart data for the last 6 months
      const chartData = await AdminOverviewController.generateMonthlyChartData(
        "withdrawal"
      );

      return res.status(200).json({
        success: true,
        withdrawals: {
          total,
          week,
          month,
          trend,
          percentChange,
          chartData,
        },
      });
    } catch (error) {
      console.error("Error fetching withdrawal statistics:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch withdrawal statistics",
      });
    }
  }

  /**
   * Get wallet balances for the admin dashboard
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {Object} - JSON response with wallet balances
   */
  static async getWalletBalances(req, res) {
    try {
      // Get total wallet balance across all users
      const walletBalances = await walletRepository.getWalletStats();

      const balance = walletBalances.totalWalletBalance || 0;

      // Get month's deposit total
      const monthDeposit = await TransactionModel.aggregate([
        {
          $match: {
            type: { $in: ["investment", "loan", "promo"] },
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      // Get week's deposit total
      const weekDeposit = await TransactionModel.aggregate([
        {
          $match: {
            type: { $in: ["investment", "loan", "promo"] },
            status: "completed",
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      // Generate chart data for wallet balance growth
      const chartData =
        await AdminOverviewController.generateWalletGrowthChartData();

      return res.status(200).json({
        success: true,
        wallet: {
          balance,
          monthDeposit: monthDeposit.length > 0 ? monthDeposit[0].total : 0,
          weekDeposit: weekDeposit.length > 0 ? weekDeposit[0].total : 0,
          chartData,
        },
      });
    } catch (error) {
      console.error("Error fetching wallet balances:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch wallet balances",
      });
    }
  }

  /**
   * Get investment overview data for the admin dashboard
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {Object} - JSON response with investment overview data
   */
  static async getInvestmentOverview(req, res) {
    try {
      const period = req.query.period || "overview";
      

      // Get active investments data
      const activeInvestments = await InvestmentModel.aggregate([
        { $match: { status: "active" } },
        {
          $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } },
        },
      ]);
      

      const activeAmount =
        activeInvestments.length > 0 ? activeInvestments[0].total : 0;
      const activePlans =
        activeInvestments.length > 0 ? activeInvestments[0].count : 0;

      // Get total profit paid
      const profitPaid = await TransactionModel.aggregate([
        { $match: { type: { $in: ["investment", "loan", "promo"] }, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$expectedEarning" } } },
      ]);

      const paidProfitAmount = profitPaid.length > 0 ? profitPaid[0].total : 0;

      // Initialize the response object
      const response = {
        success: true,
        investments: {
          overview: {
            activeAmount,
            activePlans,
            paidProfitAmount,
          },
          thisYear: {
            activeAmount,
            activePlans,
            paidProfitAmount,
          },
          allTime: {
            activeAmount,
            activePlans,
            paidProfitAmount, 
            totalAmount: 0,
            totalPlans: 0,
          },
        },
      };

      // Process data based on the requested period
      if (period === "overview") {
        // Get this month's investments
        const currentDate = new Date();
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );

        const monthInvestments = await InvestmentModel.aggregate([
          {
            $match: {
              createdAt: { $gte: firstDayOfMonth },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]);

        // Get previous month's investments for comparison
        const firstDayOfPrevMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1
        );
        const lastDayOfPrevMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          0
        );

        const prevMonthInvestments = await InvestmentModel.aggregate([
          {
            $match: {
              createdAt: {
                $gte: firstDayOfPrevMonth,
                $lte: lastDayOfPrevMonth,
              },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]);

        // Calculate trends
        const monthAmount =
          monthInvestments.length > 0 ? monthInvestments[0].total : 0;
        const monthPlans =
          monthInvestments.length > 0 ? monthInvestments[0].count : 0;
        const prevMonthAmount =
          prevMonthInvestments.length > 0 ? prevMonthInvestments[0].total : 0;

        const monthTrend = monthAmount >= prevMonthAmount ? "up" : "down";
        let monthPercentChange = 0;
        if (prevMonthAmount > 0) {
          monthPercentChange = Math.abs(
            ((monthAmount - prevMonthAmount) / prevMonthAmount) * 100
          ).toFixed(1);
        }
        

        // Get previous 7-14 days investments for active trend
        const twoWeeksAgo = new Date(
          currentDate.getTime() - 14 * 24 * 60 * 60 * 1000
        );
        const oneWeekAgo = new Date(
          currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
        );

        const prevWeekActive = await InvestmentModel.aggregate([
          {
            $match: {
              status: "active",
              createdAt: {
                $gte: twoWeeksAgo,
                $lt: oneWeekAgo,
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const currentWeekActive = await InvestmentModel.aggregate([
          {
            $match: {
              status: "active",
              createdAt: { $gte: oneWeekAgo },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const prevWeekActiveAmount =
          prevWeekActive.length > 0 ? prevWeekActive[0].total : 0;
        const currentWeekActiveAmount =
          currentWeekActive.length > 0 ? currentWeekActive[0].total : 0;

        const activeTrend =
          currentWeekActiveAmount >= prevWeekActiveAmount ? "up" : "down";
        let activePercentChange = 0;
        if (prevWeekActiveAmount > 0) {
          activePercentChange = Math.abs(
            ((currentWeekActiveAmount - prevWeekActiveAmount) /
              prevWeekActiveAmount) *
              100
          ).toFixed(1);
        }

        // Update overview data
        response.investments.overview.monthAmount = monthAmount;
        response.investments.overview.monthPlans = monthPlans;
        response.investments.overview.monthTrend = monthTrend;
        response.investments.overview.monthPercentChange = monthPercentChange;
        response.investments.overview.activeTrend = activeTrend;
        response.investments.overview.activePercentChange = activePercentChange;
      } else if (period === "thisyear") {
        // Get this year's investments
        const currentYear = new Date().getFullYear();
        const firstDayOfYear = new Date(currentYear, 0, 1);

        const yearInvestments = await InvestmentModel.aggregate([
          {
            $match: {
              createdAt: { $gte: firstDayOfYear },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]);

        const yearAmount =
          yearInvestments.length > 0 ? yearInvestments[0].total : 0;
        const yearPlans =
          yearInvestments.length > 0 ? yearInvestments[0].count : 0;

        // Update this year data
        response.investments.thisYear.monthAmount = yearAmount;
        response.investments.thisYear.monthPlans = yearPlans;
      } else if (period === "alltime") {
        // Get all time investments
        const allInvestments = await InvestmentModel.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]);

        const totalAmount =
          allInvestments.length > 0 ? allInvestments[0].total : 0;
        const totalPlans =
          allInvestments.length > 0 ? allInvestments[0].count : 0;

        // Update all time data
        response.investments.allTime.totalAmount = totalAmount;
        response.investments.allTime.totalPlans = totalPlans;
      }

      return res.status(200).json(response);
    } catch (error) {
      console.error("Error fetching investment overview:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch investment overview data",
      });
    }
  }

  /**
   * Get recent investments for the admin dashboard
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {Object} - JSON response with recent investments
   */
  static async getRecentInvestments(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 3;

      // Get most recent investments with user and plan details
      const recentInvestments = await InvestmentModel.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("userId", "fullName email")
        .populate("planId", "name roiPercentage term termPeriod");

      return res.status(200).json({
        success: true,
        investments: recentInvestments,
      });
    } catch (error) {
      console.error("Error fetching recent investments:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch recent investments",
      });
    }
  }

  /**
   * Get top invested plans for the admin dashboard
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {Object} - JSON response with top invested plans
   */
  static async getTopInvestedPlans(req, res) {
    try {
      const period = req.query.period || "30";
      const periodDays = parseInt(period);

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Get investments grouped by plan
      const planInvestments = await InvestmentModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$planId",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
      ]);

      // Calculate total investment amount in the period
      const totalInvestment = await InvestmentModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalAmount =
        totalInvestment.length > 0 ? totalInvestment[0].total : 0;

      // Populate plan names
      const planIds = planInvestments.map((item) => item._id);

      // Use find with $in operator instead of findById which only returns a single document
      const plans = await Plan.find({ _id: { $in: planIds } });

      // Calculate percentages and prepare response
      const topPlans = planInvestments.map((item) => {
        const plan = plans.find(
          (p) => p._id.toString() === item._id.toString()
        );
        const percentage =
          totalAmount > 0
            ? Math.round((item.totalAmount / totalAmount) * 100)
            : 0;

        return {
          planId: item._id,
          planName: plan ? plan.name : "Unknown Plan",
          totalAmount: item.totalAmount,
          count: item.count,
          percentage,
        };
      });

      return res.status(200).json({
        success: true,
        topPlans,
      });
    } catch (error) {
      console.error("Error fetching top invested plans:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch top invested plans",
      });
    }
  }

  /**
   * Get recent activities for the admin dashboard
   * @param {*} req - Request object
   * @param {*} res - Response object
   * @returns {Object} - JSON response with recent activities
   */
  static async getRecentActivities(req, res) {
    try {
      const type = req.query.type || "all";
      const limit = parseInt(req.query.limit) || 5;

      // Combine recent transactions and withdrawals
      const activitiesPromises = [];

      // Get recent transactions (deposits and others)
      const transactionQuery = { status: "completed" };
      if (type !== "all") {
        if (type === "deposit") {
          transactionQuery.type = "deposit";
        } else if (type === "profit") {
          transactionQuery.type = "profit";
        }
      }

      const transactionsPromise = TransactionModel.find(transactionQuery)
        .sort({ createdAt: -1 })
        .limit(type === "all" ? Math.floor(limit / 2) : limit)
        .populate("userId", "fullName email")
        .lean()
        .then((transactions) => {
          return transactions.map((tx) => ({
            _id: tx._id,
            type: tx.type,
            amount: tx.amount,
            user: {
              id: tx.userId?._id,
              name: tx.userId?.fullName || "Unknown User",
            },
            description: `${tx.userId?.fullName || "Unknown User"} made a ${
              tx.type
            } of $${tx.amount}`,
            time: tx.createdAt,
          }));
        });

      activitiesPromises.push(transactionsPromise);

      // Get recent withdrawals
      if (type === "all" || type === "withdrawal") {
        const withdrawalsPromise = WithdrawalModel.find({ status: "completed" })
          .sort({ createdAt: -1 })
          .limit(type === "all" ? Math.floor(limit / 2) : limit)
          .populate("userId", "fullName email")
          .lean()
          .then((withdrawals) => {
            return withdrawals.map((withdrawal) => ({
              _id: withdrawal._id,
              type: "withdrawal",
              amount: withdrawal.amount,
              user: {
                id: withdrawal.userId?._id,
                name: withdrawal.userId?.fullName || "Unknown User",
              },
              description: `${
                withdrawal.userId?.fullName || "Unknown User"
              } withdrew $${withdrawal.amount}`,
              time: withdrawal.createdAt,
            }));
          });

        activitiesPromises.push(withdrawalsPromise);
      }

      // Combine and sort activities
      const activitiesArrays = await Promise.all(activitiesPromises);
      const allActivities = []
        .concat(...activitiesArrays)
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, limit);

      return res.status(200).json({
        success: true,
        activities: allActivities,
      });
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch recent activities",
      });
    }
  }

  /**
   * Helper method to generate monthly chart data for deposits or withdrawals
   * @param {string} type - Type of data to generate chart for (deposit or withdrawal)
   * @returns {Array} - Chart data points
   */
  static async generateMonthlyChartData(type) {
    try {
      const currentDate = new Date();
      const chartData = [];

      // Generate data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i + 1,
          0
        );

        const monthName = month.toLocaleString("default", { month: "short" });

        let amount = 0;

        if (type === "investment" || type === "loan" || type === "promo") {
          // Get deposits for the month
          const deposits = await TransactionModel.aggregate([
            {
              $match: {
                type: "investment" || type === "loan" || type === "promo",
                status: "completed",
                createdAt: { $gte: month, $lte: endOfMonth },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          amount = deposits.length > 0 ? deposits[0].total : 0;
        } else if (type === "withdrawal") {
          // Get withdrawals for the month
          const withdrawals = await WithdrawalModel.aggregate([
            {
              $match: {
                status: "completed",
                createdAt: { $gte: month, $lte: endOfMonth },
              },
            },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          amount = withdrawals.length > 0 ? withdrawals[0].total : 0;
        }

        chartData.push({
          month: monthName,
          amount,
        });
      }

      return chartData;
    } catch (error) {
      console.error(`Error generating ${type} chart data:`, error);
      return [];
    }
  }

  /**
   * Helper method to generate wallet growth chart data
   * @returns {Array} - Chart data points
   */
  static async generateWalletGrowthChartData() {
    try {
      const currentDate = new Date();
      const chartData = [];

      // Generate data for the last 6 months
      for (let i = 5; i >= 0; i--) {
        const month = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i + 1,
          0
        );

        const monthName = month.toLocaleString("default", { month: "short" });

        // This is an approximation as we don't store historical wallet values
        // We'll use net deposits + profits for the month
        const deposits = await TransactionModel.aggregate([
          {
            $match: {
              type: "deposit",
              status: "completed",
              createdAt: { $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const profits = await TransactionModel.aggregate([
          {
            $match: {
              type: "profit",
              status: "completed",
              createdAt: { $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const withdrawals = await WithdrawalModel.aggregate([
          {
            $match: {
              status: "completed",
              createdAt: { $lte: endOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const depositAmount = deposits.length > 0 ? deposits[0].total : 0;
        const profitAmount = profits.length > 0 ? profits[0].total : 0;
        const withdrawalAmount =
          withdrawals.length > 0 ? withdrawals[0].total : 0;

        // Estimate balance
        const amount = depositAmount + profitAmount - withdrawalAmount;

        chartData.push({
          month: monthName,
          amount: amount > 0 ? amount : 0,
        });
      }

      return chartData;
    } catch (error) {
      console.error("Error generating wallet growth chart data:", error);
      return [];
    }
  }
}

module.exports = AdminOverviewController;
