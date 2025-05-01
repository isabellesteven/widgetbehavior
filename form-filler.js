import { widgetConfig } from "./config.js";

export function handleResponse(responseJson, formId = null) {
  if (widgetConfig.integrationMode === "debug") {
    renderDebug(responseJson);
  } else if (widgetConfig.integrationMode === "form-fill") {
    console.log("In handleResonse", responseJson);
    fillForm(responseJson, formId);
  }
}

function renderDebug(json) {
  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(json, null, 2);
  document.body.appendChild(pre);
}

function fillForm(data, formId) {
  // Flatten the object if necessary
  if (Object.keys(data).length === 1 && typeof Object.values(data)[0] === 'object') {
    data = Object.values(data)[0];
  }
  
  
  const excludedKeys = new Set(["sessionId", "app_template"]);
  for (const [key, value] of Object.entries(data)) {
    if (excludedKeys.has(key)) continue;
    console.log("In fillform", key);
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, "_");
    const input = document.getElementById(key) || document.getElementById(normalizedKey);
    console.log("in formfill input" , input);
    if (input) {
      _fillInput(input, value, key);
    } else {
      const radios = document.querySelectorAll(`input[type="radio"][name="${key}"]`);
      if (radios.length > 0) {
        _fillRadioGroup(radios, value, key);
      } else {
        console.warn(`🔍 Field not found in DOM for key: "${key}"`);
      }
    }
  }

  function _fillInput(input, value, key) {
    if (input.type === "radio") {
      const radios = document.querySelectorAll(`input[type="radio"][name="${input.name}"]`);
      this._fillRadioGroup(radios, value, key);
    } else {
      input.value = value || "";
      console.log(`✅ Filled "${key}" into #${input.id}`);
    }
  }

  function _fillRadioGroup(radios, value, key) {
    let matched = false;
    radios.forEach(radio => {
      if (radio.value === value) {
        radio.checked = true;
        matched = true;
      }
    });
    matched
      ? console.log(`🔘 Selected radio "${value}" for "${key}"`)
      : console.warn(`⚠️ No radio option matched value "${value}" for "${key}"`);
  }
}