// =============================================
// ADMIN DASHBOARD JAVASCRIPT
// =============================================
// This file handles admin dashboard functionality

// API Base URL
const API_URL = "http://localhost:5000/api";

// =============================================
// CHECK IF USER IS LOGGED IN AS ADMIN
// =============================================
function checkAuth() {
  const userData = localStorage.getItem("userData");

  if (!userData) {
    window.location.href = "login.html";
    return null;
  }

  const user = JSON.parse(userData);

  // Check if user is an admin
  if (user.role !== "admin") {
    alert("Access denied. Only admins can access this page.");
    window.location.href = "login.html";
    return null;
  }

  return user;
}

// =============================================
// LOAD ALL DATA
// =============================================
async function loadDashboardData() {
  const user = checkAuth();
  if (!user) return;

  try {
    // Fetch all donors
    await loadAllDonors();

    // Fetch all blood requests
    await loadAllRequests();

    // Update statistics
    updateStatistics();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    alert("Error loading dashboard data. Please check if backend is running.");
  }
}

// =============================================
// LOAD ALL DONORS
// =============================================
async function loadAllDonors() {
  try {
    const response = await fetch(`${API_URL}/donors`);
    const data = await response.json();

    if (data.success) {
      // Store donors globally for statistics
      window.allDonors = data.donors;

      // Display donors in table
      displayDonorsTable(data.donors);
    } else {
      console.error("Failed to load donors");
    }
  } catch (error) {
    console.error("Error fetching donors:", error);
    document.getElementById("donorsTableBody").innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Error loading donors. Please check if backend is running.
                </td>
            </tr>
        `;
  }
}

// =============================================
// DISPLAY DONORS IN TABLE
// =============================================
function displayDonorsTable(donors) {
  const tbody = document.getElementById("donorsTableBody");

  if (donors.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    No donors registered yet
                </td>
            </tr>
        `;
    return;
  }

  let html = "";
  donors.forEach((donor, index) => {
    const availabilityBadge = donor.isAvailable
      ? '<span class="badge bg-success">Available</span>'
      : '<span class="badge bg-secondary">Not Available</span>';

    html += `
            <tr>
                <td>${index + 1}</td>
                <td>${donor.name}</td>
                <td>${donor.email}</td>
                <td><span class="badge bg-danger">${
                  donor.bloodGroup
                }</span></td>
                <td>${donor.age}</td>
                <td>${donor.city}</td>
                <td>${donor.phone}</td>
                <td>${availabilityBadge}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editDonor('${
                      donor._id
                    }')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDonor('${
                      donor._id
                    }', '${donor.name}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  });

  tbody.innerHTML = html;
}

// =============================================
// LOAD ALL BLOOD REQUESTS
// =============================================
async function loadAllRequests() {
  try {
    const response = await fetch(`${API_URL}/requests`);
    const data = await response.json();

    if (data.success) {
      // Store requests globally for statistics
      window.allRequests = data.requests;

      // Display requests in table
      displayRequestsTable(data.requests);
    } else {
      console.error("Failed to load requests");
    }
  } catch (error) {
    console.error("Error fetching requests:", error);
    document.getElementById("requestsTableBody").innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Error loading requests. Please check if backend is running.
                </td>
            </tr>
        `;
  }
}

// =============================================
// DISPLAY REQUESTS IN TABLE
// =============================================
function displayRequestsTable(requests) {
  const tbody = document.getElementById("requestsTableBody");

  if (requests.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    No blood requests yet
                </td>
            </tr>
        `;
    return;
  }

  let html = "";
  requests.forEach((request, index) => {
    // Format date
    const date = new Date(request.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Status badge
    let statusBadge = "";
    if (request.status === "pending") {
      statusBadge = '<span class="badge bg-warning">Pending</span>';
    } else if (request.status === "fulfilled") {
      statusBadge = '<span class="badge bg-success">Fulfilled</span>';
    } else {
      statusBadge = '<span class="badge bg-secondary">Cancelled</span>';
    }

    html += `
            <tr>
                <td>${index + 1}</td>
                <td>${request.receiverName}</td>
                <td>${request.receiverEmail}</td>
                <td>${request.receiverPhone}</td>
                <td><span class="badge bg-danger">${
                  request.bloodGroupNeeded
                }</span></td>
                <td>${request.city}</td>
                <td>${statusBadge}</td>
                <td>${date}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editRequest('${
                      request._id
                    }')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRequest('${
                      request._id
                    }', '${request.receiverName}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
  });

  tbody.innerHTML = html;
}

// =============================================
// UPDATE STATISTICS CARDS
// =============================================
function updateStatistics() {
  const donors = window.allDonors || [];
  const requests = window.allRequests || [];

  // Total donors
  document.getElementById("totalDonors").textContent = donors.length;

  // Total requests
  document.getElementById("totalRequests").textContent = requests.length;

  // Available donors
  const availableDonors = donors.filter((d) => d.isAvailable).length;
  document.getElementById("availableDonors").textContent = availableDonors;

  // Pending requests
  const pendingRequests = requests.filter((r) => r.status === "pending").length;
  document.getElementById("pendingRequests").textContent = pendingRequests;
}

// =============================================
// EDIT DONOR
// =============================================
function editDonor(donorId) {
  const donor = window.allDonors.find((d) => d._id === donorId);
  if (!donor) {
    alert("Donor not found!");
    return;
  }

  // Prompt for new information
  const newName = prompt("Enter new name:", donor.name);
  if (newName === null) return;

  const newPhone = prompt("Enter new phone:", donor.phone);
  if (newPhone === null) return;

  const newCity = prompt("Enter new city:", donor.city);
  if (newCity === null) return;

  const newAge = prompt("Enter new age:", donor.age);
  if (newAge === null) return;

  // Update donor via API
  updateDonor(donorId, {
    name: newName,
    phone: newPhone,
    city: newCity,
    age: parseInt(newAge),
  });
}

// =============================================
// UPDATE DONOR VIA API
// =============================================
async function updateDonor(donorId, updatedData) {
  try {
    const response = await fetch(`${API_URL}/donor/${donorId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ Donor updated successfully!");
      loadDashboardData();
    } else {
      alert("❌ Failed to update donor: " + data.message);
    }
  } catch (error) {
    console.error("Error updating donor:", error);
    alert("Error updating donor. Please check if backend is running.");
  }
}

// =============================================
// DELETE DONOR
// =============================================
function deleteDonor(donorId, donorName) {
  if (
    confirm(
      `Are you sure you want to delete ${donorName}? This action cannot be undone.`
    )
  ) {
    removeDonor(donorId);
  }
}

// =============================================
// REMOVE DONOR VIA API
// =============================================
async function removeDonor(donorId) {
  try {
    const response = await fetch(`${API_URL}/donor/${donorId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ Donor deleted successfully!");
      loadDashboardData();
    } else {
      alert("❌ Failed to delete donor: " + data.message);
    }
  } catch (error) {
    console.error("Error deleting donor:", error);
    alert("Error deleting donor. Please check if backend is running.");
  }
}

// =============================================
// EDIT BLOOD REQUEST
// =============================================
function editRequest(requestId) {
  const request = window.allRequests.find((r) => r._id === requestId);
  if (!request) {
    alert("Request not found!");
    return;
  }

  // Prompt for new status
  const statusOptions =
    "pending (1)\nfulfilled (2)\ncancelled (3)\n\nEnter the number:";
  const newStatusNum = prompt(statusOptions);
  if (newStatusNum === null) return;

  let newStatus;
  if (newStatusNum === "1") newStatus = "pending";
  else if (newStatusNum === "2") newStatus = "fulfilled";
  else if (newStatusNum === "3") newStatus = "cancelled";
  else {
    alert("Invalid option!");
    return;
  }

  // Update request via API
  updateRequest(requestId, { status: newStatus });
}

// =============================================
// UPDATE REQUEST VIA API
// =============================================
async function updateRequest(requestId, updatedData) {
  try {
    const response = await fetch(`${API_URL}/request/${requestId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ Request updated successfully!");
      loadDashboardData();
    } else {
      alert("❌ Failed to update request: " + data.message);
    }
  } catch (error) {
    console.error("Error updating request:", error);
    alert("Error updating request. Please check if backend is running.");
  }
}

// =============================================
// DELETE BLOOD REQUEST
// =============================================
function deleteRequest(requestId, receiverName) {
  if (
    confirm(
      `Are you sure you want to delete the blood request for ${receiverName}? This action cannot be undone.`
    )
  ) {
    removeRequest(requestId);
  }
}

// =============================================
// REMOVE REQUEST VIA API
// =============================================
async function removeRequest(requestId) {
  try {
    const response = await fetch(`${API_URL}/request/${requestId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ Request deleted successfully!");
      loadDashboardData();
    } else {
      alert("❌ Failed to delete request: " + data.message);
    }
  } catch (error) {
    console.error("Error deleting request:", error);
    alert("Error deleting request. Please check if backend is running.");
  }
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
// LOAD DASHBOARD ON PAGE LOAD
// =============================================
window.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
});

// =============================================
// VIVA EXPLANATION:
// =============================================
/*
Q: What can admin see?
A: Admin has full visibility:
   - All registered donors
   - All blood requests
   - Statistics (total, available, pending)
   - Contact information of all users

Q: Why separate admin dashboard?
A: Role-based access control:
   - Admin needs overview of entire system
   - Donors/receivers see only their data
   - Better organization and security
   - Different data requirements

Q: How are statistics calculated?
A: Using JavaScript array methods:
   - filter() to count specific items
   - length property for total count
   - Example: donors.filter(d => d.isAvailable).length
   - Real-time calculation from fetched data

Q: What is the benefit of storing data globally?
A: Avoids multiple API calls:
   - Fetch once, use multiple times
   - Faster statistics calculation
   - Reduced server load
   - Better performance

Q: How to add more admin features?
A: Can be extended with:
   - Edit/delete users
   - Send notifications
   - Generate reports
   - Export data to Excel
   - Analytics and charts
*/
