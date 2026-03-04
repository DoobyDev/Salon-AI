const loginForm = document.getElementById("loginForm");
const loginRole = document.getElementById("loginRole");
const loginRoleAdminOption = document.getElementById("loginRoleAdminOption");
const developerAdminAccess = document.getElementById("developerAdminAccess");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMsg = document.getElementById("loginMsg");

const registerForm = document.getElementById("registerForm");
const registerRole = document.getElementById("registerRole");
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerMsg = document.getElementById("registerMsg");
const subscriberFields = document.getElementById("subscriberFields");
const customerFields = document.getElementById("customerFields");
const customerCountry = document.getElementById("customerCountry");

const businessName = document.getElementById("businessName");
const businessType = document.getElementById("businessType");
const businessCity = document.getElementById("businessCity");
const businessCountry = document.getElementById("businessCountry");
const businessPostcode = document.getElementById("businessPostcode");
const businessPhone = document.getElementById("businessPhone");
const onboardingTemplatePreview = document.getElementById("onboardingTemplatePreview");
const AUTH_TOKEN_KEY = "salon_ai_token";
const AUTH_USER_KEY = "salon_ai_user";

const onboardingTemplates = {
  hair_salon: {
    label: "Hair Salon",
    services: ["Haircut", "Blowout", "Color Refresh"],
    hours: "Mon-Wed 9:00-18:00, Thu-Fri 9:00-20:00, Sat 9:00-17:00"
  },
  barbershop: {
    label: "Barbershop",
    services: ["Skin Fade", "Classic Cut", "Beard Trim"],
    hours: "Mon-Wed 9:00-19:00, Thu-Fri 9:00-20:00, Sat 10:00-18:00"
  },
  beauty_salon: {
    label: "Beauty Salon",
    services: ["Signature Facial", "Brow Shaping", "Gel Manicure"],
    hours: "Mon-Wed 10:00-18:00, Thu-Fri 10:00-19:00, Sat 9:00-17:00"
  }
};

function t(key, fallback, vars) {
  return String(fallback || "");
}

function setMessage(el, text, ok = true) {
  el.textContent = text;
  el.style.color = ok ? "#7cead8" : "#ff8d72";
}

function setAdminLoginVisible(isVisible) {
  if (!loginRoleAdminOption) return;
  loginRoleAdminOption.hidden = !isVisible;
}

function saveSessionAuth(token, user) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  // Clear any previous persistent auth so credentials are not auto-restored.
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function syncRoleFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role");
  const mode = params.get("mode");
  setAdminLoginVisible(false);
  if (role && ["subscriber", "customer"].includes(role)) {
    loginRole.value = role;
    registerRole.value = role;
  }
  if (mode === "register") {
    registerName.focus();
  }
}

function toggleSubscriberFields() {
  const isSubscriber = registerRole.value === "subscriber";
  const isCustomer = registerRole.value === "customer";
  subscriberFields.style.display = isSubscriber ? "grid" : "none";
  if (customerFields) customerFields.style.display = isCustomer ? "grid" : "none";
  [businessName, businessType, businessCity, businessCountry, businessPostcode, businessPhone].forEach((el) => {
    el.required = isSubscriber;
  });
  if (customerCountry) customerCountry.required = false;
  renderOnboardingTemplatePreview();
}

registerRole.addEventListener("change", toggleSubscriberFields);
businessType?.addEventListener("change", () => {
  renderOnboardingTemplatePreview();
});

function renderOnboardingTemplatePreview() {
  if (!onboardingTemplatePreview) return;
  if (registerRole.value !== "subscriber") {
    onboardingTemplatePreview.style.display = "none";
    return;
  }
  onboardingTemplatePreview.style.display = "block";
  const key = String(businessType?.value || "hair_salon").trim().toLowerCase();
  const template = onboardingTemplates[key] || onboardingTemplates.hair_salon;
  onboardingTemplatePreview.innerHTML = `
    <strong>Starter Template: ${template.label}</strong>
    <small><strong>Default services:</strong> ${template.services.join(", ")}</small>
    <small><strong>Default hours:</strong> ${template.hours}, Sun Closed</small>
  `;
}

developerAdminAccess?.addEventListener("click", () => {
  setAdminLoginVisible(true);
  loginRole.value = "admin";
  setMessage(loginMsg, t("auth.admin_login_enabled", "Admin login enabled. Restricted access for developer and maintenance use only."), true);
  loginEmail.focus();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage(loginMsg, t("auth.signing_in", "Signing in..."), true);
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail.value.trim(),
        password: loginPassword.value,
        requestedRole: loginRole.value
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t("auth.failed_sign_in", "Failed to sign in."));
    saveSessionAuth(data.token, data.user);
    setMessage(loginMsg, t("auth.signed_in_redirecting", "Signed in. Redirecting..."), true);
    window.location.href = `/dashboard?role=${data.user.role}`;
  } catch (error) {
    setMessage(loginMsg, error.message, false);
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const role = registerRole.value;
  setMessage(registerMsg, t("auth.creating_account", "Creating account..."), true);

  try {
    let endpoint = "";
    let payload = {};

    if (role === "customer") {
      endpoint = "/api/auth/register/customer";
      payload = {
        name: registerName.value.trim(),
        email: registerEmail.value.trim(),
        password: registerPassword.value,
        country: String(customerCountry?.value || "").trim()
      };
    } else {
      endpoint = "/api/auth/register/subscriber";
      payload = {
        name: registerName.value.trim(),
        email: registerEmail.value.trim(),
        password: registerPassword.value,
        businessType: businessType.value,
        businessName: businessName.value.trim(),
        city: businessCity.value.trim(),
        country: businessCountry.value.trim(),
        postcode: businessPostcode.value.trim(),
        phone: businessPhone.value.trim()
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t("auth.registration_failed", "Registration failed."));

    saveSessionAuth(data.token, data.user);
    setMessage(registerMsg, t("auth.account_created_redirecting", "Account created. Redirecting..."), true);
    window.location.href = `/dashboard?role=${data.user.role}`;
  } catch (error) {
    setMessage(registerMsg, error.message, false);
  }
});

localStorage.removeItem(AUTH_TOKEN_KEY);
localStorage.removeItem(AUTH_USER_KEY);
syncRoleFromQuery();
toggleSubscriberFields();
if (loginEmail) loginEmail.value = "";
if (loginPassword) loginPassword.value = "";
if (registerName) registerName.value = "";
if (registerEmail) registerEmail.value = "";
if (registerPassword) registerPassword.value = "";
