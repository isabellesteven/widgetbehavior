(()=>{var h=class{constructor(){this.audioChunks=[],this.selectedDeviceId=null,this.stream=null,this.audioContext=null,this.sourceSampleRate=null,this.targetSampleRate=16e3,this.bufferedData=[],this._workletModuleLoaded=!1}async start(e){console.log("\u{1F501} Recorder start"),this.bufferedData=[],this.selectedDeviceId=e,this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e}}}),this.audioContext=new AudioContext,this.sourceSampleRate=this.audioContext.sampleRate,console.log("\u{1F399}\uFE0F Audio context sample rate:",this.sourceSampleRate),await this._getAudioWorkletContext();let o=new AudioWorkletNode(this.audioContext,"capture-processor");o.port.onmessage=t=>{let i=t.data;this.bufferedData.push(...i)},this.audioContext.createMediaStreamSource(this.stream).connect(o).connect(this.audioContext.destination),this.processor=o}async stop(){return new Promise(async e=>{this.processor&&(this.processor.disconnect(),this.processor=null),this.stream&&(this.stream.getTracks().forEach(i=>i.stop()),this.stream=null),this.audioContext&&this.audioContext.state!=="closed"&&await this.audioContext.close(),this.audioContext=null,this._workletModuleLoaded=!1,console.log("\u{1F9F5} Buffered frames:",this.bufferedData.length);let o=await this._resampleToTarget(this.bufferedData,this.sourceSampleRate,this.targetSampleRate),n=this._convertFloat32ToInt16(o),t=this._encodeWAV(n,this.targetSampleRate);e(t)})}async _getAudioWorkletContext(){if(!this._workletModuleLoaded){console.log("\u{1F39B}\uFE0F Loading audio worklet module...");let e=new Blob([`
        class CaptureProcessor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0][0];
            if (input) this.port.postMessage([...input]);
            return true;
          }
        }
        registerProcessor('capture-processor', CaptureProcessor);
        `],{type:"application/javascript"}),o=URL.createObjectURL(e);await this.audioContext.audioWorklet.addModule(o),this._workletModuleLoaded=!0}return this.audioContext}async _resampleToTarget(e,o,n){if(o===n)return Float32Array.from(e);let t=new OfflineAudioContext(1,e.length*n/o,n),i=t.createBuffer(1,e.length,o);i.copyToChannel(Float32Array.from(e),0);let s=t.createBufferSource();return s.buffer=i,s.connect(t.destination),s.start(),(await t.startRendering()).getChannelData(0)}_convertFloat32ToInt16(e){let o=new Int16Array(e.length);for(let n=0;n<e.length;n++)o[n]=Math.max(-32768,Math.min(32767,e[n]*32767));return o}_encodeWAV(e,o){let n=new ArrayBuffer(44+e.length*2),t=new DataView(n),i=(s,l,a)=>{for(let c=0;c<a.length;c++)s.setUint8(l+c,a.charCodeAt(c))};i(t,0,"RIFF"),t.setUint32(4,36+e.length*2,!0),i(t,8,"WAVE"),i(t,12,"fmt "),t.setUint32(16,16,!0),t.setUint16(20,1,!0),t.setUint16(22,1,!0),t.setUint32(24,o,!0),t.setUint32(28,o*2,!0),t.setUint16(32,2,!0),t.setUint16(34,16,!0),i(t,36,"data"),t.setUint32(40,e.length*2,!0);for(let s=0;s<e.length;s++)t.setInt16(44+s*2,e[s],!0);return new Blob([t],{type:"audio/wav"})}};var d={websocketUrl:"wss://ksamuwry9l.execute-api.us-east-1.amazonaws.com/production/",apiGatewayUploadUrl:"https://3c8t1k5p92.execute-api.us-east-1.amazonaws.com/stage/upload",tokenEndpoint:"https://q19mkers91.execute-api.us-east-1.amazonaws.com/dev/widget/token",integrationMode:"form-fill",debugMode:!1};async function f(r,e,o){if(!e)return console.error("No FormId configured"),null;console.log("Obtaining token...");let n=await w(e);if(console.log("Token:",n),!n)throw new Error("Unable to obtain token");let{ready:t,message:i}=b(o,"standalone");if(await t,!await q(r,e,o,n))throw new Error("Unable to upload audio");return await i}async function w(r){let e=await fetch(`${d.tokenEndpoint}?formId=${r}`);if(!e.ok)throw new Error("Unable to fetch token");return(await e.json()).token}async function q(r,e,o,n){let t=`${o}.wav`,i=`${o}.json`,s={app_template:" ",formId:e,param3:"parameter3"},l=new URLSearchParams({sessionId:o,wav_filename:t,metadata_filename:i,metadata_content:btoa(JSON.stringify(s))}),a=`${d.apiGatewayUploadUrl}?${l.toString()}`;console.log("Posting to",a);let c=await fetch(a,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"audio/wav"},body:r});return console.log(c),c.ok?(console.log("Upload successful"),!0):(console.error("Upload failed with status:",c.status),null)}function b(r,e="standalone",o=3e4){let n=`${d.websocketUrl}?sessionId=${r}&role=${e}`;console.log("Connecting WebSocket:",n);let t=new WebSocket(n),i=new Promise((l,a)=>{t.onopen=()=>{console.log("WebSocket connected"),l()},t.onerror=c=>a(c)}),s=new Promise((l,a)=>{let c=setTimeout(()=>{t.close(),console.log("timeout"),a(new Error(`Timeout: No WebSocket message received in ${o} ms`))},o);t.onmessage=u=>{clearTimeout(c),console.log("WebSocket message received:",u.data),t.close(),l(JSON.parse(u.data))},t.onerror=u=>{clearTimeout(c),t.close(),a(new Error(`WebSocket error: ${u.message}`))},t.onclose=()=>{console.log("WebSocket closed")}});return{ws:t,ready:i,message:s}}function g(r,e=null){d.integrationMode==="debug"?y(r):d.integrationMode==="form-fill"&&(console.log("In handleResonse",r),S(r,e))}function y(r){let e=document.createElement("pre");e.textContent=JSON.stringify(r,null,2),document.body.appendChild(e)}function S(r,e){Object.keys(r).length===1&&typeof Object.values(r)[0]=="object"&&(r=Object.values(r)[0]),console.log("in formfill data.type is",r.type);let o=new Set(["sessionId","app_template"]);for(let[i,s]of Object.entries(r)){if(o.has(i))continue;console.log("In fillform key = ",i);let l=i.trim().toLowerCase().replace(/\s+/g,"_"),a=document.getElementById(i)||document.getElementById(l);if(console.log("in formfill input",a.type),a)n(a,s,i);else{let c=document.querySelectorAll(`input[type="radio"][name="${i}"]`);c.length>0?t(c,s,i):console.warn(`\u{1F50D} Field not found in DOM for key: "${i}"`)}}function n(i,s,l){if(i.type==="radio"){let a=document.querySelectorAll(`input[type="radio"][name="${i.name}"]`);this._fillRadioGroup(a,s,l)}else i.value=s||"",console.log(`\u2705 Filled "${l}" into #${i.id}`)}function t(i,s,l){let a=!1;i.forEach(c=>{c.value===s&&(c.checked=!0,a=!0)}),a?console.log(`\u{1F518} Selected radio "${s}" for "${l}"`):console.warn(`\u26A0\uFE0F No radio option matched value "${s}" for "${l}"`)}}var m=class{constructor(e=null,o=null){if(!e){console.error("\u274C VoiceWidget requires a formId");return}this.formId=e,this.scriptElement=o,this.recorder=new h,this.sessionId=this.generateSessionId(),this.selectedDeviceId=null,this.injectStyles(),this.createDOM(),this.setupUI()}injectStyles(){if(document.getElementById("qiqi-style"))return;let e=document.createElement("style");e.id="qiqi-style",e.textContent=`
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
    `,document.head.appendChild(e)}createDOM(){this.container=document.createElement("div"),this.container.className="qiqi-widget-inline";let e=this.sessionId;this.container.innerHTML=`
      <div class="qiqi-controls">
      <div class="qiqi-mic-wrapper">
        <button id="qiqiMicBtn-${e}" title="Start recording">
          <img src="https://isabellesteven.github.io/widgetbehavior/mic-icon-red.png" alt="Record" style="width: 30px;" />
        </button>
        <div id="qiqiSpinner-${e}" class="qiqi-spinner qiqi-hidden"></div>
        </div>
        <button id="qiqiDropdownBtn-${e}" title="Choose mic">\u25BC</button>
        <select id="qiqiMicSelect-${e}" class="qiqi-hidden"></select>
      </div>
      <div class="qiqi-brand">
        <small>Powered by <a href="https://voxfields.com" target="_blank">Voxfields</a></small>
      </div>
    `,this.scriptElement.parentNode.insertBefore(this.container,this.scriptElement.nextSibling)}setupUI(){let e=this.sessionId;this.micBtn=this.container.querySelector(`#qiqiMicBtn-${e}`),this.dropdownBtn=this.container.querySelector(`#qiqiDropdownBtn-${e}`),this.micSelect=this.container.querySelector(`#qiqiMicSelect-${e}`),this.micBtn.addEventListener("click",async()=>{if(!this.isRecording)this.isRecording=!0,this.micBtn.classList.add("qiqi-pulsing"),this.micSelect.options.length===0&&await this.populateMicrophones(),await this.recorder.start(this.selectedDeviceId);else{this.isRecording=!1,this.micBtn.classList.remove("qiqi-pulsing");let o=await this.recorder.stop();console.log("Blob type:",o.type),console.log("Blob size:",o.size,"bytes"),this.showSpinner();let n=await f(o,this.formId,this.sessionId);o=null,this.hideSpinner(),g(n,this.formId)}}),this.dropdownBtn.addEventListener("click",async()=>{this.micSelect.options.length===0&&await this.populateMicrophones(),this.micSelect.classList.toggle("qiqi-hidden")}),this.micSelect.addEventListener("change",()=>{this.selectedDeviceId=this.micSelect.value,this.micSelect.classList.add("qiqi-hidden")})}async populateMicrophones(){let e=await navigator.mediaDevices.getUserMedia({audio:!0}),o=await navigator.mediaDevices.enumerateDevices();this.micSelect.innerHTML="",o.forEach(n=>{if(n.kind==="audioinput"){let t=document.createElement("option");t.value=n.deviceId,t.textContent=n.label||"Microphone",this.micSelect.appendChild(t)}}),this.micSelect.options.length>0&&(this.selectedDeviceId=this.micSelect.options[0].value)}generateSessionId(){return Math.floor(1e5+Math.random()*9e5)}showSpinner(){let e=this.sessionId;this.container.querySelector("#qiqiSpinner-${uid}")?.classList.remove("qiqi-hidden")}hideSpinner(){let e=this.sessionId;this.container.querySelector("#qiqiSpinner-${uid}")?.classList.add("qiqi-hidden")}},p=document.currentScript;console.log("instantiating widget",p);if(p){let r=p.getAttribute("data-formid");new m(r,p)}})();
