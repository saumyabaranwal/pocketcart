const API_URL = "http://localhost:5003/api/products";

const titleElement = document.getElementById("productTitle");
const sourceElement = document.getElementById("productSource");
const notesElement = document.getElementById("notes");
const collectionElement = document.getElementById("collection");
const saveButton = document.getElementById("saveButton");
const statusMessage = document.getElementById("statusMessage");

let currentProduct = null;

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

  saveButton.disabled = true;
  statusMessage.textContent = "Saving...";

  const productToSave = {
    ...currentProduct,
    notes: notesElement.value,
    collection: collectionElement.value || "Uncategorized",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productToSave),
    });

    const data = await response.json();

    if (!response.ok) {
      statusMessage.textContent = data.message || "Could not save product";
      saveButton.disabled = false;
      return;
    }

    statusMessage.textContent = "Saved to PocketCart";
    saveButton.textContent = "Saved";
  } catch (error) {
    statusMessage.textContent = "Could not connect to backend";
    saveButton.disabled = false;
  }
}

saveButton.addEventListener("click", saveProduct);

loadCurrentTab();