const adminUser = BloodApp.getSession();
if (!adminUser) {
  window.location.href = "login.html";
  throw new Error("Authentication required.");
} else if (adminUser.role !== "admin") {
  alert("Access denied. Only admins can access this page.");
  window.location.href = "login.html";
  throw new Error("Access denied.");
}
const totalDonorsEl = document.getElementById("totalDonors");
const totalReceiversEl = document.getElementById("totalReceivers");
const totalUsersEl = document.getElementById("totalUsers");
const activeRequestsEl = document.getElementById("activeRequests");
const pendingRequestsEl = document.getElementById("pendingRequests");
const totalRequestsEl = document.getElementById("totalRequests");
const availableDonorsEl = document.getElementById("availableDonors");
const recentRequestsBody = document.getElementById("recentRequestsBody");
const usersBody = document.getElementById("usersBody");
let bloodGroupChart = null;
let monthlyRequestsChart = null;
let userGrowthChart = null;

document.getElementById("adminName").textContent = adminUser.name;

function notify(type, message) {
  if (!window.Swal) {
    return;
  }

  Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2200,
    icon: type,
    title: message,
  });
}

function statusClass(status) {
  if (status === "accepted") return "status-badge-accepted";
  if (status === "rejected") return "status-badge-rejected";
  if (status === "completed") return "status-badge-completed";
  return "status-badge-pending";
}

function renderCharts(users, requests) {
  if (!window.Chart) {
    return;
  }

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const bloodData = bloodGroups.map(
    (group) =>
      users.filter((user) => user.role === "donor" && user.bloodGroup === group)
        .length,
  );

  const bloodCtx = document.getElementById("bloodGroupChart");
  if (bloodCtx) {
    if (bloodGroupChart) bloodGroupChart.destroy();
    bloodGroupChart = new Chart(bloodCtx, {
      type: "bar",
      data: {
        labels: bloodGroups,
        datasets: [
          { data: bloodData, backgroundColor: "#ef4444", borderRadius: 8 },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      },
    });
  }

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyData = new Array(12).fill(0);
  requests.forEach((request) => {
    const date = new Date(request.createdAt);
    if (!Number.isNaN(date.getTime())) {
      monthlyData[date.getMonth()] += 1;
    }
  });

  const monthlyCtx = document.getElementById("monthlyRequestsChart");
  if (monthlyCtx) {
    if (monthlyRequestsChart) monthlyRequestsChart.destroy();
    monthlyRequestsChart = new Chart(monthlyCtx, {
      type: "line",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: "Requests",
            data: monthlyData,
            borderColor: "#dc2626",
            backgroundColor: "rgba(220, 38, 38, 0.2)",
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: { plugins: { legend: { display: false } } },
    });
  }

  const donorCount = users.filter((user) => user.role === "donor").length;
  const receiverCount = users.filter((user) => user.role === "receiver").length;
  const adminCount = users.filter((user) => user.role === "admin").length;
  const growthCtx = document.getElementById("userGrowthChart");
  if (growthCtx) {
    if (userGrowthChart) userGrowthChart.destroy();
    userGrowthChart = new Chart(growthCtx, {
      type: "doughnut",
      data: {
        labels: ["Donors", "Receivers", "Admins"],
        datasets: [
          {
            data: [donorCount, receiverCount, adminCount],
            backgroundColor: ["#ef4444", "#3b82f6", "#16a34a"],
            borderWidth: 0,
          },
        ],
      },
      options: { plugins: { legend: { position: "bottom" } }, cutout: "66%" },
    });
  }
}

function renderUsers(users) {
  if (!users.length) {
    usersBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No users found.</td></tr>`;
    return;
  }

  usersBody.innerHTML = users
    .map(
      (user, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${BloodApp.escapeHtml(user.name)}</td>
        <td>${BloodApp.escapeHtml(user.email)}</td>
        <td><span class="badge badge-soft">${BloodApp.escapeHtml(user.role)}</span></td>
        <td>${BloodApp.escapeHtml(user.city)}</td>
        <td>${BloodApp.escapeHtml(user.phone)}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger" data-delete-user="${user._id}">Delete</button>
        </td>
      </tr>`,
    )
    .join("");

  usersBody.querySelectorAll("button[data-delete-user]").forEach((button) => {
    button.addEventListener("click", async () => {
      let canDelete = true;
      if (window.Swal) {
        const result = await Swal.fire({
          title: "Delete user?",
          text: "This action cannot be undone.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete",
          cancelButtonText: "Cancel",
        });
        canDelete = result.isConfirmed;
      } else {
        canDelete = confirm("Delete this user?");
      }

      if (!canDelete) return;

      await BloodApp.apiRequest(`/admin/users/${button.dataset.deleteUser}`, {
        method: "DELETE",
      });

      notify("success", "User deleted.");
      await loadAdminData();
    });
  });
}

function renderRequests(requests) {
  if (!requests.length) {
    recentRequestsBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No recent requests.</td></tr>`;
    return;
  }

  recentRequestsBody.innerHTML = requests
    .map(
      (request, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${BloodApp.escapeHtml(request.receiverName)}</td>
        <td>${BloodApp.escapeHtml(request.bloodGroupNeeded)}</td>
        <td>${BloodApp.escapeHtml(request.city)}</td>
        <td><span class="${statusClass(request.status)}">${BloodApp.escapeHtml(request.status)}</span></td>
        <td>${BloodApp.formatDate(request.createdAt)}</td>
      </tr>`,
    )
    .join("");
}

async function loadAdminData() {
  const [dashboard, users, requests] = await Promise.all([
    BloodApp.apiRequest("/admin/dashboard"),
    BloodApp.apiRequest("/admin/users"),
    BloodApp.apiRequest("/admin/requests"),
  ]);

  const usersList = users.users || [];
  const requestsList = requests.requests || [];
  const pendingRequests = requestsList.filter(
    (item) => item.status === "pending",
  ).length;
  const activeRequests = requestsList.filter(
    (item) => item.status === "pending" || item.status === "accepted",
  ).length;

  totalUsersEl.textContent = String(usersList.length);
  totalDonorsEl.textContent = dashboard.dashboard.totalDonors;
  totalReceiversEl.textContent = dashboard.dashboard.totalReceivers;
  totalRequestsEl.textContent = dashboard.dashboard.totalBloodRequests;
  activeRequestsEl.textContent = String(activeRequests);
  pendingRequestsEl.textContent = String(pendingRequests);
  availableDonorsEl.textContent = dashboard.dashboard.availableDonors;

  renderUsers(usersList);
  renderRequests(requestsList);
  renderCharts(usersList, requestsList);
}

window.logout = async function logout() {
  await BloodApp.apiRequest("/auth/logout", { method: "POST" });
  BloodApp.clearSession();
  window.location.href = "login.html";
};

loadAdminData().catch((error) => notify("error", error.message));
