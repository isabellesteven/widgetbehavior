import { Recorder } from "./recorder.js";
import { uploadAudio } from "./uploader.js";
import { handleResponse } from "./form-filler.js";
import { widgetConfig } from "./config.js";

class VoiceWidget {
  constructor(formId = null, scriptElement = null) {
    if (!formId) {
      console.error("❌ VoiceWidget requires a formId");
      return;
    }
    this.formId = formId;
    this.scriptElement = scriptElement;
    this.recorder = new Recorder();
    this.sessionId = this.generateSessionId();
    this.selectedDeviceId = null;
    this.injectStyles();
    this.createDOM();
    this.setupUI();
  }

  injectStyles() {
    if (document.getElementById("qiqi-style")) return;

    const style = document.createElement("style");
    style.id = "qiqi-style";
    style.textContent = `
      .qiqi-widget-inline {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        font-family: sans-serif;
      }
      .qiqi-controls {
        display: flex;
        align-items: center;
        gap: 4px;
        background: none;
        border: none;
        padding: 0;
        box-shadow: none;
      }
      .qiqi-brand {
        font-size: 10px;
        color: #999;
        margin-top: 4px;
        font-style: italic;
      }
      .qiqi-brand a {
        color: #666;
        text-decoration: none;
      }
      .qiqi-brand a:hover {
        text-decoration: underline;
      }
      .qiqi-hidden {
        display: none;
      }
      .qiqi-pulsing {
        animation: pulse 1s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.2); filter: brightness(1.5); }
        100% { transform: scale(1); filter: brightness(1); }
      }
      .qiqi-spinner {
        position: absolute;
        top: -5px;
        right: -5px;
        width: 16px;
        height: 16px;
        border: 2px solid #ccc;
        border-top: 2px solid #e60023;
        border-radius: 50%;
        animation: qiqi-spin 1s linear infinite;
      }
      .qiqi-mic-wrapper {
        position: relative;
        display: inline-block;
      }
      @keyframes qiqi-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  createDOM() {
    this.container = document.createElement("div");
    this.container.className = "qiqi-widget-inline";

    const uid = this.sessionId;

    this.container.innerHTML = `
      <div class="qiqi-controls">
      <div class="qiqi-mic-wrapper">
        <button id="qiqiMicBtn-${uid}" title="Start recording">
          <img src="https://isabellesteven.github.io/widgetbehavior/mic-icon-red.png" alt="Record" style="width: 30px;" />
        </button>
        <div id="qiqiSpinner-${uid}" class="qiqi-spinner qiqi-hidden"></div>
        </div>
        <button id="qiqiDropdownBtn-${uid}" title="Choose mic">▼</button>
        <select id="qiqiMicSelect-${uid}" class="qiqi-hidden"></select>
      </div>
      <div class="qiqi-brand">
        <small>Powered by <a href="https://voxfields.com" target="_blank">Voxfields</a></small>
      </div>
    `;

    this.scriptElement.parentNode.insertBefore(this.container, this.scriptElement.nextSibling);
  }

  setupUI() {
    const uid = this.sessionId;
    this.micBtn = this.container.querySelector(`#qiqiMicBtn-${uid}`);
    this.dropdownBtn = this.container.querySelector(`#qiqiDropdownBtn-${uid}`);
    this.micSelect = this.container.querySelector(`#qiqiMicSelect-${uid}`);

    this.micBtn.addEventListener("click", async () => {
      if (!this.isRecording) {
        this.isRecording = true;
        this.micBtn.classList.add("qiqi-pulsing");
        if (this.micSelect.options.length === 0) {
          await this.populateMicrophones();
        }
        await this.recorder.start(this.selectedDeviceId);
      } else {
        this.isRecording = false;
        this.micBtn.classList.remove("qiqi-pulsing");
        let blob = await this.recorder.stop();
        console.log("Blob type:", blob.type); // should show 'audio/wav'
        console.log("Blob size:", blob.size, "bytes");
        this.showSpinner();
        const responseJson = await uploadAudio(blob, this.formId, this.sessionId);
        blob = null;
        this.hideSpinner();
        handleResponse(responseJson, this.formId);
      }
    });

    this.dropdownBtn.addEventListener("click", async () => {
      if (this.micSelect.options.length === 0) {
        await this.populateMicrophones();
      }
      this.micSelect.classList.toggle("qiqi-hidden");
    });

    this.micSelect.addEventListener("change", () => {
      this.selectedDeviceId = this.micSelect.value;
      this.micSelect.classList.add("qiqi-hidden");
    });
  }

  async populateMicrophones() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const devices = await navigator.mediaDevices.enumerateDevices();

    this.micSelect.innerHTML = "";
    devices.forEach(device => {
      if (device.kind === "audioinput") {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.textContent = device.label || "Microphone";
        this.micSelect.appendChild(option);
      }
    });

    if (this.micSelect.options.length > 0) {
      this.selectedDeviceId = this.micSelect.options[0].value;
    }
  }

  generateSessionId() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  showSpinner() {
    const uid = this.sessionId;
    this.container.querySelector("#qiqiSpinner-${uid}")?.classList.remove("qiqi-hidden");
  }
  
  hideSpinner() {
    const uid = this.sessionId;
    this.container.querySelector("#qiqiSpinner-${uid}")?.classList.add("qiqi-hidden");
  }
  
}
const script = document.currentScript;
console.log("instantiating widget", script)
const formId = new URL(script.src).searchParams.get("formid");
console.log("formId = ", formId);
new VoiceWidget(formId, script);


