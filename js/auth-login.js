const loginForm = document.getElementById("loginForm");
const twoFactorForm = document.getElementById("twoFactorForm");
const alertMessage = document.getElementById("alertMessage");
const alertText = document.getElementById("alertText");
const recoveryLoginButton = document.getElementById("recoveryLoginButton");
const backToLoginButton = document.getElementById("backToLoginButton");
const togglePassword = document.getElementById("togglePassword");

let pendingTwoFactorToken = null;

function setTwoFactorMode(enabled) {
  loginForm.classList.toggle("d-none", enabled);
  twoFactorForm.classList.toggle("d-none", !enabled);

  if (!enabled) {
    pendingTwoFactorToken = null;
    document.getElementById("otpCode").value = "";
    document.getElementById("recoveryCode").value = "";
  }
}

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

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showAlert("Please enter your email and password.", "danger");
    return;
  }

  const submitButton = loginForm.querySelector('button[type="submit"]');

  try {
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Logging in';

    const data = await BloodApp.apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.requiresTwoFactor && data.twoFactorToken) {
      pendingTwoFactorToken = data.twoFactorToken;
      showAlert("Enter your authenticator code to finish login.", "warning");
      setTwoFactorMode(true);
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
      return;
    }

    BloodApp.setSession(data.token, data.user);
    showAlert("Login successful. Redirecting...", "success");

    setTimeout(() => BloodApp.redirectByRole(data.user), 700);
  } catch (error) {
    showAlert(error.message, "danger");
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
  }
});

twoFactorForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const otp = document.getElementById("otpCode").value.trim();
  if (!pendingTwoFactorToken) {
    showAlert("Your login session expired. Please sign in again.", "danger");
    setTwoFactorMode(false);
    return;
  }

  if (!/^\d{6}$/.test(otp)) {
    showAlert("Please enter a valid 6-digit authenticator code.", "danger");
    return;
  }

  try {
    const data = await BloodApp.apiRequest("/2fa/verify", {
      method: "POST",
      body: JSON.stringify({
        twoFactorToken: pendingTwoFactorToken,
        otp,
      }),
    });

    BloodApp.setSession(data.token, data.user);
    showAlert("2FA verification successful. Redirecting...", "success");
    setTimeout(() => BloodApp.redirectByRole(data.user), 700);
  } catch (error) {
    showAlert(error.message, "danger");
  }
});

recoveryLoginButton?.addEventListener("click", async () => {
  const recoveryCode = document
    .getElementById("recoveryCode")
    .value.trim()
    .toUpperCase();

  if (!pendingTwoFactorToken) {
    showAlert("Your login session expired. Please sign in again.", "danger");
    setTwoFactorMode(false);
    return;
  }

  if (!recoveryCode) {
    showAlert("Enter a recovery code to continue.", "danger");
    return;
  }

  try {
    const data = await BloodApp.apiRequest("/2fa/recovery-login", {
      method: "POST",
      body: JSON.stringify({
        twoFactorToken: pendingTwoFactorToken,
        recoveryCode,
      }),
    });

    BloodApp.setSession(data.token, data.user);
    showAlert("Recovery code accepted. Redirecting...", "success");
    setTimeout(() => BloodApp.redirectByRole(data.user), 700);
  } catch (error) {
    showAlert(error.message, "danger");
  }
});

backToLoginButton?.addEventListener("click", () => {
  setTwoFactorMode(false);
  showAlert(
    "Login with email and password again to create a new 2FA session.",
    "info",
  );
});

togglePassword?.addEventListener("click", () => {
  const passwordInput = document.getElementById("password");
  const icon = togglePassword.querySelector("i");
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  icon.className = shouldShow ? "fas fa-eye-slash" : "fas fa-eye";
});

function quickLogin(role) {
  const preset = window.BloodAppDemoCredentials?.[role];

  if (preset?.email && preset?.password) {
    document.getElementById("email").value = preset.email;
    document.getElementById("password").value = preset.password;
    return;
  }

  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}

function submitForgotPassword() {
  const forgotEmail = document.getElementById("forgotEmail").value.trim();
  if (!forgotEmail) {
    showForgotAlert("Please enter your email address.", "warning");
    return;
  }

  showForgotAlert(
    `Password reset is managed by the admin team for ${BloodApp.escapeHtml(forgotEmail)}.`,
    "success",
  );
}

function showForgotAlert(message, type) {
  const alertDiv = document.getElementById("forgotAlertMessage");
  const alertTextElement = document.getElementById("forgotAlertText");

  alertTextElement.innerHTML = message;
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.classList.remove("d-none");
}
