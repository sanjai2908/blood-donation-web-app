// =============================================
// REGISTER PAGE JAVASCRIPT
// =============================================
// This file handles user registration functionality

// API Base URL
const API_URL = "http://localhost:5000/api";

// Get form elements
const registerForm = document.getElementById("registerForm");
const roleRadios = document.querySelectorAll('input[name="role"]');
const bloodGroupDiv = document.getElementById("bloodGroupDiv");
const ageDiv = document.getElementById("ageDiv");
const availabilityDiv = document.getElementById("availabilityDiv");

// =============================================
// TOGGLE DONOR-SPECIFIC FIELDS
// =============================================
roleRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    const selectedRole = e.target.value;

    if (selectedRole === "donor") {
      // Show donor-specific fields
      bloodGroupDiv.style.display = "block";
      ageDiv.style.display = "block";
      availabilityDiv.style.display = "block";

      // Make fields required
      document.getElementById("bloodGroup").required = true;
      document.getElementById("age").required = true;
    } else {
      // Hide donor-specific fields
      bloodGroupDiv.style.display = "none";
      ageDiv.style.display = "none";
      availabilityDiv.style.display = "none";

      // Make fields optional
      document.getElementById("bloodGroup").required = false;
      document.getElementById("age").required = false;
    }
  });
});

// =============================================
// HANDLE REGISTRATION FORM SUBMISSION
// =============================================
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent page reload

  // Get form values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const city = document.getElementById("city").value.trim();
  const role = document.querySelector('input[name="role"]:checked').value;

  // Build registration data object
  const registrationData = {
    name,
    email,
    password,
    phone,
    city,
    role,
  };

  // Add donor-specific fields if role is donor
  if (role === "donor") {
    const bloodGroup = document.getElementById("bloodGroup").value;
    const age = document.getElementById("age").value;
    // UPDATED: Get availability from radio button instead of checkbox
    const isAvailable =
      document.querySelector('input[name="availability"]:checked').value ===
      "yes";

    // Validation for donor fields
    if (!bloodGroup || !age) {
      showAlert("Please fill in all donor fields", "danger");
      return;
    }

    registrationData.bloodGroup = bloodGroup;
    registrationData.age = parseInt(age);
    registrationData.isAvailable = isAvailable;
  }

  try {
    // Show loading state
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Registering...';

    // Make API request to register endpoint
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrationData),
    });

    // Parse response
    const data = await response.json();

    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register Now';

    // Check if registration was successful
    if (data.success) {
      // Show success message
      showAlert("Registration successful! Redirecting to login...", "success");

      // Reset form
      registerForm.reset();

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      // Show error message
      showAlert(data.message || "Registration failed", "danger");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showAlert("Server error. Please check if backend is running.", "danger");

    // Reset button
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Register Now';
  }
});

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
Q: Why show/hide donor fields based on role?
A: Better user experience
   - Receivers don't need to provide blood group/age
   - Simplifies form for different user types
   - Conditional validation based on role

Q: What is trim()?
A: Removes whitespace from start and end of string
   - Prevents " John" and "John " being different
   - Cleans user input

Q: Why parseInt() for age?
A: Converts string to integer number
   - Form inputs are always strings
   - Backend expects number data type

Q: What is JSON.stringify()?
A: Converts JavaScript object to JSON string
   - Required for sending data to backend
   - Backend expects JSON format
*/
