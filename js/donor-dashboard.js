// =============================================
// DONOR DASHBOARD JAVASCRIPT
// =============================================
// This file handles donor dashboard functionality

// API Base URL
const API_URL = "https://blood-donation-web-app-8k1y.onrender.com/api";
console.log("Using backend API:", API_URL);

// =============================================
// CHECK IF USER IS LOGGED IN
// =============================================
function checkAuth() {
  const userData = localStorage.getItem("userData");

  if (!userData) {
    // No user data found - redirect to login
    window.location.href = "login.html";
    return null;
  }

  const user = JSON.parse(userData);

  // Check if user is a donor
  if (user.role !== "donor") {
    alert("Access denied. Only donors can access this page.");
    window.location.href = "login.html";
    return null;
  }

  return user;
}

// =============================================
// LOAD DONOR PROFILE DATA
// =============================================
function loadProfile() {
  const user = checkAuth();

  if (!user) return;

  // Update page with user data
  document.getElementById("userName").textContent = user.name;
  document.getElementById("welcomeName").textContent = user.name;
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profilePhone").textContent = user.phone;
  document.getElementById("profileCity").textContent = user.city;
  document.getElementById("profileBloodGroup").textContent = user.bloodGroup;
  document.getElementById("profileAge").textContent = user.age + " years";

  // Set availability status
  const availabilityBadge = document.getElementById("profileAvailability");
  const availabilityToggle = document.getElementById("toggleAvailability");

  if (user.isAvailable) {
    availabilityBadge.textContent = "Available";
    availabilityBadge.className = "badge bg-success";
    availabilityToggle.checked = true;
  } else {
    availabilityBadge.textContent = "Not Available";
    availabilityBadge.className = "badge bg-secondary";
    availabilityToggle.checked = false;
  }
}

// =============================================
// NEW: LOAD DONOR NOTIFICATIONS
// =============================================
// This function fetches matching blood requests from backend
async function loadNotifications() {
  const user = checkAuth();

  if (!user) return;

  try {
    // Make API request to get notifications
    const response = await fetch(`${API_URL}/donor-notifications/${user.id}`);

    const data = await response.json();

    // Check if request was successful
    if (data.success && data.notifications.length > 0) {
      // Show notification card
      document.getElementById("notificationCard").style.display = "block";
      document.getElementById("noNotifications").style.display = "none";

      // Display each notification
      displayNotifications(data.notifications);
    } else {
      // No notifications - show empty state
      document.getElementById("notificationCard").style.display = "none";
      document.getElementById("noNotifications").style.display = "block";
    }
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

// =============================================
// NEW: DISPLAY NOTIFICATIONS
// =============================================
// This function creates notification cards dynamically
function displayNotifications(notifications) {
  const container = document.getElementById("notificationsContainer");

  // Clear previous notifications
  container.innerHTML = "";

  // Create notification card for each request
  notifications.forEach((notification, index) => {
    // Format the date
    const createdDate = new Date(notification.createdAt);
    const formattedDate = createdDate.toLocaleDateString("en-IN");

    // Create notification card HTML
    const notificationHTML = `
      <div class="alert alert-info alert-dismissible fade show mb-3" role="alert">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h6 class="mb-2">
              <i class="fas fa-tint text-danger"></i> 
              Blood Request #${index + 1}
            </h6>
            <p class="mb-1">
              <strong>Blood Group:</strong> 
              <span class="badge bg-danger">${
                notification.bloodGroupNeeded
              }</span>
            </p>
            <p class="mb-1">
              <strong>City:</strong> ${notification.city}
            </p>
            <p class="mb-1">
              <strong>Contact:</strong> 
              <a href="tel:${notification.receiverPhone}">
                <i class="fas fa-phone"></i> ${notification.receiverPhone}
              </a>
            </p>
            <p class="mb-0 small text-muted">
              <i class="fas fa-clock"></i> Requested on: ${formattedDate}
            </p>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <a href="tel:${
              notification.receiverPhone
            }" class="btn btn-success btn-sm w-100 mb-2">
              <i class="fas fa-phone"></i> Call Receiver
            </a>
            <button class="btn btn-secondary btn-sm w-100" data-bs-dismiss="alert">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    `;

    // Add to container
    container.innerHTML += notificationHTML;
  });
}

// =============================================
// UPDATE DONOR AVAILABILITY
// =============================================
async function updateAvailability() {
  const user = checkAuth();
  if (!user) return;

  const isAvailable = document.getElementById("toggleAvailability").checked;

  try {
    // Make API request to update availability
    const response = await fetch(`${API_URL}/donor/${user.id}/availability`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isAvailable }),
    });

    const data = await response.json();

    if (data.success) {
      // Update localStorage
      user.isAvailable = isAvailable;
      localStorage.setItem("userData", JSON.stringify(user));

      // Update UI
      const availabilityBadge = document.getElementById("profileAvailability");
      if (isAvailable) {
        availabilityBadge.textContent = "Available";
        availabilityBadge.className = "badge bg-success";
      } else {
        availabilityBadge.textContent = "Not Available";
        availabilityBadge.className = "badge bg-secondary";
      }

      // Show success message (optional)
      console.log("Availability updated successfully");
    } else {
      alert("Failed to update availability");
      // Revert checkbox
      document.getElementById("toggleAvailability").checked = !isAvailable;
    }
  } catch (error) {
    console.error("Error updating availability:", error);
    alert("Server error. Please try again.");
    // Revert checkbox
    document.getElementById("toggleAvailability").checked = !isAvailable;
  }
}

// =============================================
// LOGOUT FUNCTION
// =============================================
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    // Clear user data from localStorage
    localStorage.removeItem("userData");

    // Redirect to home page
    window.location.href = "index.html";
  }
}

// =============================================
// LOAD PROFILE AND NOTIFICATIONS ON PAGE LOAD
// =============================================
window.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  // UPDATED: Also load notifications when page loads
  loadNotifications();
});

// =============================================
// VIVA EXPLANATION:
// =============================================
/*
Q: What is localStorage used for?
A: To store user data in browser
   - Maintains user session across pages
   - Persists even after page reload
   - Used for authentication state

Q: Why check user role?
A: Security - prevent unauthorized access
   - Donor dashboard only for donors
   - Different dashboards for different roles
   - Role-based access control

Q: How does availability toggle work?
A: 1. User clicks toggle switch
   2. JavaScript captures the change event
   3. Sends API request to update database
   4. Updates localStorage and UI
   5. Reflects in search results for receivers

Q: What happens if API fails?
A: Error handling:
   - Show error message to user
   - Revert UI changes (uncheck checkbox)
   - Log error for debugging
   - Prevent data inconsistency
*/
