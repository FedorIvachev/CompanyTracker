const storageKey = "company-tracker-items";

const companyForm = document.getElementById("companyForm");
const companyNameInput = document.getElementById("companyName");
const companyInfoInput = document.getElementById("companyInfo");
const companyList = document.getElementById("companyList");
const companyCount = document.getElementById("companyCount");
const emptyState = document.getElementById("emptyState");
const clearAllBtn = document.getElementById("clearAllBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");

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
function escapeCSV(str) {
  if (typeof str !== 'string') return '""';
  return `"${str.replace(/"/g, '""')}"`;
}

exportBtn.addEventListener("click", () => {
  console.log("[EXPORT] Button clicked. Checking state...");
  console.log("[EXPORT] Current company count:", state.companies.length);
  
  if (state.companies.length === 0) {
    console.warn("[EXPORT] No data found. Aborting.");
    alert("The company list is empty. Add a company first!");
    return;
  }

  try {
    console.log("[EXPORT] Generating CSV string...");
    const headers = "Name,Info,CreatedAt";
    const rows = state.companies.map((c, i) => {
      const row = `${escapeCSV(c.name)},${escapeCSV(c.info)},${escapeCSV(c.createdAt)}`;
      console.log(`[EXPORT] Processing row ${i + 1}:`, c.name);
      return row;
    });
    
    const csvString = [headers, ...rows].join("\r\n");
    console.log("[EXPORT] CSV Generated (length):", csvString.length);

    // Using a more standard Blob approach which usually works best for CSVs
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    
    console.log("[EXPORT] Object URL created:", url);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `jobs_export_${new Date().getTime()}.csv`);
    
    // Some browsers require the link to be in the body
    document.body.appendChild(link);
    console.log("[EXPORT] Triggering download via link click...");
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log("[EXPORT] Done.");
  } catch (error) {
    console.error("[EXPORT] FATAL ERROR:", error);
    alert("Export failed. Check the developer console for logs.");
  }
});

importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split("\n").filter(line => line.trim() !== "");
    
    // Simple CSV parser (assuming headers: Name, Info, CreatedAt)
    // This handles quoted values with double-quotes
    const newData = [];
    const rows = lines.slice(1); // Skip header

    for (const row of rows) {
      // Regex to split by comma but ignore commas inside quotes
      const cells = row.match(/(".*?"|[^",\n\r]+)(?=\s*,|\s*$)/g);
      
      if (cells && cells.length >= 2) {
        const name = cells[0].replace(/^"|"$/g, '').replace(/""/g, '"');
        const info = cells[1].replace(/^"|"$/g, '').replace(/""/g, '"');
        const createdAt = cells[2] 
          ? cells[2].replace(/^"|"$/g, '').replace(/""/g, '"') 
          : new Date().toISOString();

        newData.push({
          id: crypto.randomUUID(),
          name,
          info,
          createdAt
        });
      }
    }

    if (newData.length > 0) {
      if (confirm(`Import ${newData.length} companies? This will add to your existing list.`)) {
        state.companies = [...newData, ...state.companies];
        saveCompanies();
        renderCompanies();
      }
    } else {
      alert("No valid data found in CSV. Expected headers: Name, Info, CreatedAt");
    }
    importInput.value = ""; // Reset input
  };
  reader.readAsText(file);
});

});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.error("SW registration failed:", err);
    });
  });
}

renderCompanies();