/**
 * Admin Page Manager Client
 * Handles API requests for managing website content sections
 */

// Generic API request handler
async function apiRequest(url, method = "GET", data = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "API request failed");
    }

    return result;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// Hero Section API methods
async function getHeroSection() {
  return apiRequest("/admin/pages/api/pages/hero-section");
}

async function updateHeroSection(data) {
  return apiRequest("/admin/pages/api/pages/hero-section", "PUT", data);
}

// About Section API methods
async function getAboutSection() {
  return apiRequest("/admin/pages/api/pages/about-section");
}

async function updateAboutSection(data) {
  return apiRequest("/admin/pages/api/pages/about-section", "PUT", data);
}

// Why Choose Us API methods
async function getWhyChooseUs() {
  return apiRequest("/admin/pages/api/pages/why-choose-us");
}

async function addWhyChooseUs(data) {
  return apiRequest("/admin/pages/api/pages/why-choose-us", "POST", data);
}

async function updateWhyChooseUs(id, data) {
  return apiRequest(`/admin/pages/api/pages/why-choose-us/${id}`, "PUT", data);
}

async function deleteWhyChooseUs(id) {
  return apiRequest(`/admin/pages/api/pages/why-choose-us/${id}`, "DELETE");
}

// Testimonials API methods
async function getTestimonials() {
  return apiRequest("/admin/pages/api/pages/testimonials");
}

async function addTestimonial(data) {
  return apiRequest("/admin/pages/api/pages/testimonials", "POST", data);
}

async function updateTestimonial(id, data) {
  return apiRequest(`/admin/pages/api/pages/testimonials/${id}`, "PUT", data);
}

async function deleteTestimonial(id) {
  return apiRequest(`/admin/pages/api/pages/testimonials/${id}`, "DELETE");
}

// FAQs API methods
async function getFAQs() {
  return apiRequest("/admin/pages/api/pages/faqs");
}

async function addFAQ(data) {
  return apiRequest("/admin/pages/api/pages/faqs", "POST", data);
}

async function updateFAQ(id, data) {
  return apiRequest(`/admin/pages/api/pages/faqs/${id}`, "PUT", data);
}

async function deleteFAQ(id) {
  return apiRequest(`/admin/pages/api/pages/faqs/${id}`, "DELETE");
}

// Crypto Tips API methods
async function getCryptoTips() {
  return apiRequest("/admin/pages/api/pages/crypto-tips");
}

async function addCryptoTip(data) {
  return apiRequest("/admin/pages/api/pages/crypto-tips", "POST", data);
}

async function updateCryptoTip(id, data) {
  return apiRequest(`/admin/pages/api/pages/crypto-tips/${id}`, "PUT", data);
}

async function deleteCryptoTip(id) {
  return apiRequest(`/admin/pages/api/pages/crypto-tips/${id}`, "DELETE");
}

// Top Investors API methods
async function getTopInvestors() {
  return apiRequest("/admin/pages/api/pages/top-investors");
}

async function addTopInvestor(data) {
  return apiRequest("/admin/pages/api/pages/top-investors", "POST", data);
}

async function updateTopInvestor(id, data) {
  return apiRequest(`/admin/pages/api/pages/top-investors/${id}`, "PUT", data);
}

async function deleteTopInvestor(id) {
  return apiRequest(`/admin/pages/api/pages/top-investors/${id}`, "DELETE");
}

// Initialize page manager functionality
function initPageManager() {
  // Check if the page is already loaded
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    initializePageContent();
  } else {
    document.addEventListener("DOMContentLoaded", initializePageContent);
  }
}

// Helper function to initialize all content sections
function initializePageContent() {
  // Get the active tab from URL or default to hero-section
  const urlParams = new URLSearchParams(window.location.search);
  console.log("URL parameters:", urlParams.toString());

  const activeTab = urlParams.get("tab") || "hero-section";

  // Activate the corresponding tab
  activateTab(activeTab);

  // Setup tab navigation
  setupTabNavigation();

  // Initialize form handlers for each section
  initHeroSectionForm();
  initAboutSectionForm();
  initWhyChooseUsForm();
  initTestimonialsSection();
  initFAQsSection();
  initCryptoTipsSection();
  initTopInvestorsSection();

  console.log("All page manager sections initialized");
}

// Function to activate a specific tab
function activateTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    pane.classList.remove("active", "show");
  });

  // Deactivate all tab buttons
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Activate the selected tab
  const selectedPane = document.getElementById(tabId);

  const selectedTab = document.querySelector(`.nav-link[href="#${tabId}"]`);

  if (selectedPane && selectedTab) {
    selectedPane.classList.add("active", "show");
    selectedTab.classList.add("active");
  }
}

// Setup tab navigation
function setupTabNavigation() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const tabId = this.getAttribute("href").substring(1);
      console.log("Tab clicked:", tabId);

      activateTab(tabId);

      // Update URL with the active tab
      const url = new URL(window.location);
      url.searchParams.set("tab", tabId);
      window.history.pushState({}, "", url);
    });
  });
}

/**
 * Show a notification toast
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, type = "info", duration = 3000) {
  // Check if iziToast is available
  if (typeof iziToast !== "undefined") {
    iziToast[type]({
      message: message,
      position: "topRight",
      timeout: duration,
    });
    return;
  }

  // Fallback notification
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<div class="toast-message">${message}</div>`;

  const toastContainer =
    document.querySelector(".toast-container") || document.body;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Helper to decode HTML entities like &lt; and &gt;
function decodeHTML(html) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
}

// Initialize Hero Section form
function initHeroSectionForm() {
  const form = document.getElementById("hero-section-form");
  console.log("Initializing Hero Section form", form);

  if (!form) return;

  // Load existing data
  getHeroSection()
    .then((response) => {

      if (response.success && response.data) {
        const data = response.data;
        form.elements["title"].value = data.title || "";
        form.elements["subtitle"].value = data.subtitle || "";
      }
    })
    .catch((error) => {
      console.error("Error loading hero section:", error);
      showToast("Failed to load hero section data", "error");
    });

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      title: form.elements["title"].value,
      subtitle: form.elements["subtitle"].value,
    };

    try {
      const response = await updateHeroSection(data);
      if (response.success) {
        showToast("Hero section updated successfully");
      } else {
        showToast(response.message || "Failed to update hero section", "error");
      }
    } catch (error) {
      console.error("Error updating hero section:", error);
      showToast("Failed to update hero section", "error");
    }
  });
}

// Initialize About Section form
function initAboutSectionForm() {
  const form = document.getElementById("about-section-form");
  if (!form) return;

  // Load existing data
  getAboutSection()
  .then((response) => {
    if (response.success && response.data) {
      const data = response.data;
      form.elements["title"].value = data.title || "";

      const decodedDescription = decodeHTML(data.description || "");

      // If CKEditor is initialized, set content via the editor
      if (window.descriptionEditor) {
        window.descriptionEditor.setData(decodedDescription);
      } else {
        // Fallback to regular textarea
        form.elements["description"].value = decodedDescription;
      }

      // Update preview
      document.getElementById("about-title-preview").textContent =
        data.title || "";
      document.getElementById("about-description-preview").innerHTML =
        decodedDescription;
    }
  })
  .catch((error) => {
    console.error("Error loading about section:", error);
    showToast("Failed to load about section data", "error");
  });

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get title from form
    const title = form.elements["title"].value;

    // Get description from CKEditor if available, otherwise from form
    let description;
    if (window.descriptionEditor) {
      description = window.descriptionEditor.getData();
    } else {
      description = form.elements["description"].value;
    }

    const data = {
      title,
      description,
    };

    try {
      const response = await updateAboutSection(data);
      if (response.success) {
        showToast("About section updated successfully");

        // Update preview after successful update
        document.getElementById("about-title-preview").textContent = title;
        document.getElementById("about-description-preview").innerHTML =
          description;
      } else {
        showToast(
          response.message || "Failed to update about section",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating about section:", error);
      showToast("Failed to update about section", "error");
    }
  });
}

// Initialize Why Choose Us form
function initWhyChooseUsForm() {
  const container = document.getElementById("why-choose-us-container");
  const form = document.getElementById("why-choose-us-form");
  if (!container || !form) return;

  let currentItemId = null;

  // Load existing why choose us items
  function loadWhyChooseUsItems() {
    getWhyChooseUs()
      .then((response) => {
        if (response.success && response.data) {
          renderWhyChooseUsItems(response.data);
        }
      })
      .catch((error) => {
        console.error("Error loading why choose us items:", error);
        showToast("Failed to load why choose us data", "error");
      });
  }

  // Render why choose us items
  function renderWhyChooseUsItems(items) {
    container.innerHTML = "";

    if (items.length === 0) {
      container.innerHTML =
        '<div class="alert alert-info">No "Why Choose Us" items found. Add your first item.</div>';
      return;
    }

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          <p class="card-text">${item.description}</p>
          <p class="card-text"><small class="text-muted">Created: ${new Date(
            item.createdAt
          ).toLocaleDateString()}</small></p>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${
              item._id
            }">Edit</button>
            <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${
              item._id
            }">Delete</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        editWhyChooseUsItem(
          id,
          items.find((item) => item._id === id)
        );
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        if (
          confirm("Are you sure you want to delete this 'Why Choose Us' item?")
        ) {
          deleteWhyChooseUsItemHandler(id);
        }
      });
    });
  }

  // Edit why choose us item
  function editWhyChooseUsItem(id, item) {
    currentItemId = id;
    form.elements["title"].value = item.title;
    form.elements["description"].value = item.description;

    // Change submit button text to indicate edit mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Update Why Choose Us Item";

    // Add cancel button if it doesn't exist
    if (!document.getElementById("cancel-edit-btn")) {
      const cancelBtn = document.createElement("button");
      cancelBtn.id = "cancel-edit-btn";
      cancelBtn.className = "btn btn-secondary ms-2";
      cancelBtn.textContent = "Cancel";
      cancelBtn.type = "button";
      submitBtn.parentNode.appendChild(cancelBtn);

      cancelBtn.addEventListener("click", resetWhyChooseUsForm);
    }
  }

  // Delete why choose us item handler
  async function deleteWhyChooseUsItemHandler(id) {
    try {
      const response = await deleteWhyChooseUs(id);
      if (response.success) {
        showToast("Why Choose Us item deleted successfully");
        loadWhyChooseUsItems();
      } else {
        showToast(
          response.message || "Failed to delete Why Choose Us item",
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting Why Choose Us item:", error);
      showToast("Failed to delete Why Choose Us item", "error");
    }
  }

  // Reset why choose us form
  function resetWhyChooseUsForm() {
    currentItemId = null;
    form.reset();

    // Change submit button text back to add mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Add Why Choose Us Item";

    // Remove cancel button if it exists
    const cancelBtn = document.getElementById("cancel-edit-btn");
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      title: form.elements["title"].value,
      description: form.elements["description"].value,
    };

    try {
      let response;

      if (currentItemId) {
        // Update existing why choose us item
        response = await updateWhyChooseUs(currentItemId, data);
        if (response.success) {
          showToast("Why Choose Us item updated successfully");
          resetWhyChooseUsForm();
          loadWhyChooseUsItems();
        }
      } else {
        // Add new why choose us item
        response = await addWhyChooseUs(data);
        if (response.success) {
          showToast("Why Choose Us item added successfully");
          form.reset();
          loadWhyChooseUsItems();
        }
      }
    } catch (error) {
      console.error("Error saving Why Choose Us item:", error);
      showToast("Failed to save Why Choose Us item", "error");
    }
  });

  // Load items on init
  loadWhyChooseUsItems();
}

// Initialize Testimonials Section
function initTestimonialsSection() {
  const container = document.getElementById("testimonials-container");
  const form = document.getElementById("testimonial-form");
  if (!container || !form) return;

  let currentTestimonialId = null;

  // Load existing testimonials
  function loadTestimonials() {
    getTestimonials()
      .then((response) => {
        if (response.success && response.data) {
          renderTestimonials(response.data);
        }
      })
      .catch((error) => {
        console.error("Error loading testimonials:", error);
        showToast("Failed to load testimonials", "error");
      });
  }

  // Render testimonials list
  function renderTestimonials(testimonials) {
    container.innerHTML = "";

    if (testimonials.length === 0) {
      container.innerHTML =
        '<div class="alert alert-info">No testimonials found. Add your first testimonial.</div>';
      return;
    }

    testimonials.forEach((testimonial) => {
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${testimonial.name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${testimonial.country}</h6>
          <p class="card-text">${testimonial.message}</p>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${testimonial._id}">Edit</button>
            <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${testimonial._id}">Delete</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        editTestimonial(
          id,
          testimonials.find((t) => t._id === id)
        );
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this testimonial?")) {
          deleteTestimonialHandler(id);
        }
      });
    });
  }

  // Edit testimonial
  function editTestimonial(id, testimonial) {
    currentTestimonialId = id;
    form.elements["name"].value = testimonial.name;
    form.elements["country"].value = testimonial.country;
    form.elements["message"].value = testimonial.message;

    // Change submit button text to indicate edit mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Update Testimonial";

    // Add cancel button if it doesn't exist
    if (!document.getElementById("cancel-edit-btn")) {
      const cancelBtn = document.createElement("button");
      cancelBtn.id = "cancel-edit-btn";
      cancelBtn.className = "btn btn-secondary ms-2";
      cancelBtn.textContent = "Cancel";
      cancelBtn.type = "button";
      submitBtn.parentNode.appendChild(cancelBtn);

      cancelBtn.addEventListener("click", resetTestimonialForm);
    }
  }

  // Delete testimonial handler
  async function deleteTestimonialHandler(id) {
    try {
      const response = await deleteTestimonial(id);
      if (response.success) {
        showToast("Testimonial deleted successfully");
        loadTestimonials();
      } else {
        showToast(response.message || "Failed to delete testimonial", "error");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      showToast("Failed to delete testimonial", "error");
    }
  }

  // Reset testimonial form
  function resetTestimonialForm() {
    currentTestimonialId = null;
    form.reset();

    // Change submit button text back to add mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Add Testimonial";

    // Remove cancel button if it exists
    const cancelBtn = document.getElementById("cancel-edit-btn");
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: form.elements["name"].value,
      country: form.elements["country"].value,
      message: form.elements["message"].value,
    };

    try {
      let response;

      if (currentTestimonialId) {
        // Update existing testimonial
        response = await updateTestimonial(currentTestimonialId, data);
        if (response.success) {
          showToast("Testimonial updated successfully");
          resetTestimonialForm();
          loadTestimonials();
        }
      } else {
        // Add new testimonial
        response = await addTestimonial(data);
        if (response.success) {
          showToast("Testimonial added successfully");
          form.reset();
          loadTestimonials();
        }
      }
    } catch (error) {
      console.error("Error saving testimonial:", error);
      showToast("Failed to save testimonial", "error");
    }
  });

  // Load testimonials on init
  loadTestimonials();
}

// Initialize FAQs Section
function initFAQsSection() {
  const container = document.getElementById("faqs-container");
  const form = document.getElementById("faq-form");
  if (!container || !form) return;

  let currentFaqId = null;

  // Load existing FAQs
  function loadFAQs() {
    getFAQs()
      .then((response) => {
        if (response.success && response.data) {
          renderFAQs(response.data);
        }
      })
      .catch((error) => {
        console.error("Error loading FAQs:", error);
        showToast("Failed to load FAQs", "error");
      });
  }

  // Render FAQs list
  function renderFAQs(faqs) {
    container.innerHTML = "";

    if (faqs.length === 0) {
      container.innerHTML =
        '<div class="alert alert-info">No FAQs found. Add your first FAQ.</div>';
      return;
    }

    const accordion = document.createElement("div");
    accordion.className = "accordion";
    accordion.id = "faqsAccordion";

    faqs.forEach((faq, index) => {
      const accordionItem = document.createElement("div");
      accordionItem.className = "accordion-item";
      accordionItem.innerHTML = `
        <h2 class="accordion-header" id="heading${index}">
          <button class="accordion-button ${
            index > 0 ? "collapsed" : ""
          }" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="${
        index === 0
      }" aria-controls="collapse${index}">
            ${faq.question}
          </button>
        </h2>
        <div id="collapse${index}" class="accordion-collapse collapse ${
        index === 0 ? "show" : ""
      }" aria-labelledby="heading${index}" data-bs-parent="#faqsAccordion">
          <div class="accordion-body">
            <p>${faq.answer}</p>
            <div class="btn-group" role="group">
              <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${
                faq._id
              }">Edit</button>
              <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${
                faq._id
              }">Delete</button>
            </div>
          </div>
        </div>
      `;
      accordion.appendChild(accordionItem);
    });

    container.appendChild(accordion);

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        editFAQ(
          id,
          faqs.find((f) => f._id === id)
        );
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this FAQ?")) {
          deleteFAQHandler(id);
        }
      });
    });
  }

  // Edit FAQ
  function editFAQ(id, faq) {
    currentFaqId = id;
    form.elements["question"].value = faq.question;
    form.elements["answer"].value = faq.answer;

    // Change submit button text to indicate edit mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Update FAQ";

    // Add cancel button if it doesn't exist
    if (!document.getElementById("cancel-edit-btn")) {
      const cancelBtn = document.createElement("button");
      cancelBtn.id = "cancel-edit-btn";
      cancelBtn.className = "btn btn-secondary ms-2";
      cancelBtn.textContent = "Cancel";
      cancelBtn.type = "button";
      submitBtn.parentNode.appendChild(cancelBtn);

      cancelBtn.addEventListener("click", resetFAQForm);
    }
  }

  // Delete FAQ handler
  async function deleteFAQHandler(id) {
    try {
      const response = await deleteFAQ(id);
      if (response.success) {
        showToast("FAQ deleted successfully");
        loadFAQs();
      } else {
        showToast(response.message || "Failed to delete FAQ", "error");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      showToast("Failed to delete FAQ", "error");
    }
  }

  // Reset FAQ form
  function resetFAQForm() {
    currentFaqId = null;
    form.reset();

    // Change submit button text back to add mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Add FAQ";

    // Remove cancel button if it exists
    const cancelBtn = document.getElementById("cancel-edit-btn");
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      question: form.elements["question"].value,
      answer: form.elements["answer"].value,
    };

    try {
      let response;

      if (currentFaqId) {
        // Update existing FAQ
        response = await updateFAQ(currentFaqId, data);
        if (response.success) {
          showToast("FAQ updated successfully");
          resetFAQForm();
          loadFAQs();
        }
      } else {
        // Add new FAQ
        response = await addFAQ(data);
        if (response.success) {
          showToast("FAQ added successfully");
          form.reset();
          loadFAQs();
        }
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      showToast("Failed to save FAQ", "error");
    }
  });

  // Load FAQs on init
  loadFAQs();
}

// Initialize Crypto Tips Section
function initCryptoTipsSection() {
  const container = document.getElementById("crypto-tips-container");
  const form = document.getElementById("crypto-tip-form");
  if (!container || !form) return;

  let currentTipId = null;

  // Load existing crypto tips
  function loadCryptoTips() {
    getCryptoTips()
      .then((response) => {
        if (response.success && response.data) {
          renderCryptoTips(response.data);
        }
      })
      .catch((error) => {
        console.error("Error loading crypto tips:", error);
        showToast("Failed to load crypto tips", "error");
      });
  }

  // Render crypto tips list
  function renderCryptoTips(tips) {
    container.innerHTML = "";

    if (tips.length === 0) {
      container.innerHTML =
        '<div class="alert alert-info">No crypto tips found. Add your first tip.</div>';
      return;
    }

    tips.forEach((tip) => {
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${tip.title}</h5>
          <p class="card-text">${tip.content}</p>
          <p class="card-text"><small class="text-muted">Created: ${new Date(
            tip.createdAt
          ).toLocaleDateString()}</small></p>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${
              tip._id
            }">Edit</button>
            <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${
              tip._id
            }">Delete</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        editCryptoTip(
          id,
          tips.find((t) => t._id === id)
        );
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this crypto tip?")) {
          deleteCryptoTipHandler(id);
        }
      });
    });
  }

  // Edit crypto tip
  function editCryptoTip(id, tip) {
    currentTipId = id;
    form.elements["title"].value = tip.title;
    form.elements["content"].value = tip.content;

    // Change submit button text to indicate edit mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Update Crypto Tip";

    // Add cancel button if it doesn't exist
    if (!document.getElementById("cancel-edit-btn")) {
      const cancelBtn = document.createElement("button");
      cancelBtn.id = "cancel-edit-btn";
      cancelBtn.className = "btn btn-secondary ms-2";
      cancelBtn.textContent = "Cancel";
      cancelBtn.type = "button";
      submitBtn.parentNode.appendChild(cancelBtn);

      cancelBtn.addEventListener("click", resetCryptoTipForm);
    }
  }

  // Delete crypto tip handler
  async function deleteCryptoTipHandler(id) {
    try {
      const response = await deleteCryptoTip(id);
      if (response.success) {
        showToast("Crypto tip deleted successfully");
        loadCryptoTips();
      } else {
        showToast(response.message || "Failed to delete crypto tip", "error");
      }
    } catch (error) {
      console.error("Error deleting crypto tip:", error);
      showToast("Failed to delete crypto tip", "error");
    }
  }

  // Reset crypto tip form
  function resetCryptoTipForm() {
    currentTipId = null;
    form.reset();

    // Change submit button text back to add mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Add Crypto Tip";

    // Remove cancel button if it exists
    const cancelBtn = document.getElementById("cancel-edit-btn");
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      title: form.elements["title"].value,
      content: form.elements["content"].value,
    };

    try {
      let response;

      if (currentTipId) {
        // Update existing crypto tip
        response = await updateCryptoTip(currentTipId, data);
        if (response.success) {
          showToast("Crypto tip updated successfully");
          resetCryptoTipForm();
          loadCryptoTips();
        }
      } else {
        // Add new crypto tip
        response = await addCryptoTip(data);
        if (response.success) {
          showToast("Crypto tip added successfully");
          form.reset();
          loadCryptoTips();
        }
      }
    } catch (error) {
      console.error("Error saving crypto tip:", error);
      showToast("Failed to save crypto tip", "error");
    }
  });

  // Load crypto tips on init
  loadCryptoTips();
}

// Initialize Top Investors Section
function initTopInvestorsSection() {
  const container = document.getElementById("top-investors-container");
  const form = document.getElementById("top-investor-form");
  if (!container || !form) return;

  let currentInvestorId = null;

  // Load existing top investors
  function loadTopInvestors() {
    getTopInvestors()
      .then((response) => {
        if (response.success && response.data) {
          renderTopInvestors(response.data);
        }
      })
      .catch((error) => {
        console.error("Error loading top investors:", error);
        showToast("Failed to load top investors", "error");
      });
  }

  // Render top investors list
  function renderTopInvestors(investors) {
    container.innerHTML = "";

    if (investors.length === 0) {
      container.innerHTML =
        '<div class="alert alert-info">No top investors found. Add your first top investor.</div>';
      return;
    }

    // Create a table to display top investors
    const table = document.createElement("table");
    table.className = "table table-striped";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Name</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    investors.forEach((investor) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${investor.name}</td>
        <td>$${investor.amount.toLocaleString()}</td>
        <td>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm btn-primary edit-btn" data-id="${
              investor._id
            }">Edit</button>
            <button type="button" class="btn btn-sm btn-danger delete-btn" data-id="${
              investor._id
            }">Delete</button>
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });

    container.appendChild(table);

    // Add event listeners for edit and delete buttons
    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        editTopInvestor(
          id,
          investors.find((i) => i._id === id)
        );
      });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this top investor?")) {
          deleteTopInvestorHandler(id);
        }
      });
    });
  }

  // Edit top investor
  function editTopInvestor(id, investor) {
    currentInvestorId = id;
    form.elements["name"].value = investor.name;
    form.elements["amount"].value = investor.amount;

    // Change submit button text to indicate edit mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Update Top Investor";

    // Add cancel button if it doesn't exist
    if (!document.getElementById("cancel-edit-btn")) {
      const cancelBtn = document.createElement("button");
      cancelBtn.id = "cancel-edit-btn";
      cancelBtn.className = "btn btn-secondary ms-2";
      cancelBtn.textContent = "Cancel";
      cancelBtn.type = "button";
      submitBtn.parentNode.appendChild(cancelBtn);

      cancelBtn.addEventListener("click", resetTopInvestorForm);
    }
  }

  // Delete top investor handler
  async function deleteTopInvestorHandler(id) {
    try {
      const response = await deleteTopInvestor(id);
      if (response.success) {
        showToast("Top investor deleted successfully");
        loadTopInvestors();
      } else {
        showToast(response.message || "Failed to delete top investor", "error");
      }
    } catch (error) {
      console.error("Error deleting top investor:", error);
      showToast("Failed to delete top investor", "error");
    }
  }

  // Reset top investor form
  function resetTopInvestorForm() {
    currentInvestorId = null;
    form.reset();

    // Change submit button text back to add mode
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Add Top Investor";

    // Remove cancel button if it exists
    const cancelBtn = document.getElementById("cancel-edit-btn");
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      name: form.elements["name"].value,
      amount: parseFloat(form.elements["amount"].value),
    };

    try {
      let response;

      if (currentInvestorId) {
        // Update existing top investor
        response = await updateTopInvestor(currentInvestorId, data);
        if (response.success) {
          showToast("Top investor updated successfully");
          resetTopInvestorForm();
          loadTopInvestors();
        }
      } else {
        // Add new top investor
        response = await addTopInvestor(data);
        if (response.success) {
          showToast("Top investor added successfully");
          form.reset();
          loadTopInvestors();
        }
      }
    } catch (error) {
      console.error("Error saving top investor:", error);
      showToast("Failed to save top investor", "error");
    }
  });

  // Load top investors on init
  loadTopInvestors();
}

// Export all functions for use in other scripts
window.adminPageManager = {
  // API methods
  getHeroSection,
  updateHeroSection,
  getAboutSection,
  updateAboutSection,
  getWhyChooseUs,
  addWhyChooseUs,
  updateWhyChooseUs,
  deleteWhyChooseUs,
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  getCryptoTips,
  addCryptoTip,
  updateCryptoTip,
  deleteCryptoTip,
  getTopInvestors,
  addTopInvestor,
  updateTopInvestor,
  deleteTopInvestor,

  // UI initialization
  init: initPageManager,
};

// Auto-initialize if script is loaded on the page manager page
if (window.location.pathname.includes("/admin/page-manager")) {
  initPageManager();
}
