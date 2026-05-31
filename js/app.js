(() => {
  const API_BASE_URL =
    window.BloodDonationAPIBaseUrl ||
    "https://blood-donation-web-app-1-qe5l.onrender.com/api";
  const TOKEN_KEY = "bloodDonationToken";
  const USER_KEY = "bloodDonationUser";

  function normalizeUser(user) {
    if (!user) {
      return null;
    }

    const normalizedUser = { ...user };

    if (normalizedUser._id && !normalizedUser.id) {
      normalizedUser.id = String(normalizedUser._id);
    }

    if (normalizedUser.id && !normalizedUser._id) {
      normalizedUser._id = normalizedUser.id;
    }

    return normalizedUser;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? normalizeUser(JSON.parse(rawUser)) : null;
  }

  function getSession() {
    return getUser();
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function redirectByRole(user) {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    if (user.role === "donor") {
      window.location.href = "donor-dashboard.html";
      return;
    }

    if (user.role === "receiver") {
      window.location.href = "receiver-dashboard.html";
      return;
    }

    if (user.role === "admin") {
      window.location.href = "admin-dashboard.html";
      return;
    }

    window.location.href = "index.html";
  }

  function requireRole(allowedRoles, fallbackUrl = "login.html") {
    const user = getSession();
    const token = getToken();

    if (!user || !token) {
      window.location.href = fallbackUrl;
      return null;
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(user.role)) {
      window.location.href = fallbackUrl;
      return null;
    }

    return user;
  }

  async function apiRequest(path, options = {}) {
    const token = getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    } catch (error) {
      throw new Error(
        `Unable to connect to the API server at ${API_BASE_URL}. Start the backend with \"npm run dev\" inside the backend folder, then try again.`,
      );
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  window.BloodApp = {
    API_BASE_URL,
    getToken,
    getUser,
    getSession,
    setSession,
    clearSession,
    redirectByRole,
    requireRole,
    apiRequest,
    formatDate,
    escapeHtml,
  };
})();
