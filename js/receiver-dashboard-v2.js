const receiverUser = BloodApp.getSession();
if (!receiverUser) {
  window.location.href = "login.html";
  throw new Error("Authentication required.");
} else if (receiverUser.role !== "receiver") {
  alert("Access denied. Only receivers can access this page.");
  window.location.href = "login.html";
  throw new Error("Access denied.");
}

document.getElementById("receiverName").textContent = receiverUser.name;
let receiverChart = null;

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

function renderDonorCards(donors) {
  const donorCards = document.getElementById("receiverDonorCards");
  if (!donorCards) {
    return;
  }

  const topDonors = donors.slice(0, 4);
  if (!topDonors.length) {
    donorCards.innerHTML = `
      <div class="col-12">
        <div class="empty-state py-3">
          <i class="fas fa-user-slash mb-2"></i>
          <div>No available donors right now.</div>
        </div>
      </div>`;
    return;
  }

  donorCards.innerHTML = topDonors
    .map(
      (donor) => `
      <div class="col-md-6">
        <div class="workflow-card p-3 h-100">
          <div class="d-flex justify-content-between align-items-start gap-2">
            <div>
              <div class="fw-semibold">${BloodApp.escapeHtml(donor.name)}</div>
              <div class="small text-muted">${BloodApp.escapeHtml(donor.city)}</div>
            </div>
            <span class="badge bg-danger">${BloodApp.escapeHtml(donor.bloodGroup || "-")}</span>
          </div>
          <div class="mt-2 small">
            <span class="availability-dot ${donor.availabilityStatus ? "available" : "unavailable"}"></span>
            ${donor.availabilityStatus ? "Available" : "Unavailable"}
          </div>
          <a class="btn btn-outline-danger btn-sm mt-3" href="request-blood.html">Request Blood</a>
        </div>
      </div>`,
    )
    .join("");
}

function renderStatusChart(requests) {
  const chartElement = document.getElementById("receiverStatusChart");
  if (!chartElement || !window.Chart) {
    return;
  }

  const pending = requests.filter((item) => item.status === "pending").length;
  const accepted = requests.filter((item) => item.status === "accepted").length;
  const rejected = requests.filter((item) => item.status === "rejected").length;
  const completed = requests.filter(
    (item) => item.status === "completed",
  ).length;

  if (receiverChart) {
    receiverChart.destroy();
  }

  receiverChart = new Chart(chartElement, {
    type: "doughnut",
    data: {
      labels: ["Pending", "Accepted", "Rejected", "Completed"],
      datasets: [
        {
          data: [pending, accepted, rejected, completed],
          backgroundColor: ["#f59e0b", "#22c55e", "#ef4444", "#3b82f6"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { position: "bottom" } },
      cutout: "68%",
    },
  });
}

async function loadReceiverDashboard() {
  const [profile, requests, donors] = await Promise.all([
    BloodApp.apiRequest("/auth/me"),
    BloodApp.apiRequest("/requests/me"),
    BloodApp.apiRequest("/donors/available"),
  ]);

  const user = profile.user;
  BloodApp.setSession(BloodApp.getToken(), user);

  document.getElementById("receiverEmail").textContent = user.email;
  document.getElementById("receiverCity").textContent = user.city;
  document.getElementById("receiverRequestsCount").textContent = requests.count;
  document.getElementById("availableDonorsCount").textContent = donors.count;
  renderDonorCards(donors.donors || []);

  const historyBody = document.getElementById("receiverHistoryBody");
  const history = requests.requests || [];
  renderStatusChart(history);

  if (!history.length) {
    historyBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No requests yet.</td></tr>`;
    return;
  }

  historyBody.innerHTML = history
    .map(
      (request, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${BloodApp.escapeHtml(request.bloodGroupNeeded)}</td>
        <td>${BloodApp.escapeHtml(request.city)}</td>
        <td><span class="${statusClass(request.status)}">${BloodApp.escapeHtml(request.status)}</span></td>
        <td>${BloodApp.formatDate(request.createdAt)}</td>
      </tr>`,
    )
    .join("");
}

window.logout = async function logout() {
  await BloodApp.apiRequest("/auth/logout", { method: "POST" });
  BloodApp.clearSession();
  window.location.href = "login.html";
};

loadReceiverDashboard().catch((error) => notify("error", error.message));
