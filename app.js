const storageKey = "company-tracker-items";

const companyForm = document.getElementById("companyForm");
const companyNameInput = document.getElementById("companyName");
const companyInfoInput = document.getElementById("companyInfo");
const companyList = document.getElementById("companyList");
const companyCount = document.getElementById("companyCount");
const emptyState = document.getElementById("emptyState");
const clearAllBtn = document.getElementById("clearAllBtn");

const state = {
  companies: loadCompanies(),
};

function loadCompanies() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCompanies() {
  localStorage.setItem(storageKey, JSON.stringify(state.companies));
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function createCompanyCard(company) {
  const item = document.createElement("li");
  item.className = "company-card";

  const topRow = document.createElement("div");
  topRow.className = "company-card-top";

  const content = document.createElement("div");

  const name = document.createElement("h3");
  name.className = "company-name";
  name.textContent = company.name;

  const info = document.createElement("p");
  info.className = "company-info";
  info.textContent = company.info;

  const meta = document.createElement("div");
  meta.className = "company-meta";

  const time = document.createElement("span");
  time.className = "company-time";
  time.textContent = `Added ${formatDate(company.createdAt)}`;

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    state.companies = state.companies.filter((entry) => entry.id !== company.id);
    saveCompanies();
    renderCompanies();
  });

  content.append(name, info);
  meta.append(time, deleteButton);
  topRow.append(content);
  item.append(topRow, meta);

  return item;
}

function renderCompanies() {
  companyList.replaceChildren();

  companyCount.textContent = String(state.companies.length);
  emptyState.hidden = state.companies.length > 0;

  const fragment = document.createDocumentFragment();
  state.companies
    .slice()
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .forEach((company) => {
      fragment.append(createCompanyCard(company));
    });

  companyList.append(fragment);
}

function addCompany(name, info) {
  state.companies.unshift({
    id: crypto.randomUUID(),
    name,
    info,
    createdAt: new Date().toISOString(),
  });

  saveCompanies();
  renderCompanies();
}

companyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = companyNameInput.value.trim();
  const info = companyInfoInput.value.trim();

  if (!name || !info) {
    return;
  }

  addCompany(name, info);
  companyForm.reset();
  companyNameInput.focus();
});

clearAllBtn.addEventListener("click", () => {
  const shouldClear = window.confirm("Remove all saved companies?");
  if (!shouldClear) {
    return;
  }

  state.companies = [];
  saveCompanies();
  renderCompanies();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.error("SW registration failed:", err);
    });
  });
}

renderCompanies();