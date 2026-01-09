// =============================================
// REQUEST BLOOD PAGE JAVASCRIPT
// =============================================
// This file handles blood request and donor search functionality

// API Base URL
const API_URL = "https://blood-donation-web-app-8k1y.onrender.com/api";
console.log("Using backend API:", API_URL);

// =============================================
// CHECK IF USER IS LOGGED IN
// =============================================
function checkAuth() {
  const userData = localStorage.getItem("userData");

  if (!userData) {
    window.location.href = "login.html";
    return null;
  }

  const user = JSON.parse(userData);

  // Check if user is a receiver
  if (user.role !== "receiver") {
    alert("Access denied. Only receivers can access this page.");
    window.location.href = "login.html";
    return null;
  }

  return user;
}

// =============================================
// LOAD PAGE
// =============================================
function loadPage() {
  const user = checkAuth();
  if (!user) return;

  // Update username in navbar
  document.getElementById("userName").textContent = user.name;
}

// =============================================
// HANDLE BLOOD REQUEST FORM SUBMISSION
// =============================================
const requestForm = document.getElementById("requestForm");

requestForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = checkAuth();
  if (!user) return;

  // Get form values
  const bloodGroupNeeded = document.getElementById("bloodGroupNeeded").value;
  const city = document.getElementById("city").value.trim();
  // UPDATED: Get new fields - required date and contact phone
  const requiredDate = document.getElementById("requiredDate").value;
  const contactPhone = document.getElementById("contactPhone").value.trim();

  // Validation
  if (!bloodGroupNeeded || !city || !requiredDate || !contactPhone) {
    showAlert("Please fill in all required fields", "danger");
    return;
  }

  // Validate phone format
  if (!/^\d{10}$/.test(contactPhone)) {
    showAlert("Please enter a valid 10-digit phone number", "danger");
    return;
  }

  // Validate date is not in the past
  const selectedDate = new Date(requiredDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    showAlert("Required date cannot be in the past", "danger");
    return;
  }

  try {
    // Show loading state
    const submitBtn = requestForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // Prepare request data with new fields
    const requestData = {
      receiverId: user.id,
      receiverName: user.name,
      receiverEmail: user.email,
      receiverPhone: contactPhone, // UPDATED: Use the input phone instead of user phone
      bloodGroupNeeded,
      city,
      requiredDate, // NEW: Include required date
      // Note: contactPhone is included in receiverPhone field
    };

    // Make API request to create blood request
    const response = await fetch(`${API_URL}/request-blood`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();

    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-search"></i> Request Blood';

    if (data.success) {
      // Show success message with donor count
      const donorMessage =
        data.matchingDonors.length > 0
          ? `Request created! Found ${data.matchingDonors.length} matching donors.`
          : "Request created! No matching donors found currently.";

      showAlert(donorMessage, "success");

      // Display matching donors
      displayDonors(data.matchingDonors);

      // Reset the form
      requestForm.reset();
    } else {
      showAlert(data.message || "Request failed", "danger");
    }
  } catch (error) {
    console.error("Request error:", error);
    showAlert("Server error. Please check if backend is running.", "danger");

    const submitBtn = requestForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-search"></i> Request Blood';
  }
});

// =============================================
// DISPLAY MATCHING DONORS
// =============================================
function displayDonors(donors) {
  const emptyState = document.getElementById("emptyState");
  const donorsList = document.getElementById("donorsList");
  const donorCount = document.getElementById("donorCount");

  // Update donor count
  donorCount.textContent = donors.length;

  if (donors.length === 0) {
    // Show "no donors found" message
    emptyState.style.display = "block";
    emptyState.innerHTML = `
            <i class="fas fa-sad-tear fa-4x text-muted mb-3"></i>
            <h5 class="text-muted">No Donors Found</h5>
            <p class="text-muted">
                Sorry, no available donors found in this city with the requested blood group.
                Try searching in nearby cities.
            </p>
        `;
    donorsList.classList.add("d-none");
  } else {
    // Hide empty state and show donors list
    emptyState.style.display = "none";
    donorsList.classList.remove("d-none");

    // Generate HTML for each donor
    let donorsHTML = "";
    donors.forEach((donor, index) => {
      donorsHTML += `
                <div class="card donor-card mb-3">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-8">
                                <h5 class="mb-2">
                                    <i class="fas fa-user-circle text-danger"></i> ${donor.name}
                                </h5>
                                <p class="mb-1">
                                    <i class="fas fa-tint text-danger"></i> 
                                    <strong>Blood Group:</strong> ${donor.bloodGroup}
                                </p>
                                <p class="mb-1">
                                    <i class="fas fa-map-marker-alt text-danger"></i> 
                                    <strong>City:</strong> ${donor.city}
                                </p>
                                <p class="mb-1">
                                    <i class="fas fa-calendar text-danger"></i> 
                                    <strong>Age:</strong> ${donor.age} years
                                </p>
                            </div>
                            <div class="col-md-4 text-md-end mt-3 mt-md-0">
                                <a href="tel:${donor.phone}" class="btn btn-success btn-sm mb-2 w-100">
                                    <i class="fas fa-phone"></i> ${donor.phone}
                                </a>
                                <a href="mailto:${donor.email}" class="btn btn-info btn-sm w-100">
                                    <i class="fas fa-envelope"></i> Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    });

    donorsList.innerHTML = donorsHTML;
  }
}

// =============================================
// SHOW ALERT FUNCTION
// =============================================
function showAlert(message, type) {
  const alertDiv = document.getElementById("alertMessage");
  const alertText = document.getElementById("alertText");

  alertText.textContent = message;
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;

  setTimeout(() => {
    alertDiv.classList.remove("show");
    alertDiv.classList.add("d-none");
  }, 5000);
}

// =============================================
// LOGOUT FUNCTION
// =============================================
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("userData");
    window.location.href = "index.html";
  }
}

// =============================================
// LOAD PAGE ON DOM READY
// =============================================
window.addEventListener("DOMContentLoaded", () => {
  loadPage();
});

// =============================================
// VIVA EXPLANATION:
// =============================================
/*
Q: How does blood matching work?
A: Matching criteria:
   1. Blood group must match exactly
   2. City must match (case-insensitive)
   3. Donor must be available (isAvailable = true)
   4. Backend filters donors using these conditions
   5. Returns list of matching donors

Q: Why store request in database?
A: For admin tracking and analytics
   - Admin can see all blood requests
   - Track which blood groups are in high demand
   - Historical data for reporting
   - Contact receivers if donors become available later

Q: How is data passed between pages?
A: Using localStorage:
   - Login page stores user data
   - Request page reads user data
   - All pages can access same data
   - Alternative: Session storage, cookies

Q: What if no donors found?
A: User experience:
   - Show friendly "no results" message
   - Suggest trying nearby cities
   - Request still saved in database
   - Admin can manually help find donors
*/
