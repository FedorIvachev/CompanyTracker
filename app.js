const storageKey = "company-tracker-items";
const settingsKey = "company-tracker-settings";

const defaultSettings = {
  aiEndpoint: "",
  aiDeployment: "gpt-4.1",
  aiVersion: "2025-01-01-preview",
  aiKey: "",
  speechRegion: "koreacentral"
};

const companyForm = document.getElementById("companyForm");
const editIdInput = document.getElementById("editId");
const companyNameInput = document.getElementById("companyName");
const positionInput = document.getElementById("position");
const locationInput = document.getElementById("location");
const interviewStateInput = document.getElementById("interviewState");
const positionDescriptionInput = document.getElementById("positionDescription");
const descriptionZhInput = document.getElementById("descriptionZh");
const otherInfoInput = document.getElementById("otherInfo");

const settingsModal = document.getElementById("settingsModal");
const settingsForm = document.getElementById("settingsForm");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const aiEndpointInput = document.getElementById("aiEndpoint");
const aiDeploymentInput = document.getElementById("aiDeployment");
const aiVersionInput = document.getElementById("aiVersion");
const aiKeyInput = document.getElementById("aiKey");
const speechRegionInput = document.getElementById("speechRegion");

const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const companyList = document.getElementById("companyList");
const companyCount = document.getElementById("companyCount");
const emptyState = document.getElementById("emptyState");
const clearAllBtn = document.getElementById("clearAllBtn");
const exportBtn = document.getElementById("exportBtn");
const importInput = document.getElementById("importInput");
const aiImportInput = document.getElementById("aiImportInput");

const aiStatus = document.getElementById("aiStatus");
const aiLog = document.getElementById("aiLog");
const aiCurrentTask = document.getElementById("aiCurrentTask");
const aiProgressFill = document.querySelector(".ai-progress-fill");
const closeAiStatus = document.getElementById("closeAiStatus");

const state = {
  companies: loadCompanies(),
  settings: loadSettings(),
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(settingsKey);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(settings) {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
  state.settings = settings;
}

function updateSettingsUI() {
  const s = state.settings;
  aiEndpointInput.value = s.aiEndpoint;
  aiDeploymentInput.value = s.aiDeployment;
  aiVersionInput.value = s.aiVersion;
  aiKeyInput.value = s.aiKey;
  speechRegionInput.value = s.speechRegion;
}

openSettingsBtn.addEventListener("click", () => {
  updateSettingsUI();
  settingsModal.hidden = false;
});

closeSettingsBtn.addEventListener("click", () => {
  settingsModal.hidden = true;
});

settingsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newSettings = {
    aiEndpoint: aiEndpointInput.value.trim(),
    aiDeployment: aiDeploymentInput.value.trim(),
    aiVersion: aiVersionInput.value.trim(),
    aiKey: aiKeyInput.value.trim(),
    speechRegion: speechRegionInput.value.trim(),
  };
  saveSettings(newSettings);
  settingsModal.hidden = true;
  alert("Settings saved locally.");
});

resetSettingsBtn.addEventListener("click", () => {
  if (confirm("Reset all settings to defaults? Keys will be cleared.")) {
    state.settings = { ...defaultSettings };
    updateSettingsUI();
  }
});

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
  content.style.width = "100%";

  const stateBadge = document.createElement("span");
  const stateClass = `state-${(company.interviewState || 'researching').toLowerCase().replace(' ', '-')}`;
  stateBadge.className = `badge ${stateClass}`;
  stateBadge.textContent = company.interviewState || 'Researching';

  const name = document.createElement("h3");
  name.className = "company-name";
  name.textContent = company.name;

  const subHeader = document.createElement("p");
  subHeader.style.color = "var(--accent)";
  subHeader.style.fontSize = "0.95rem";
  subHeader.style.margin = "-4px 0 12px";
  subHeader.textContent = company.position;

  const detailGrid = document.createElement("div");
  detailGrid.className = "detail-grid";

  const addDetail = (label, value, isZh = false) => {
    if (!value) return;
    const div = document.createElement("div");
    div.className = "detail-item";
    div.innerHTML = `<span class="detail-label">${label}</span><p class="detail-value ${isZh ? 'zh-text' : ''}">${value}</p>`;
    detailGrid.append(div);
  };

  addDetail("Location", company.location);
  addDetail("Position Description", company.positionDescription);
  addDetail("Chinese Description", company.descriptionZh, true);
  addDetail("Other Info", company.otherInfo);

  const meta = document.createElement("div");
  meta.className = "company-meta";

  const time = document.createElement("span");
  time.className = "company-time";
  time.textContent = `Added ${formatDate(company.createdAt)}`;

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "secondary";
  editButton.style.padding = "6px 12px";
  editButton.style.fontSize = "0.85rem";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", () => {
    editIdInput.value = company.id;
    companyNameInput.value = company.name;
    positionInput.value = company.position || "";
    locationInput.value = company.location || "";
    interviewStateInput.value = company.interviewState || "Researching";
    positionDescriptionInput.value = company.positionDescription || "";
    descriptionZhInput.value = company.descriptionZh || "";
    otherInfoInput.value = company.otherInfo || "";
    
    submitBtn.textContent = "Update company";
    cancelEditBtn.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    companyNameInput.focus();
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "danger";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", () => {
    state.companies = state.companies.filter((entry) => entry.id !== company.id);
    saveCompanies();
    renderCompanies();
  });

  content.append(stateBadge, name, subHeader, detailGrid);
  meta.append(time, editButton, deleteButton);
  topRow.append(content);
  item.append(topRow, meta);

  return item;
}

closeAiStatus.addEventListener("click", () => {
  aiStatus.hidden = true;
});

async function callAzureOpenAI(messages) {
  const { aiEndpoint, aiDeployment, aiVersion, aiKey } = state.settings;
  if (!aiKey || !aiEndpoint) {
    throw new Error("Missing Azure OpenAI Key or Endpoint in Settings.");
  }

  // Ensure endpoint is just the base (e.g., https://res.openai.azure.com)
  // Strip any accidental path appended to the endpoint
  const baseUrl = aiEndpoint.split("/openai/")[0].replace(/\/+$/, "");
  const url = `${baseUrl}/openai/deployments/${aiDeployment}/chat/completions?api-version=${aiVersion}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": aiKey
      },
      body: JSON.stringify({
        messages,
        temperature: 0,
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("401 Unauthorized: The API Key is invalid or expired.");
      }
      if (response.status === 404) {
        throw new Error("404 Not Found: Check if your Deployment Name and Endpoint are correct.");
      }
      const err = await response.json();
      throw new Error(err.error?.message || `Request failed (${response.status})`);
    }
    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error("Network Error: Could not reach the endpoint. Check your Endpoint URL and CORS settings.");
    }
    throw err;
  }
}

aiImportInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  aiStatus.hidden = false;
  aiLog.textContent = `Reading file: ${file.name}...\n`;
  aiProgressFill.style.width = "10%";
  aiCurrentTask.textContent = "Uploading to GPT-4.1 for parsing...";

  const reader = new FileReader();
  reader.onload = async (event) => {
    const rawText = event.target.result;
    
    try {
      aiLog.textContent += `Original content length: ${rawText.length} bytes.\n`;
      aiLog.textContent += "Calling Azure OpenAI...\n";
      aiProgressFill.style.width = "30%";

      const prompt = `
        You are an expert data parser. You are given a raw CSV (or unstructured text) representing a list of companies someone is tracking for job applications.
        
        Extract the data and return a VALID JSON array of objects. 
        Each object MUST have these keys:
        - "name": Company name
        - "website": URL or domain (if found)
        - "status": One of "Apply", "Interview", "Offer", "Rejected", "Wishlist". Deduce or default to "Apply".
        - "notes": Any specific notes or descriptions.
        - "location": City/Country if mentioned.
        - "otherInfo": Any other metadata.

        CSV/TEXT DATA:
        """
        ${rawText}
        """

        Response: RETURN ONLY THE JSON ARRAY. NO MARKDOWN PROSE.
      `;

      const result = await callAzureOpenAI([
        { role: "system", content: "You are a data extraction tool. You convert raw CSV/text into a clean JSON array of company objects." },
        { role: "user", content: prompt }
      ]);

      aiProgressFill.style.width = "70%";
      aiCurrentTask.textContent = "Processing response...";
      
      const content = result.choices[0].message.content;
      // Extract JSON if model wrapped it in markdown
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      const parsedData = JSON.parse(jsonMatch ? jsonMatch[0] : content);

      if (Array.isArray(parsedData)) {
        // Assign new IDs to avoid collisions
        const startId = Date.now();
        const finalData = parsedData.map((item, idx) => ({
          ...item,
          id: startId + idx,
          status: item.status || "Apply",
          notes: item.notes || "",
          website: item.website || "",
          location: item.location || "",
          otherInfo: item.otherInfo || ""
        }));

        state.companies = [...finalData, ...state.companies]; // Prepend new items
        saveCompanies();
        renderCompanies();
        aiLog.textContent += `Success! Imported ${finalData.length} companies via AI parser.\n`;
      }

      aiProgressFill.style.width = "100%";
      aiCurrentTask.textContent = "Done!";
      
    } catch (error) {
      aiLog.textContent += `\nERROR: ${error.message}\n`;
      aiCurrentTask.textContent = "Failed.";
      aiProgressFill.style.backgroundColor = "var(--danger)";
    } finally {
      aiImportInput.value = ""; // Clear for next use
    }
  };

  reader.readAsText(file);
});

function renderCompanies() {
  companyList.replaceChildren();

  companyCount.textContent = String(state.companies.length);
  
  // Use a more robust way to hide the empty state
  if (state.companies.length > 0) {
    emptyState.style.display = "none";
  } else {
    emptyState.style.display = "grid";
  }

  const fragment = document.createDocumentFragment();
  state.companies
    .slice()
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .forEach((company) => {
      fragment.append(createCompanyCard(company));
    });

  companyList.append(fragment);
}

function addCompany(data) {
  state.companies.unshift({
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  });

  saveCompanies();
  renderCompanies();
}

function updateCompany(id, data) {
  const index = state.companies.findIndex(c => c.id === id);
  if (index !== -1) {
    state.companies[index] = {
      ...state.companies[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    saveCompanies();
    renderCompanies();
  }
}

function resetForm() {
  companyForm.reset();
  editIdInput.value = "";
  submitBtn.textContent = "Add company";
  cancelEditBtn.hidden = true;
}

companyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = editIdInput.value;
  const data = {
    name: companyNameInput.value.trim(),
    position: positionInput.value.trim(),
    location: locationInput.value.trim(),
    interviewState: interviewStateInput.value,
    positionDescription: positionDescriptionInput.value.trim(),
    descriptionZh: descriptionZhInput.value.trim(),
    otherInfo: otherInfoInput.value.trim()
  };

  if (!data.name || !data.position) {
    alert("Company and Position are required.");
    return;
  }

  if (id) {
    updateCompany(id, data);
  } else {
    addCompany(data);
  }
  
  resetForm();
  companyNameInput.focus();
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

clearAllBtn.addEventListener("click", () => {
  const shouldClear = window.confirm("Remove all saved companies?");
  if (!shouldClear) {
    return;
  }

  state.companies = [];
  saveCompanies();
  renderCompanies();
}); // <--- Added missing closing brace and parenthesis here

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
    const headers = "Name,Position,Location,InterviewState,PositionDescription,DescriptionZh,OtherInfo,CreatedAt";
    const rows = state.companies.map((c, i) => {
      const row = [
        escapeCSV(c.name),
        escapeCSV(c.position),
        escapeCSV(c.location),
        escapeCSV(c.interviewState),
        escapeCSV(c.positionDescription),
        escapeCSV(c.descriptionZh),
        escapeCSV(c.otherInfo),
        escapeCSV(c.createdAt)
      ].join(",");
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
        const clean = (val) => val ? val.replace(/^"|"$/g, '').replace(/""/g, '"') : "";
        
        newData.push({
          id: crypto.randomUUID(),
          name: clean(cells[0]),
          position: clean(cells[1]),
          location: clean(cells[2]),
          interviewState: clean(cells[3]) || "Researching",
          positionDescription: clean(cells[4]),
          descriptionZh: clean(cells[5]),
          otherInfo: clean(cells[6]),
          createdAt: clean(cells[7]) || new Date().toISOString()
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
      alert("No valid data found in CSV. Expected headers: Name, Position, Location, InterviewState, PositionDescription, DescriptionZh, OtherInfo, CreatedAt");
    }
    importInput.value = ""; // Reset input
  };
  reader.readAsText(file);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.error("SW registration failed:", err);
    });
  });
}

renderCompanies();