const donorUser = BloodApp.getSession();
if (!donorUser) {
  window.location.href = "login.html";
  throw new Error("Authentication required.");
} else if (donorUser.role !== "donor") {
  alert("Access denied. Only donors can access this page.");
  window.location.href = "login.html";
  throw new Error("Access denied.");
}
const userName = document.getElementById("userName");
const welcomeName = document.getElementById("welcomeName");
const profileAvailability = document.getElementById("profileAvailability");
const availabilityToggle = document.getElementById("toggleAvailability");
const requestsContainer = document.getElementById("requestsContainer");
const emptyRequests = document.getElementById("emptyRequests");
let donorChart = null;

function statusClass(status) {
  if (status === "accepted") return "status-badge-accepted";
  if (status === "rejected") return "status-badge-rejected";
  if (status === "completed") return "status-badge-completed";
  return "status-badge-pending";
}

function notify(type, message) {
  if (window.Swal) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2200,
      icon: type,
      title: message,
    });
  }
}

function renderDonorChart(requests, user) {
  const chartElement = document.getElementById("donorStatsChart");
  if (!chartElement || !window.Chart) {
    return;
  }

  const pending = requests.filter(
    (request) => request.status === "pending",
  ).length;
  const accepted = requests.filter(
    (request) => request.status === "accepted",
  ).length;
  const rejected = requests.filter(
    (request) => request.status === "rejected",
  ).length;

  if (donorChart) {
    donorChart.destroy();
  }

  donorChart = new Chart(chartElement, {
    type: "bar",
    data: {
      labels: ["Pending", "Accepted", "Rejected", "Availability"],
      datasets: [
        {
          label: "Donor activity",
          data: [pending, accepted, rejected, user.availabilityStatus ? 1 : 0],
          backgroundColor: ["#f59e0b", "#22c55e", "#ef4444", "#dc2626"],
          borderRadius: 8,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

function renderDonorProfile(user) {
  userName.textContent = user.name;
  welcomeName.textContent = user.name;
  document.getElementById("profileName").textContent = user.name;
  document.getElementById("profileEmail").textContent = user.email;
  document.getElementById("profilePhone").textContent = user.phone;
  document.getElementById("profileCity").textContent = user.city;
  document.getElementById("profileBloodGroup").textContent =
    user.bloodGroup || "-";
  document.getElementById("profileAvailabilityText").textContent =
    user.availabilityStatus ? "Available" : "Unavailable";
  profileAvailability.textContent = user.availabilityStatus
    ? "Available"
    : "Unavailable";
  profileAvailability.className = `badge ${user.availabilityStatus ? "bg-success" : "bg-secondary"}`;
  availabilityToggle.checked = Boolean(user.availabilityStatus);
}

async function loadDonorRequests() {
  const data = await BloodApp.apiRequest("/donor/requests");
  const requests = data.requests || [];

  renderDonorChart(requests, BloodApp.getSession() || donorUser);

  if (!requests.length) {
    emptyRequests.classList.remove("d-none");
    requestsContainer.innerHTML = "";
    return;
  }

  emptyRequests.classList.add("d-none");
  requestsContainer.innerHTML = requests
    .map((request) => {
      return `
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between flex-wrap gap-2">
              <div>
                <h5 class="mb-1">${BloodApp.escapeHtml(request.receiverName)}</h5>
                <div class="text-muted small">${BloodApp.escapeHtml(request.receiverEmail)} | ${BloodApp.escapeHtml(request.receiverPhone)}</div>
                <div class="mt-2">Blood group: <span class="badge bg-danger">${BloodApp.escapeHtml(request.bloodGroupNeeded)}</span></div>
                <div class="small mt-1">City: ${BloodApp.escapeHtml(request.city)} | Required: ${BloodApp.formatDate(request.requiredDate)}</div>
                <div class="mt-2"><span class="${statusClass(request.status)}">${BloodApp.escapeHtml(request.status)}</span></div>
              </div>
              <div class="d-flex flex-column gap-2 align-items-stretch">
                <button class="btn btn-success btn-sm" data-action="accept" data-id="${request._id}">Accept</button>
                <button class="btn btn-outline-danger btn-sm" data-action="reject" data-id="${request._id}">Reject</button>
              </div>
            </div>
          </div>
        </div>`;
    })
    .join("");

  requestsContainer
    .querySelectorAll("button[data-action]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const requestId = button.dataset.id;
        const status =
          button.dataset.action === "accept" ? "accepted" : "rejected";

        await BloodApp.apiRequest(`/requests/${requestId}/status`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        });

        notify("success", `Request ${status}.`);

        await refreshView();
      });
    });
}

async function updateAvailability() {
  const availabilityStatus = availabilityToggle.checked;
  const data = await BloodApp.apiRequest("/donors/availability", {
    method: "PUT",
    body: JSON.stringify({ availabilityStatus }),
  });

  BloodApp.setSession(BloodApp.getToken(), data.user);
  renderDonorProfile(data.user);
  notify("success", "Availability updated.");
}

async function refreshView() {
  const me = await BloodApp.apiRequest("/auth/me");
  BloodApp.setSession(BloodApp.getToken(), me.user);
  renderDonorProfile(me.user);
  await loadDonorRequests();
}

window.logout = async function logout() {
  await BloodApp.apiRequest("/auth/logout", { method: "POST" });
  BloodApp.clearSession();
  window.location.href = "login.html";
};

availabilityToggle?.addEventListener("change", async () => {
  try {
    await updateAvailability();
  } catch (error) {
    availabilityToggle.checked = !availabilityToggle.checked;
    notify("error", error.message);
  }
});

refreshView().catch((error) => {
  notify("error", error.message);
});
