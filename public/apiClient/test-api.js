/**
 * API Test Script
 *
 * This script tests basic connectivity to the admin user API endpoints
 * It helps diagnose the "Failed to fetch" error
 */

// Test admin users API endpoint (this will run when the page loads)
async function testAdminUserAPI() {
  console.log("=== ADMIN API TEST ===");
  console.log("Testing admin user API connectivity...");

  try {
    // First, try a simple fetch with no authentication to check if the endpoint exists
    console.log("Raw fetch test to /admin/users/api...");
    const rawResponse = await fetch("/admin/users/api", {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
      },
    });

    console.log("Raw response status:", rawResponse.status);

    if (!rawResponse.ok) {
      const errorText = await rawResponse.text();
      console.log("Error response:", errorText);

      // Test session status if we get 401/403
      if (rawResponse.status === 401 || rawResponse.status === 403) {
        console.log(
          "Authentication issue detected. Checking session status..."
        );

        try {
          const sessionResponse = await fetch("/auth/session-status", {
            credentials: "same-origin",
          });
          const sessionData = await sessionResponse.json();
          console.log("Session status:", sessionData);
        } catch (sessionError) {
          console.log("Could not check session:", sessionError);
        }
      }
    } else {
      // Try to parse response as JSON
      try {
        const data = await rawResponse.json();
        console.log("API response data:", data);
        document.getElementById("test-result").innerHTML =
          '<div class="alert alert-success">API test successful! Check browser console for details.</div>';
      } catch (parseError) {
        console.log("Error parsing JSON response:", parseError);
        document.getElementById("test-result").innerHTML =
          '<div class="alert alert-warning">API responded but sent invalid JSON. Check browser console.</div>';
      }
    }
  } catch (error) {
    console.error("Fetch error:", error);
    document.getElementById("test-result").innerHTML =
      '<div class="alert alert-danger">API test failed: ' +
      error.message +
      "</div>";

    // Check if it's a CORS issue
    if (
      error.message.includes("CORS") ||
      error.message.includes("cross-origin")
    ) {
      console.log(
        "CORS issue detected. Make sure your server allows cross-origin requests."
      );
    }

    // Check if it's a network issue
    if (!navigator.onLine) {
      console.log("Browser is offline. Check network connection.");
    }
  }
}

// Make all fetch errors more informative
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  console.log(`Fetch request to: ${url}`, options);
  return originalFetch(url, options).catch((error) => {
    console.error(`Enhanced fetch error for ${url}:`, error);
    throw error;
  });
};

// Run the test when the document is loaded
document.addEventListener("DOMContentLoaded", testAdminUserAPI);

// Expose test function globally so it can be run from console
window.testAdminUserAPI = testAdminUserAPI;
