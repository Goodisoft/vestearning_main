/**
 * ExNestrade KYC API Client
 * Functionality for KYC-related API requests
 */

/**
 * Get all KYC applications with pagination
 * @param {Object} options - Options for filtering and pagination
 * @param {number} options.page - Page number (starting from 1)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Optional search term
 * @param {string} options.status - Optional status filter (pending/approved/rejected)
 * @returns {Promise<Object>} Paginated KYC data
 */
async function getKycApplications({
  page = 1,
  limit = 10,
  search = "",
  status = "",
}) {
  let url = `/api/admin/kyc/applications?page=${page}&limit=${limit}`;

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  if (status) {
    url += `&status=${encodeURIComponent(status)}`;
  }

  return apiGet(url);
}

/**
 * Get users with KYC status with pagination
 * @param {Object} options - Options for filtering and pagination
 * @param {number} options.page - Page number (starting from 1)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.search - Optional search term
 * @param {string} options.kycStatus - Optional KYC status filter
 * @returns {Promise<Object>} Paginated user data with KYC status
 */
async function getUsersWithKycStatus({
  page = 1,
  limit = 10,
  search = "",
  kycStatus = "",
}) {
  let url = `/api/admin/kyc/applications?view=users&page=${page}&limit=${limit}`;

  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }

  if (kycStatus) {
    url += `&kycStatus=${encodeURIComponent(kycStatus)}`;
  }

  return apiGet(url);
}

/**
 * Get KYC application details
 * @param {string} kycId - KYC application ID
 * @returns {Promise<Object>} KYC application details
 */
async function getKycDetails(kycId) {
  return apiGet(`/api/admin/kyc/applications/${kycId}`);
}

/**
 * Update KYC application status
 * @param {string} kycId - KYC application ID
 * @param {string} status - New status (approved/rejected)
 * @param {string} comment - Optional comment for rejection
 * @returns {Promise<Object>} Updated KYC application
 */
async function updateKycStatus(kycId, status, comment = "") {
  return apiPut(`/api/admin/kyc/applications/${kycId}/status`, {
    status,
    comment,
  });
}

/**
 * Search KYC applications
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching KYC applications
 */
async function searchKycApplications(query) {
  return apiGet(`/api/admin/kyc/search?q=${encodeURIComponent(query)}`);
}

/**
 * Get KYC settings
 * @returns {Promise<Object>} KYC settings
 */
async function getKycSettings() {
  return apiGet("/api/admin/kyc/settings");
}

/**
 * Update KYC settings
 * @param {Object} settings - New KYC settings
 * @returns {Promise<Object>} Updated KYC settings
 */
async function updateKycSettings(settings) {
  console.log("Updating KYC settings:", settings);
  
  return apiPut("/admin/kyc/settings", settings);
}
