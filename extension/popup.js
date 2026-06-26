const API_BASE = "http://localhost:5003/api";
const PRODUCTS_URL = `${API_BASE}/products`;
const AUTH_URL = `${API_BASE}/auth`;

const loginView = document.getElementById("loginView");
const saveView = document.getElementById("saveView");

const loginHeading = document.getElementById("loginHeading");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const nameField = document.getElementById("nameField");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmitButton = document.getElementById("authSubmitButton");
const authMessage = document.getElementById("authMessage");

const accountEmail = document.getElementById("accountEmail");
const logoutButton = document.getElementById("logoutButton");
const titleElement = document.getElementById("productTitle");
const sourceElement = document.getElementById("productSource");
const notesElement = document.getElementById("notes");
const collectionElement = document.getElementById("collection");
const saveButton = document.getElementById("saveButton");
const statusMessage = document.getElementById("statusMessage");

let currentProduct = null;
let authMode = "login";

function getSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["pocketcart_token", "pocketcart_user"], (result) => {
      resolve({
        token: result.pocketcart_token || null,
        user: result.pocketcart_user || null,
      });
    });
  });
}

function saveSession(token, user) {
  return new Promise((resolve) => {
    chrome.storage.local.set(
      { pocketcart_token: token, pocketcart_user: user },
      resolve
    );
  });
}

function clearSession() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(["pocketcart_token", "pocketcart_user"], resolve);
  });
}



function showLoginView(message = "") {
  loginView.classList.remove("hidden");
  saveView.classList.add("hidden");
  authMessage.textContent = message;
}

function showSaveView(user) {
  loginView.classList.add("hidden");
  saveView.classList.remove("hidden");
  accountEmail.textContent = user?.email || "";
}

function setAuthMode(mode) {
  authMode = mode;
  const isLogin = mode === "login";

  tabLogin.classList.toggle("active", isLogin);
  tabSignup.classList.toggle("active", !isLogin);
  nameField.classList.toggle("hidden", isLogin);
  loginHeading.textContent = isLogin ? "Log in" : "Sign up";
  authSubmitButton.textContent = isLogin ? "Log in" : "Create account";
  authMessage.textContent = "";
}



async function handleAuthSubmit() {
  const email = authEmail.value.trim();
  const password = authPassword.value;
  const name = authName.value.trim();

  if (!email || !password) {
    authMessage.textContent = "Email and password are required";
    return;
  }

  authSubmitButton.disabled = true;
  authMessage.textContent = "Please wait...";

  const endpoint = authMode === "login" ? "login" : "signup";
  const payload = authMode === "login" ? { email, password } : { email, password, name };

  try {
    const response = await fetch(`${AUTH_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      authMessage.textContent = data.message || "Something went wrong";
      authSubmitButton.disabled = false;
      return;
    }

    await saveSession(data.token, data.user);
    authPassword.value = "";
    showSaveView(data.user);
    loadCurrentTab();
  } catch (error) {
    authMessage.textContent = "Could not connect to backend";
  } finally {
    authSubmitButton.disabled = false;
  }
}

async function handleLogout() {
  await clearSession();
  showLoginView();
}


function extractPageData() {
  const getMeta = (selector) => {
    return document.querySelector(selector)?.content || "";
  };

  const title =
    getMeta('meta[property="og:title"]') ||
    getMeta('meta[name="twitter:title"]') ||
    document.title ||
    "Untitled product";

  const image =
    getMeta('meta[property="og:image"]') ||
    getMeta('meta[name="twitter:image"]') ||
    "";

  const price =
    getMeta('meta[property="product:price:amount"]') ||
    getMeta('meta[property="og:price:amount"]') ||
    "";

  return {
    title,
    image,
    price,
  };
}

async function loadCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];

  const url = tab.url;
  const source = new URL(url).hostname;

  let pageData = {
    title: tab.title || "Untitled product",
    image: "",
    price: "",
  };

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData,
    });

    pageData = results[0]?.result || pageData;
  } catch (error) {
    console.error("Could not extract page metadata:", error);
  }

  currentProduct = {
    title: pageData.title,
    url,
    source,
    image: pageData.image,
    price: pageData.price,
  };

  titleElement.textContent = currentProduct.title;
  sourceElement.textContent = currentProduct.source;
}

async function saveProduct() {
  if (!currentProduct) {
    return;
  }

  const { token } = await getSession();

  if (!token) {
    showLoginView("Please log in to save products");
    return;
  }

  saveButton.disabled = true;
  statusMessage.textContent = "Saving...";

  const productToSave = {
    ...currentProduct,
    notes: notesElement.value,
    collection: collectionElement.value || "Uncategorized",
  };

  try {
    const response = await fetch(PRODUCTS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productToSave),
    });

    const data = await response.json();

    if (response.status === 401) {

      await clearSession();
      saveButton.disabled = false;
      showLoginView("Your session expired. Please log in again.");
      return;
    }

    if (!response.ok) {
      statusMessage.textContent = data.message || "Could not save product";
      saveButton.disabled = false;
      return;
    }

    statusMessage.textContent = "Saved to PocketCart";
    saveButton.textContent = "Saved";

    setTimeout(() => {
      saveButton.disabled = false;
      saveButton.textContent = "Save to PocketCart";
    }, 1200);
  } catch (error) {
    statusMessage.textContent = "Could not connect to backend";
    saveButton.disabled = false;
  }
}


tabLogin.addEventListener("click", () => setAuthMode("login"));
tabSignup.addEventListener("click", () => setAuthMode("signup"));
authSubmitButton.addEventListener("click", handleAuthSubmit);
logoutButton.addEventListener("click", handleLogout);
saveButton.addEventListener("click", saveProduct);

authPassword.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleAuthSubmit();
  }
});


async function init() {
  setAuthMode("login");
  const { token, user } = await getSession();

  if (token && user) {
    showSaveView(user);
    loadCurrentTab();
  } else {
    showLoginView();
  }
}

init();