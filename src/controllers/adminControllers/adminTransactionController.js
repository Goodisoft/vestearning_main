const adminTransactionService = require("../../services/adminTransactionService");
const walletService = require("../../services/walletService");
const userService = require("../../services/userService");
const notificationService = require("../../services/notificationService");
const { formatDate } = require("../../utils/dateFormatter");
const currencyService = require("../../services/currencyService");

/**
 * Render transaction dashboard
 */
exports.renderTransactionDashboard = async (req, res) => {
  try {
    const dashboardData =
      await adminTransactionService.getTransactionDashboard();

    res.render("adminViews/transaction_dashboard", {
      pageTitle: "Transaction Dashboard",
      dashboardData,
      user: req.user,
    });
  } catch (error) {
    console.error("Error in renderTransactionDashboard:", error);
    req.flash("error", "Failed to load transaction dashboard data");
    res.redirect("/admin/dashboard");
  }
};

/**
 * Render deposit list page
 */
exports.renderDepositList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const search = req.query.search || "";
    const sortOrder = req.query.sort || "desc";

    const result = await adminTransactionService.getDeposits({
      page,
      limit,
      status,
      search,
      sortOrder,
    });

    res.render("adminViews/deposit_list", {
      pageTitle: "Deposit Management",
      deposits: result.deposits,
      pagination: result.pagination,
      filters: { status, search, sortOrder },
      user: req.user,
    });
  } catch (error) {
    console.error("Error in renderDepositList:", error);
    req.flash("error", "Failed to load deposits");
    res.redirect("/admin/dashboard");
  }
};

/**
 * Render deposit details page
 */
exports.renderDepositDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const deposit = await adminTransactionService.getDepositById(id);

    if (!deposit) {
      req.flash("error", "Deposit not found");
      return res.redirect("/admin/deposits");
    }

    res.render("adminViews/deposit_details", {
      pageTitle: "Deposit Details",
      deposit,
      user: req.user,
    });
  } catch (error) {
    console.error("Error in renderDepositDetails:", error);
    req.flash("error", "Failed to load deposit details");
    res.redirect("/admin/deposits");
  }
};

/**
 * Approve a deposit
 */
exports.approveDeposit = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await adminTransactionService.approveDeposit(id);

    if (result) {
      req.flash("success", "Deposit approved successfully");
    } else {
      req.flash("error", "Failed to approve deposit");
    }

    res.redirect(`/admin/deposits/${id}`);
  } catch (error) {
    console.error("Error in approveDeposit:", error);
    req.flash("error", error.message || "Failed to approve deposit");
    res.redirect(`/admin/deposits/${req.params.id}`);
  }
};

/**
 * Cancel a deposit
 */
exports.cancelDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await adminTransactionService.cancelDeposit(id, reason);

    if (result) {
      req.flash("success", "Deposit cancelled successfully");
    } else {
      req.flash("error", "Failed to cancel deposit");
    }

    res.redirect(`/admin/deposits/${id}`);
  } catch (error) {
    console.error("Error in cancelDeposit:", error);
    req.flash("error", error.message || "Failed to cancel deposit");
    res.redirect(`/admin/deposits/${req.params.id}`);
  }
};

/**
 * Render withdrawal list page
 */
exports.renderWithdrawalList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "";
    const type = req.query.type || "";
    const currency = req.query.currency || "";
    const search = req.query.search || "";
    const sortOrder = req.query.sort || "desc";
    const startDate = req.query.startDate || "";
    const endDate = req.query.endDate || "";

    const [result, currencies] = await Promise.all([
      adminTransactionService.getWithdrawals({
        page,
        limit,
        status,
        type,
        currency,
        search,
        sortOrder,
        startDate,
        endDate,
      }),
      currencyService.getAllCurrencies(),
    ]);

    res.render("adminViews/withdrawal_list", {
      pageTitle: "Withdrawal Management",
      withdrawals: result.withdrawals,
      pagination: result.pagination,
      currencies,
      filters: {
        status,
        type,
        currency,
        search,
        sortOrder,
        startDate,
        endDate,
      },
      user: req.user,
    });
  } catch (error) {
    console.error("Error in renderWithdrawalList:", error);
    req.flash("error", "Failed to load withdrawals");
    res.redirect("/admin/dashboard");
  }
};

/**
 * Render withdrawal details page
 */
exports.renderWithdrawalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const withdrawal = await adminTransactionService.getWithdrawalById(id);

    if (!withdrawal) {
      req.flash("error", "Withdrawal not found");
      return res.redirect("/admin/withdrawals");
    }

    res.render("adminViews/withdrawal_details", {
      pageTitle: "Withdrawal Details",
      withdrawal,
      user: req.user,
    });
  } catch (error) {
    console.error("Error in renderWithdrawalDetails:", error);
    req.flash("error", "Failed to load withdrawal details");
    res.redirect("/admin/withdrawals");
  }
};

/**
 * Approve a withdrawal
 */
exports.approveWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { txHash } = req.body;

    if (!txHash || txHash.trim() === "") {
      req.flash("error", "Transaction hash is required");
      return res.redirect(`/admin/withdrawals/${id}`);
    }

    const result = await adminTransactionService.approveWithdrawal(id, txHash);

    if (result.success) {
      req.flash("success", "Withdrawal approved successfully");
      res.redirect(`/admin/withdrawals/${id}`);
    } else {
      req.flash("error", result.message || "Failed to approve withdrawal");
      res.redirect(`/admin/withdrawals/${id}`);
    }
  } catch (error) {
    console.error("Error in approveWithdrawal:", error);
    req.flash("error", error.message || "Failed to approve withdrawal");
    res.redirect(`/admin/withdrawals/${req.params.id}`);
  }
};

/**
 * Cancel a withdrawal
 */
exports.cancelWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim() === "") {
      req.flash("error", "Cancellation reason is required");
      return res.redirect(`/admin/withdrawals/${id}`);
    }

    const result = await adminTransactionService.cancelWithdrawal(id, reason);

    if (result.success) {
      req.flash("success", "Withdrawal cancelled and funds returned to user");
      res.redirect(`/admin/withdrawals/${id}`);
    } else {
      req.flash("error", result.message || "Failed to cancel withdrawal");
      res.redirect(`/admin/withdrawals/${id}`);
    }
  } catch (error) {
    console.error("Error in cancelWithdrawal:", error);
    req.flash("error", error.message || "Failed to cancel withdrawal");
    res.redirect(`/admin/withdrawals/${req.params.id}`);
  }
};
