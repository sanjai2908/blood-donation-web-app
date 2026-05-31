const receiverUser = BloodApp.getSession();
if (!receiverUser) {
  window.location.href = "login.html";
  throw new Error("Authentication required.");
} else if (receiverUser.role !== "receiver") {
  alert("Access denied. Only receivers can access this page.");
  window.location.href = "login.html";
  throw new Error("Access denied.");
}
const requestForm = document.getElementById("requestForm");
const searchForm = document.getElementById("searchForm");
const requestsHistoryBody = document.getElementById("requestsHistoryBody");
const donorsList = document.getElementById("donorsList");
const emptyState = document.getElementById("emptyState");
const alertMessage = document.getElementById("alertMessage");
const alertText = document.getElementById("alertText");

function showAlert(message, type) {
  alertText.textContent = message;
  alertMessage.className = `alert alert-${type} alert-dismissible fade show`;
  alertMessage.classList.remove("d-none");

  if (window.Swal) {
    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2200,
      icon: type === "danger" ? "error" : type,
      title: message,
    });
  }
}

function statusClass(status) {
  if (status === "accepted") return "status-badge-accepted";
  if (status === "rejected") return "status-badge-rejected";
  if (status === "completed") return "status-badge-completed";
  return "status-badge-pending";
}

function renderDonors(donors) {
  const donorCount = document.getElementById("donorCount");
  donorCount.textContent = String(donors.length);

  if (!donors.length) {
    emptyState.innerHTML = `
      <i class="fas fa-user-slash fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">No donors matched your filters</h5>
      <p class="text-muted mb-0">Try a nearby city or another blood group.</p>`;
    donorsList.classList.add("d-none");
    emptyState.classList.remove("d-none");
    return;
  }

  emptyState.classList.add("d-none");
  donorsList.classList.remove("d-none");
  donorsList.innerHTML = donors
    .map(
      (donor) => `
      <div class="card border-0 shadow-sm mb-3 donor-card">
        <div class="card-body">
          <div class="d-flex justify-content-between flex-wrap gap-3">
            <div>
              <h5 class="mb-1">${BloodApp.escapeHtml(donor.name)}</h5>
              <div class="text-muted small">${BloodApp.escapeHtml(donor.email)} | ${BloodApp.escapeHtml(donor.phone)}</div>
              <div class="mt-2">Blood group: <span class="badge bg-danger">${BloodApp.escapeHtml(donor.bloodGroup)}</span></div>
              <div class="small mt-1">City: ${BloodApp.escapeHtml(donor.city)}</div>
            </div>
            <div class="text-end">
              <div class="small mb-2">
                <span class="availability-dot ${donor.availabilityStatus ? "available" : "unavailable"}"></span>
                ${donor.availabilityStatus ? "Available" : "Unavailable"}
              </div>
              <button class="btn btn-outline-danger btn-sm" data-request-donor="${donor._id || ""}">
                <i class="fas fa-paper-plane me-1"></i>Request
              </button>
            </div>
          </div>
        </div>
      </div>`,
    )
    .join("");

  donorsList
    .querySelectorAll("button[data-request-donor]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById("city").value =
          button
            .closest(".card")
            ?.querySelector(".small.mt-1")
            ?.textContent?.replace("City: ", "") || "";
        showAlert("Donor selected. Complete request form below.", "info");
        document
          .getElementById("requestForm")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
}

async function loadRequestHistory() {
  const data = await BloodApp.apiRequest("/requests/me");
  const requests = data.requests || [];

  if (!requests.length) {
    requestsHistoryBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No request history yet.</td></tr>`;
    return;
  }

  requestsHistoryBody.innerHTML = requests
    .map(
      (request, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${BloodApp.escapeHtml(request.bloodGroupNeeded)}</td>
        <td>${BloodApp.escapeHtml(request.city)}</td>
        <td>${BloodApp.formatDate(request.requiredDate)}</td>
        <td><span class="${statusClass(request.status)}">${BloodApp.escapeHtml(request.status)}</span></td>
        <td>${BloodApp.formatDate(request.createdAt)}</td>
      </tr>`,
    )
    .join("");
}

requestForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    bloodGroupNeeded: document.getElementById("bloodGroupNeeded").value,
    city: document.getElementById("city").value.trim(),
    requiredDate: document.getElementById("requiredDate").value,
    receiverPhone: document.getElementById("contactPhone").value.trim(),
    message: document.getElementById("message").value.trim(),
  };

  const data = await BloodApp.apiRequest("/requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  showAlert(
    `Request created. Found ${data.matchingDonors.length} matching donors.`,
    "success",
  );
  renderDonors(data.matchingDonors || []);
  requestForm.reset();
  await loadRequestHistory();
});

searchForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const params = new URLSearchParams();
  const bloodGroup = document.getElementById("searchBloodGroup").value;
  const city = document.getElementById("searchCity").value.trim();
  const availabilityStatus =
    document.getElementById("searchAvailability").value;

  if (bloodGroup) params.set("bloodGroup", bloodGroup);
  if (city) params.set("city", city);
  if (availabilityStatus) params.set("availabilityStatus", availabilityStatus);

  const data = await BloodApp.apiRequest(`/donors/search?${params.toString()}`);
  renderDonors(data.donors || []);
});

window.logout = async function logout() {
  await BloodApp.apiRequest("/auth/logout", { method: "POST" });
  BloodApp.clearSession();
  window.location.href = "login.html";
};

document.getElementById("userName").textContent = receiverUser.name;

loadRequestHistory().catch((error) => showAlert(error.message, "danger"));
