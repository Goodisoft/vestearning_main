/**
 * ExNestrade Authentication API Client
 * Handles all auth-related API operations including login, registration, and password resets
 */

/**
 * Handle user login form submission
 * @param {Event} event - Form submission event
 */
async function handleLoginSubmit(event) {
  event.preventDefault();

  const loginButton = document.getElementById("loginButton");
  const loginSpinner = document.getElementById("loginSpinner");
  const loginError = document.getElementById("loginError");

  // Show loading state
  loginButton.disabled = true;
  loginSpinner.classList.remove("d-none");
  loginError.style.display = "none";

  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await apiPost("/auth/login", { email, password });

    if (response.success) {
      showToast("Login successful! Redirecting...", "success");

      // Redirect based on user role
      if (response.user && response.user.role === "admin") {
        window.location.href = response.redirectURL;
      } else {
        window.location.href = response.redirectURL;
      }
    }
  } catch (error) {
    showToast(
      "Email verified successfully. You can now log in.",
      "success"
    );
    // Show error message
    loginError.textContent = error.message;
    loginError.style.display = "block";
  } finally {
    // Hide loading state
    loginButton.disabled = false;
    loginSpinner.classList.add("d-none");
  }
}

/**
 * Handle user registration form submission
 * @param {Event} event - Form submission event
 */
async function handleRegistrationSubmit(event) {
  event.preventDefault();

  const registerButton = document.getElementById("registerButton");
  const registerSpinner = document.getElementById("registerSpinner");
  const registrationError = document.getElementById("registrationError");

  // Show loading state
  registerButton.disabled = true;
  registerSpinner.classList.remove("d-none");
  registrationError.style.display = "none";

  // Check terms and conditions
  if (!document.getElementById("terms").checked) {
    showToast(
      "Please agree to the Terms & Conditions",
      "danger"
    );
    return;
  }

  try {
    const formData = {
      fullName: document.getElementById("fullName").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
      country: document.getElementById("country").value,
      referralCode: document.getElementById("referralCode").value || undefined,
    };

    const response = await apiPost("/auth/register", formData);

    if (response.success) {
      // Display success message
      const registrationForm = document.getElementById("registrationForm");
      registrationForm.reset();

      // Replace form with success message
      const formContainer = registrationForm.parentElement;
      formContainer.innerHTML = `
        <div class="Container text-center">
          <h3>Registration Successful!</h3>
          <div class="alert alert-success text-center mt-4 p-3">
            ${
              response.message ||
              "Please check your email to verify your account."
            }
          </div>
          <div class="mt-3">
            <div class="mt-3 text-center">
                  <a href="/auth/login" class="btn btn--base">Go to Login</a>
              </div> 
              <div class="mt-3 text-center">
                  <a href="/auth/resend-link?email=${formData.email}" class="base--color fw-bold">Resend email verification</a>
              </div>
          </div>
        </div>

      `;
    }
  } catch (error) {
    showToast(
      error.message,
      "error"
    );
    // Show error message
    registrationError.textContent = error.message;
    registrationError.style.display = "block";
  } finally {
    // Hide loading state
    registerButton.disabled = false;
    registerSpinner.classList.add("d-none");
  }
}

/**
 * Handle password reset request form submission
 * @param {Event} event - Form submission event
 */
async function handleForgotPasswordSubmit(event) {
  event.preventDefault();

  const resetButton = document.getElementById("resetButton");
  const resetSpinner = document.getElementById("resetSpinner");
  const resetError = document.getElementById("resetError");

  // Show loading state
  resetButton.disabled = true;
  resetSpinner.classList.remove("d-none");
  resetError.style.display = "none";

  try {
    const email = document.getElementById("email").value;

    const response = await apiPost("/auth/forgot-password", { email });

    if (response.success) {
      // Display success message
      const forgotPasswordForm = document.getElementById("forgotPasswordForm");
      forgotPasswordForm.reset();

      // Replace form with success message
      const formContainer = forgotPasswordForm.parentElement;
      formContainer.innerHTML = `
          <div class="alert alert-success text-center">
              <h4>Password Reset Link Sent!</h4>
              <p>${
                response.message ||
                "Please check your email for password reset instructions."
              }</p>
              <p class="mt-3">
                  <a href="/auth/login" class="btn btn--base">Back to Login</a>
              </p>
          </div>
      `;
    }
  } catch (error) {
    // Show error message
    resetError.textContent = error.message;
    resetError.style.display = "block";
  } finally {
    // Hide loading state
    resetButton.disabled = false;
    resetSpinner.classList.add("d-none");
  }
}

/**
 * Initialize auth page functionality based on current page
 */
function initAuthPages() {
  document.addEventListener("DOMContentLoaded", () => {
    // Login form handling
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", handleLoginSubmit);

      // Check for query parameters
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("verified") === "true") {
        showToast(
          "Email verified successfully. You can now log in.",
          "success"
        );
      }
      if (urlParams.get("reset") === "true") {
        showToast(
          "Password reset successfully. You can now log in with your new password.",
          "success"
        );
      }
    }

    // Registration form handling
    const registrationForm = document.getElementById("registrationForm");
    if (registrationForm) {
      registrationForm.addEventListener("submit", handleRegistrationSubmit);
    }

    // Forgot password form handling
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    if (forgotPasswordForm) {
      forgotPasswordForm.addEventListener("submit", handleForgotPasswordSubmit);
    }
  });
}
