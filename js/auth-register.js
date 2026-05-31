const registerForm = document.getElementById("registerForm");
const alertMessage = document.getElementById("alertMessage");
const alertText = document.getElementById("alertText");
const roleRadios = document.querySelectorAll('input[name="role"]');
const bloodGroupSection = document.getElementById("bloodGroupSection");
const availabilitySection = document.getElementById("availabilitySection");
const toggleRegisterPassword = document.getElementById(
  "toggleRegisterPassword",
);

function showAlert(message, type) {
  alertText.textContent = message;
  alertMessage.className = `alert alert-${type} alert-dismissible fade show`;
  alertMessage.classList.remove("d-none");

  if (window.Swal) {
    Swal.fire({
      toast: true,
      position: "top-end",
      timer: 2200,
      showConfirmButton: false,
      icon: type === "danger" ? "error" : type,
      title: message,
    });
  }
}

function syncRoleFields() {
  const role = document.querySelector('input[name="role"]:checked')?.value;
  const isDonor = role === "donor";

  if (bloodGroupSection) {
    bloodGroupSection.classList.toggle("d-none", !isDonor);
  }

  if (availabilitySection) {
    availabilitySection.classList.toggle("d-none", !isDonor);
  }

  document.getElementById("bloodGroup").required = isDonor;
}

roleRadios.forEach((radio) => radio.addEventListener("change", syncRoleFields));
syncRoleFields();

registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const role = document.querySelector('input[name="role"]:checked').value;
  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    city: document.getElementById("city").value.trim(),
    role,
  };

  if (role === "donor") {
    payload.bloodGroup = document.getElementById("bloodGroup").value;
    payload.availabilityStatus =
      document.getElementById("availabilityStatus").checked;
  }

  const submitButton = registerForm.querySelector('button[type="submit"]');

  try {
    submitButton.disabled = true;
    submitButton.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Creating account';

    const data = await BloodApp.apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    BloodApp.setSession(data.token, data.user);
    showAlert(
      "Registration successful. Redirecting to your dashboard...",
      "success",
    );

    setTimeout(() => BloodApp.redirectByRole(data.user), 800);
  } catch (error) {
    showAlert(error.message, "danger");
    submitButton.disabled = false;
    submitButton.innerHTML = '<i class="fas fa-user-plus me-2"></i>Register';
  }
});

toggleRegisterPassword?.addEventListener("click", () => {
  const passwordInput = document.getElementById("password");
  const icon = toggleRegisterPassword.querySelector("i");
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  icon.className = shouldShow ? "fas fa-eye-slash" : "fas fa-eye";
});
