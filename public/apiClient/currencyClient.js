/**
 * ExNestrade Currency API Client
 * Handles all currency related API operations including creating, updating, and deleting currencies
 */

/**
 * Get all currencies
 * @param {Object} queryParams - Optional query parameters
 * @returns {Promise<Object>} Response containing currencies data
 */
async function getAllCurrencies(queryParams = {}) {
  try {
    // Convert queryParams object to URL search params
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      params.append(key, value);
    });

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return await apiGet(`/admin/investment/api/currencies${queryString}`);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Get a currency by ID
 * @param {string} currencyId - Currency ID
 * @returns {Promise<Object>} Response containing currency data
 */
async function getCurrencyById(currencyId) {
  try {
    return await apiGet(`/admin/investment/api/currencies/${currencyId}`);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Create a new currency with file upload support
 * @param {FormData} formData - Form data including currency data and files
 * @returns {Promise<Object>} Response containing created currency
 */
async function createCurrency(formData) {
  try {
    const response = await fetch("/admin/investment/api/currencies", {
      method: "POST",
      body: formData, // Send as FormData for file upload
      credentials: "same-origin",
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create currency");
    }

    return data;
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Update an existing currency with file upload support
 * @param {string} currencyId - Currency ID
 * @param {FormData} formData - Form data including updated currency data and files
 * @returns {Promise<Object>} Response containing updated currency
 */
async function updateCurrency(currencyId, formData) {
  try {
    // Add the method to the FormData since browsers don't support PUT with FormData
    formData.append("_method", "PUT");

    const response = await fetch(
      `/admin/investment/api/currencies/${currencyId}`,
      {
        method: "POST", // Use POST with _method override for PUT
        body: formData, // Send as FormData for file upload
        credentials: "same-origin",
      }
    );
    const data = await response.json();
    console.log("Update response:", data);
    
    if (!response.ok) {
      throw new Error(data.message || "Failed to update currency");
    }

    return data;
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Toggle currency active status
 * @param {string} currencyId - Currency ID
 * @returns {Promise<Object>} Response containing updated currency
 */
async function toggleCurrencyStatus(currencyId) {
  try {
    const response = await fetch(
      `/admin/investment/api/currencies/${currencyId}/toggle-status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to toggle currency status");
    }

    return data;
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Delete a currency
 * @param {string} currencyId - Currency ID
 * @returns {Promise<Object>} Response containing deletion status
 */
async function deleteCurrency(currencyId) {
  try {
    return await apiDelete(`/admin/investment/api/currencies/${currencyId}`);
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  }
}

/**
 * Handle currency form submission (create or update)
 * @param {Event} event - Form submission event
 * @param {string} mode - 'create' or 'update'
 */
async function handleCurrencyFormSubmit(event, mode = "create") {
  event.preventDefault();
  // console.log(`Handling ${mode} currency form submission`);

  const form = event.target;
  const formData = new FormData(form);

  try {
    let response;

    if (mode === "create") {
      // Ensure isActive is correctly handled (checkbox may not be in formData if unchecked)
      if (!formData.has("isActive")) {
        formData.append("isActive", "off");
      }
      response = await createCurrency(formData);
    } else if (mode === "update") {
      const currencyId = formData.get("currencyId");

      formData.delete("currencyId"); // Remove currencyId from the data object

      // If no new file was selected, remove the file input from formData
      if (formData.get("qrCode") && formData.get("qrCode").size === 0) {
        formData.delete("qrCode");
      }

      // Ensure isActive is correctly handled (checkbox may not be in formData if unchecked)
      if (!formData.has("isActive")) {
        formData.append("isActive", "off");
      }

      response = await updateCurrency(currencyId, formData);
    }

    if (response.success) {
      showToast(response.message, "success");
      // Reload page to show changes
      setTimeout(() => {
        location.reload();
      }, 1000);
    } else {
      showToast(response.message || "Operation failed", "error");
    }
  } catch (error) {
    console.error("Form submission error:", error);
    showToast(error.message, "error");
  }
}

/**
 * Populate the edit form with currency data
 * @param {string} currencyId - Currency ID
 */
async function populateEditCurrencyForm(currencyId) {
  try {
    const response = await getCurrencyById(currencyId);

    if (response.success && response.data) {
      const currency = response.data;

      // Populate the edit form
      document.getElementById("edit-currency-id").value = currency._id;
      document.getElementById("edit-name").value = currency.name;
      document.getElementById("edit-symbol").value = currency.symbol;
      document.getElementById("edit-network").value = currency.network || "";
      document.getElementById("edit-walletAddress").value =
        currency.walletAddress;
      document.getElementById("edit-isActive").checked = currency.isActive;

      // Handle QR code display if exists
      const currentQrPreview = document.getElementById("current-qr-preview");
      const currentQrImage = document.getElementById("current-qr-image");
      const currentQrPath = document.getElementById("current-qr-path");

      if (currency.qrCode) {
        currentQrImage.src = currency.qrCode;
        currentQrPath.value = currency.qrCode;
        currentQrPreview.style.display = "block";
      } else {
        currentQrPreview.style.display = "none";
      }

      // Show the edit modal
      const editModal = new bootstrap.Modal(
        document.getElementById("editCurrencyModal")
      );
      editModal.show();
    } else {
      showToast("Failed to fetch currency details", "error");
    }
  } catch (error) {
    showToast(error.message, "error");
  }
}

/**
 * Initialize the currency management page
 */
function initCurrencyManagement() {
  document.addEventListener("DOMContentLoaded", () => {
    // Add Currency Form Submission
    const addCurrencyForm = document.getElementById("addCurrencyForm");
    if (addCurrencyForm) {
      addCurrencyForm.addEventListener("submit", (e) =>
        handleCurrencyFormSubmit(e, "create")
      );
    }

    // Edit Currency Form Submission
    const editCurrencyForm = document.getElementById("editCurrencyForm");
    if (editCurrencyForm) {
      editCurrencyForm.addEventListener("submit", (e) =>
        handleCurrencyFormSubmit(e, "update")
      );
    }

    // Edit Button Click
    const editButtons = document.querySelectorAll(".currency-edit-btn");

    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const currencyId = button.getAttribute("data-id");
        populateEditCurrencyForm(currencyId);
      });
    });

    // Toggle Status Button Click
    const toggleButtons = document.querySelectorAll(
      ".currency-toggle-status-btn"
    );
    toggleButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const currencyId = button.getAttribute("data-id");
        try {
          const response = await toggleCurrencyStatus(currencyId);
          if (response.success) {
            showToast(response.message, "success");
            setTimeout(() => {
              location.reload();
            }, 1000);
          } else {
            showToast(
              response.message || "Failed to toggle currency status",
              "error"
            );
          }
        } catch (error) {
          showToast(error.message, "error");
        }
      });
    });

    // Delete Button Click
    const deleteButtons = document.querySelectorAll(".currency-delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const currencyId = button.getAttribute("data-id");
        if (
          confirm(
            "Are you sure you want to delete this currency? This action cannot be undone."
          )
        ) {
          try {
            const response = await deleteCurrency(currencyId);
            if (response.success) {
              showToast(response.message, "success");
              setTimeout(() => {
                location.reload();
              }, 1000);
            } else {
              showToast(
                response.message || "Failed to delete currency",
                "error"
              );
            }
          } catch (error) {
            showToast(error.message, "error");
          }
        }
      });
    });

    // Preview selected QR code image before upload
    const qrCodeInput = document.getElementById("qrCode");
    if (qrCodeInput) {
      qrCodeInput.addEventListener("change", function () {
        previewImage(this);
      });
    }

    const editQrCodeInput = document.getElementById("edit-qrCode");
    if (editQrCodeInput) {
      editQrCodeInput.addEventListener("change", function () {
        previewImage(this);
      });
    }
  });
}

/**
 * Preview an image after selection
 * @param {HTMLInputElement} input - The file input element
 */
function previewImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function (e) {
      // Create or select preview container
      const previewId =
        input.id === "qrCode" ? "qr-preview" : "edit-qr-preview";
      let previewContainer = document.getElementById(previewId);

      if (!previewContainer) {
        previewContainer = document.createElement("div");
        previewContainer.id = previewId;
        previewContainer.className = "mt-2";
        previewContainer.style.maxWidth = "150px";
        input.parentNode.parentNode.appendChild(previewContainer);
      }

      // Show preview image
      previewContainer.innerHTML = `
        <label class="form-label">Selected Image:</label>
        <img src="${e.target.result}" class="img-fluid" alt="Selected QR Code">
      `;
    };

    reader.readAsDataURL(input.files[0]);
  }
}

// Initialize the page when the script loads
initCurrencyManagement();
