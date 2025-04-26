import { widgetConfig } from "./config.js";

export function handleResponse(responseJson, formId = null) {
  if (widgetConfig.integrationMode === "debug") {
    renderDebug(responseJson);
  } else if (widgetConfig.integrationMode === "form-fill") {
    fillForm(responseJson, formId);
  }
}

function renderDebug(json) {
  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(json, null, 2);
  document.body.appendChild(pre);
}

function fillForm(json, formId) {
  const form = formId ? document.getElementById(formId) : document;
  Object.entries(json).forEach(([key, value]) => {
    const input = form.querySelector(`#${key}`);
    if (input) {
      input.value = value;
    }
  });
}