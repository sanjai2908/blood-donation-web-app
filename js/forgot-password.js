(() => {
  const stepEmail = document.getElementById("stepEmail");
  const stepChoose = document.getElementById("stepChoose");
  const stepVerify = document.getElementById("stepVerify");
  const stepReset = document.getElementById("stepReset");
  const stepSuccess = document.getElementById("stepSuccess");

  const alertMessage = document.getElementById("alertMessage");
  const alertText = document.getElementById("alertText");

  const emailInput = document.getElementById("email");
  const startBtn = document.getElementById("startBtn");

  const chooseOtp = document.getElementById("chooseOtp");
  const chooseRecovery = document.getElementById("chooseRecovery");
  const chooseBack = document.getElementById("chooseBack");

  const verifyLabel = document.getElementById("verifyLabel");
  const verifyInput = document.getElementById("verifyInput");
  const verifyInputLabel = document.getElementById("verifyInputLabel");
  const verifyBtn = document.getElementById("verifyBtn");
  const verifyBack = document.getElementById("verifyBack");

  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const resetBtn = document.getElementById("resetBtn");
  const resetBack = document.getElementById("resetBack");

  let resetToken = null; // pwd-reset token from server
  let allowToken = null; // pwd-allow token after verification
  let chosenMethod = null; // 'otp' or 'recovery'

  function showAlert(message, type = "danger") {
    alertText.textContent = message;
    alertMessage.className = `alert alert-${type} alert-dismissible`;
    alertMessage.classList.remove("d-none");

    if (window.Swal) {
      Swal.fire({
        icon: type === "danger" ? "error" : type,
        title: type === "success" ? "Success" : "Notice",
        text: message,
      });
    }
  }

  function clearAlert() {
    alertText.textContent = "";
    alertMessage.className = "alert d-none";
  }

  function showStep(stepEl) {
    [stepEmail, stepChoose, stepVerify, stepReset, stepSuccess].forEach((s) => {
      if (!s) return;
      s.classList.add("d-none");
    });
    stepEl.classList.remove("d-none");
    clearAlert();
  }

  async function post(path, body) {
    try {
      return await BloodApp.apiRequest(path, {
        method: "POST",
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw err;
    }
  }

  // Step 1: submit email
  stepEmail.addEventListener("submit", async (e) => {
    e.preventDefault();
    startBtn.disabled = true;
    try {
      const email = emailInput.value.trim();
      if (!email) throw new Error("Provide your email.");
      const data = await post("/auth/forgot-password", { email });
      // If server returns resetToken (2FA enabled) save it
      if (data && data.resetToken) {
        resetToken = data.resetToken;
        showStep(stepChoose);
      } else {
        // Generic response — move to choose screen where user can pick method but we still need token
        showStep(stepChoose);
      }
    } catch (err) {
      showAlert(err.message || "Request failed");
    } finally {
      startBtn.disabled = false;
    }
  });

  chooseBack.addEventListener("click", (e) => {
    e.preventDefault();
    showStep(stepEmail);
  });

  chooseOtp.addEventListener("click", (e) => {
    e.preventDefault();
    chosenMethod = "otp";
    verifyLabel.textContent =
      "Enter the 6-digit code from your authenticator app.";
    verifyInputLabel.textContent = "Authenticator code";
    verifyInput.value = "";
    showStep(stepVerify);
  });

  chooseRecovery.addEventListener("click", (e) => {
    e.preventDefault();
    chosenMethod = "recovery";
    verifyLabel.textContent =
      "Enter one of your recovery codes (e.g. XXXX-XXXX).";
    verifyInputLabel.textContent = "Recovery code";
    verifyInput.value = "";
    showStep(stepVerify);
  });

  verifyBack.addEventListener("click", (e) => {
    e.preventDefault();
    showStep(stepChoose);
  });

  // Verify step
  stepVerify.addEventListener("submit", async (e) => {
    e.preventDefault();
    verifyBtn.disabled = true;
    try {
      const code = verifyInput.value.trim();
      if (!code) throw new Error("Enter the code.");

      if (!resetToken) {
        // If we don't have resetToken, request forgot-password again to get challenge
        const email = emailInput.value.trim();
        const fresh = await post("/auth/forgot-password", { email });
        if (fresh && fresh.resetToken) {
          resetToken = fresh.resetToken;
        } else {
          throw new Error(
            "Unable to start verification for this account. If you don't have 2FA enabled, contact support or use account recovery.",
          );
        }
      }

      let res;
      if (chosenMethod === "otp") {
        res = await post("/auth/verify-reset-otp", { resetToken, otp: code });
      } else {
        res = await post("/auth/verify-reset-recovery", {
          resetToken,
          recoveryCode: code,
        });
      }

      if (res && res.allowToken) {
        allowToken = res.allowToken;
        showStep(stepReset);
      } else {
        throw new Error("Verification failed.");
      }
    } catch (err) {
      showAlert(err.message || "Verification failed");
    } finally {
      verifyBtn.disabled = false;
    }
  });

  resetBack.addEventListener("click", (e) => {
    e.preventDefault();
    showStep(stepVerify);
  });

  // Reset password
  stepReset.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetBtn.disabled = true;
    try {
      const p = newPassword.value.trim();
      const c = confirmPassword.value.trim();
      if (!p || !c) throw new Error("Provide and confirm the new password.");
      if (p !== c) throw new Error("Passwords do not match.");
      if (!allowToken) throw new Error("Session expired. Start again.");

      await post("/auth/reset-password", {
        allowToken,
        password: p,
        confirm: c,
      });

      showStep(stepSuccess);
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2200);
    } catch (err) {
      showAlert(err.message || "Failed to reset password");
    } finally {
      resetBtn.disabled = false;
    }
  });

  // Initialize
  showStep(stepEmail);
})();
