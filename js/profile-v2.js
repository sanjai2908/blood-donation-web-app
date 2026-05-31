const profileUser = BloodApp.getSession();
if (!profileUser) {
  window.location.href = "login.html";
  throw new Error("Authentication required.");
} else if (!["donor", "receiver", "admin"].includes(profileUser.role)) {
  window.location.href = "login.html";
  throw new Error("Access denied.");
}
const profileForm = document.getElementById("profileForm");
document.getElementById("profileNameHeading").textContent = profileUser.name;

const twoFactorStatus = document.getElementById("twoFactorStatus");
const enable2faButton = document.getElementById("enable2faButton");
const disable2faButton = document.getElementById("disable2faButton");
const viewRecoveryButton = document.getElementById("viewRecoveryButton");
const regenerateRecoveryButton = document.getElementById(
  "regenerateRecoveryButton",
);
const twoFactorSetupBlock = document.getElementById("twoFactorSetupBlock");
const twoFactorQrImage = document.getElementById("twoFactorQrImage");
const verifySetupButton = document.getElementById("verifySetupButton");
const setupOtpCode = document.getElementById("setupOtpCode");
const recoveryCodesBlock = document.getElementById("recoveryCodesBlock");
const recoveryCodesList = document.getElementById("recoveryCodesList");

let profileState = null;

function notify(type, message) {
  if (!window.Swal) {
    return;
  }

  Swal.fire({
    icon: type,
    title: type === "success" ? "Success" : "Notice",
    text: message,
  });
}

function updateSecurityWidgets(user) {
  const security2FAStatus = document.getElementById("security2FAStatus");
  const lastLoginDisplay = document.getElementById("lastLoginDisplay");

  if (security2FAStatus) {
    security2FAStatus.textContent = user.twoFactorEnabled
      ? "Enabled and enforcing OTP"
      : "Disabled";
  }

  if (lastLoginDisplay) {
    lastLoginDisplay.textContent = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

function renderRecoveryCodes(codes) {
  recoveryCodesBlock.classList.remove("d-none");
  recoveryCodesList.innerHTML = codes
    .map(
      (code) => `<li class="list-group-item">${BloodApp.escapeHtml(code)}</li>`,
    )
    .join("");
}

function updateTwoFactorUI(user) {
  profileState = user;
  const enabled = Boolean(user.twoFactorEnabled);

  twoFactorStatus.textContent = enabled ? "Enabled" : "Disabled";
  twoFactorStatus.className = `fw-semibold ${enabled ? "text-success" : "text-muted"}`;

  enable2faButton.classList.toggle("d-none", enabled);
  disable2faButton.classList.toggle("d-none", !enabled);
  viewRecoveryButton.classList.toggle("d-none", !enabled);
  regenerateRecoveryButton.classList.toggle("d-none", !enabled);

  if (enabled) {
    twoFactorSetupBlock.classList.add("d-none");
  }

  updateSecurityWidgets(user);
}

async function loadProfile() {
  const data = await BloodApp.apiRequest("/auth/me");
  const user = data.user;

  document.getElementById("name").value = user.name || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("city").value = user.city || "";
  document.getElementById("bloodGroup").value = user.bloodGroup || "";
  document.getElementById("availabilityStatus").checked = Boolean(
    user.availabilityStatus,
  );
  updateTwoFactorUI(user);
  updateSecurityWidgets(user);
}

profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    city: document.getElementById("city").value.trim(),
    bloodGroup: document.getElementById("bloodGroup").value,
    availabilityStatus: document.getElementById("availabilityStatus").checked,
    password: document.getElementById("password").value.trim(),
  };

  if (!payload.password) {
    delete payload.password;
  }

  const data = await BloodApp.apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  BloodApp.setSession(BloodApp.getToken(), data.user);
  notify("success", "Profile updated successfully.");
});

enable2faButton?.addEventListener("click", async () => {
  try {
    const data = await BloodApp.apiRequest("/2fa/setup", {
      method: "POST",
      body: JSON.stringify({}),
    });

    twoFactorQrImage.src = data.qrCodeDataUrl;
    twoFactorSetupBlock.classList.remove("d-none");
    recoveryCodesBlock.classList.add("d-none");
  } catch (error) {
    notify("error", error.message);
  }
});

verifySetupButton?.addEventListener("click", async () => {
  const otp = setupOtpCode.value.trim();

  if (!/^\d{6}$/.test(otp)) {
    notify("warning", "Enter a valid 6-digit authenticator code.");
    return;
  }

  try {
    const data = await BloodApp.apiRequest("/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });

    BloodApp.setSession(BloodApp.getToken(), data.user);
    renderRecoveryCodes(data.recoveryCodes || []);
    twoFactorSetupBlock.classList.add("d-none");
    setupOtpCode.value = "";
    updateTwoFactorUI(data.user);
    notify("success", "Two-factor authentication enabled successfully.");
  } catch (error) {
    notify("error", error.message);
  }
});

disable2faButton?.addEventListener("click", async () => {
  let password = "";
  if (window.Swal) {
    const result = await Swal.fire({
      title: "Disable 2FA",
      text: "Enter your password to continue",
      input: "password",
      inputAttributes: { autocapitalize: "off", autocorrect: "off" },
      showCancelButton: true,
      confirmButtonText: "Disable",
    });
    if (!result.isConfirmed) return;
    password = (result.value || "").trim();
  } else {
    password =
      prompt("Enter your password to disable two-factor authentication:") || "";
  }

  if (!password) {
    return;
  }

  try {
    const data = await BloodApp.apiRequest("/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    BloodApp.setSession(BloodApp.getToken(), data.user);
    recoveryCodesBlock.classList.add("d-none");
    updateTwoFactorUI(data.user);
    notify("success", "Two-factor authentication disabled.");
  } catch (error) {
    notify("error", error.message);
  }
});

viewRecoveryButton?.addEventListener("click", async () => {
  try {
    const data = await BloodApp.apiRequest("/2fa/recovery-codes");
    notify("info", `Recovery codes remaining: ${data.remainingCodes}`);
  } catch (error) {
    notify("error", error.message);
  }
});

regenerateRecoveryButton?.addEventListener("click", async () => {
  let password = "";
  if (window.Swal) {
    const result = await Swal.fire({
      title: "Regenerate Recovery Codes",
      text: "Enter your password to continue",
      input: "password",
      inputAttributes: { autocapitalize: "off", autocorrect: "off" },
      showCancelButton: true,
      confirmButtonText: "Regenerate",
    });
    if (!result.isConfirmed) return;
    password = (result.value || "").trim();
  } else {
    password =
      prompt("Enter your password to regenerate recovery codes:") || "";
  }

  if (!password) {
    return;
  }

  try {
    const data = await BloodApp.apiRequest("/2fa/regenerate-codes", {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    renderRecoveryCodes(data.recoveryCodes || []);
    notify("success", "Recovery codes regenerated. Save them now.");
  } catch (error) {
    notify("error", error.message);
  }
});

window.logout = async function logout() {
  await BloodApp.apiRequest("/auth/logout", { method: "POST" });
  BloodApp.clearSession();
  window.location.href = "login.html";
};

loadProfile().catch((error) => notify("error", error.message));
