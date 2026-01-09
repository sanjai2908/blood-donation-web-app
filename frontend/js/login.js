// =============================================
// LOGIN PAGE JAVASCRIPT
// =============================================
// This file handles user login functionality

// API Base URL - Change this to your backend server URL
const API_URL = "http://localhost:5000/api";

// Get form elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// =============================================
// HANDLE LOGIN FORM SUBMISSION
// =============================================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page reload

  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Validation
  if (!email || !password) {
    showAlert("Please fill in all fields", "danger");
    return;
  }

  try {
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Logging in...';

    // Make API request to login endpoint
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Parse response
    const data = await response.json();

    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';

    // Check if login was successful
    if (data.success) {
      // Store user data in localStorage
      localStorage.setItem("userData", JSON.stringify(data.user));

      // Show success message
      showAlert("Login successful! Redirecting...", "success");

      // Redirect based on user role
      setTimeout(() => {
        if (data.user.role === "donor") {
          window.location.href = "donor-dashboard.html";
        } else if (data.user.role === "receiver") {
          window.location.href = "request-blood.html";
        } else if (data.user.role === "admin") {
          window.location.href = "admin-dashboard.html";
        }
      }, 1500);
    } else {
      // Show error message
      showAlert(data.message || "Login failed", "danger");
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("Server error. Please check if backend is running.", "danger");

    // Reset button
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
  }
});

// =============================================
// QUICK LOGIN FUNCTION (FOR TESTING)
// =============================================
function quickLogin(role) {
  if (role === "donor") {
    emailInput.value = "donor@test.com";
    passwordInput.value = "donor123";
  } else if (role === "receiver") {
    emailInput.value = "receiver@test.com";
    passwordInput.value = "receiver123";
  } else if (role === "admin") {
    emailInput.value = "admin@gmail.com";
    passwordInput.value = "admin@123";
  }
}

// =============================================
// FORGOT PASSWORD FUNCTIONALITY
// =============================================
// Simple password reset feature - no backend integration needed for demo
// User enters email and gets message to contact admin

function submitForgotPassword() {
  // Get email from modal input
  const forgotEmail = document.getElementById("forgotEmail").value.trim();

  // Validation: Check if email is empty
  if (!forgotEmail) {
    showForgotAlert(
      '<i class="fas fa-exclamation-circle"></i> Please enter your email address',
      "warning"
    );
    return;
  }

  // Validation: Check if email format is valid
  if (!forgotEmail.includes("@") || !forgotEmail.includes(".")) {
    showForgotAlert(
      '<i class="fas fa-exclamation-circle"></i> Please enter a valid email address',
      "warning"
    );
    return;
  }

  try {
    // Show success message with admin contact info
    showForgotAlert(
      '<i class="fas fa-check-circle"></i> <strong>Request Received!</strong><br>' +
        "Our admin team will contact you at <strong>" +
        forgotEmail +
        "</strong> to help you reset your password.",
      "success"
    );

    // Clear the input field
    document.getElementById("forgotEmail").value = "";

    // Close modal after 3 seconds
    setTimeout(() => {
      const modalElement = document.getElementById("forgotPasswordModal");
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
      // Also hide the alert
      const alertDiv = document.getElementById("forgotAlertMessage");
      alertDiv.classList.add("d-none");
    }, 3000);
  } catch (error) {
    console.error("Forgot password error:", error);
    showForgotAlert(
      '<i class="fas fa-times-circle"></i> An error occurred. Please try again.',
      "danger"
    );
  }
}

// =============================================
// SHOW FORGOT PASSWORD ALERT
// =============================================
// Shows alert message in the forgot password modal
// type: 'success', 'danger', 'warning', 'info'

function showForgotAlert(message, type) {
  const alertDiv = document.getElementById("forgotAlertMessage");
  const alertText = document.getElementById("forgotAlertText");

  // Set alert message and type
  alertText.innerHTML = message;
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (!alertDiv.classList.contains("d-none")) {
      alertDiv.classList.remove("show");
      alertDiv.classList.add("d-none");
    }
  }, 5000);
}

// =============================================
// SHOW ALERT FUNCTION
// =============================================
function showAlert(message, type) {
  const alertDiv = document.getElementById("alertMessage");
  const alertText = document.getElementById("alertText");

  // Set alert message and type
  alertText.textContent = message;
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    alertDiv.classList.remove("show");
    alertDiv.classList.add("d-none");
  }, 5000);
}

// =============================================
// VIVA EXPLANATION:
// =============================================
/*
Q: How does login work?
A: 1. User enters email and password
   2. Form submits data to backend API
   3. Backend checks if user exists and password matches
   4. If valid, backend sends user data
   5. Frontend stores data in localStorage
   6. User is redirected to appropriate dashboard

Q: What is localStorage?
A: Browser storage to save data locally
   - Persists even after page reload
   - Accessible across all pages
   - Used to maintain user session

Q: What is fetch API?
A: Modern JavaScript method to make HTTP requests
   - Sends data to backend
   - Receives response from backend
   - Uses Promises (async/await)

Q: Why async/await?
A: To handle asynchronous operations
   - Wait for API response before proceeding
   - Makes code cleaner and easier to read
   - Better error handling
*/
