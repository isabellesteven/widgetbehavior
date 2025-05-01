(()=>{var h=class{constructor(){this.audioChunks=[],this.selectedDeviceId=null,this.stream=null,this.audioContext=null,this.sourceSampleRate=null,this.targetSampleRate=16e3,this.bufferedData=[],this._workletModuleLoaded=!1}async start(e){this.selectedDeviceId=e,this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e}}}),this.audioContext=new AudioContext,this.sourceSampleRate=this.audioContext.sampleRate;let i=this.audioContext.createMediaStreamSource(this.stream),o=new AudioWorkletNode(await this._getAudioWorkletContext(),"capture-processor");o.port.onmessage=t=>{let s=t.data;this.bufferedData.push(...s)},i.connect(o).connect(this.audioContext.destination),this.processor=o}async stop(){return new Promise(async e=>{this.processor.disconnect(),this.stream.getTracks().forEach(s=>s.stop()),await this.audioContext.close(),this.audioContext=null;let i=await this._resampleToTarget(this.bufferedData,this.sourceSampleRate,this.targetSampleRate),o=this._convertFloat32ToInt16(i),t=this._encodeWAV(o,this.targetSampleRate);e(t)})}async _getAudioWorkletContext(){if(!this._workletModuleLoaded){let e=new Blob([`
        class CaptureProcessor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0][0];
            this.port.postMessage([...input]);
            return true;
          }
        }
        registerProcessor('capture-processor', CaptureProcessor);
        `],{type:"application/javascript"}),i=URL.createObjectURL(e);await this.audioContext.audioWorklet.addModule(i),this._workletModuleLoaded=!0}return this.audioContext}async _resampleToTarget(e,i,o){if(i===o)return Float32Array.from(e);let t=new OfflineAudioContext(1,e.length*o/i,o),s=t.createBuffer(1,e.length,i);s.copyToChannel(Float32Array.from(e),0);let r=t.createBufferSource();return r.buffer=s,r.connect(t.destination),r.start(),(await t.startRendering()).getChannelData(0)}_convertFloat32ToInt16(e){let i=new Int16Array(e.length);for(let o=0;o<e.length;o++)i[o]=Math.max(-32768,Math.min(32767,e[o]*32767));return i}_encodeWAV(e,i){let o=new ArrayBuffer(44+e.length*2),t=new DataView(o),s=(r,l,c)=>{for(let a=0;a<c.length;a++)r.setUint8(l+a,c.charCodeAt(a))};s(t,0,"RIFF"),t.setUint32(4,36+e.length*2,!0),s(t,8,"WAVE"),s(t,12,"fmt "),t.setUint32(16,16,!0),t.setUint16(20,1,!0),t.setUint16(22,1,!0),t.setUint32(24,i,!0),t.setUint32(28,i*2,!0),t.setUint16(32,2,!0),t.setUint16(34,16,!0),s(t,36,"data"),t.setUint32(40,e.length*2,!0);for(let r=0;r<e.length;r++)t.setInt16(44+r*2,e[r],!0);return new Blob([t],{type:"audio/wav"})}};var d={websocketUrl:"wss://ksamuwry9l.execute-api.us-east-1.amazonaws.com/production/",apiGatewayUploadUrl:"https://3c8t1k5p92.execute-api.us-east-1.amazonaws.com/stage/upload",tokenEndpoint:"https://q19mkers91.execute-api.us-east-1.amazonaws.com/dev/widget/token",integrationMode:"form-fill",debugMode:!1};async function m(n,e,i){if(!e)return console.error("No FormId configured"),null;console.log("Obtaining token...");let o=await g(e);if(console.log("Token:",o),!o)throw new Error("Unable to obtain token");let{ready:t,message:s}=q(i,"standalone");if(await t,!await w(n,e,i,o))throw new Error("Unable to upload audio");return await s}async function g(n){let e=await fetch(`${d.tokenEndpoint}?formId=${n}`);if(!e.ok)throw new Error("Unable to fetch token");return(await e.json()).token}async function w(n,e,i,o){let t=`${i}.wav`,s=`${i}.json`,r={app_template:" ",formId:e,param3:"parameter3"},l=new URLSearchParams({sessionId:i,wav_filename:t,metadata_filename:s,metadata_content:btoa(JSON.stringify(r))}),c=`${d.apiGatewayUploadUrl}?${l.toString()}`;console.log("Posting to",c);let a=await fetch(c,{method:"POST",headers:{Authorization:`Bearer ${o}`,"Content-Type":"audio/wav"},body:n});return console.log(a),a.ok?(console.log("Upload successful"),!0):(console.error("Upload failed with status:",a.status),null)}function q(n,e="standalone",i=3e4){let o=`${d.websocketUrl}?sessionId=${n}&role=${e}`;console.log("Connecting WebSocket:",o);let t=new WebSocket(o),s=new Promise((l,c)=>{t.onopen=()=>{console.log("WebSocket connected"),l()},t.onerror=a=>c(a)}),r=new Promise((l,c)=>{let a=setTimeout(()=>{t.close(),console.log("timeout"),c(new Error(`Timeout: No WebSocket message received in ${i} ms`))},i);t.onmessage=u=>{clearTimeout(a),console.log("WebSocket message received:",u.data),t.close(),l(JSON.parse(u.data))},t.onerror=u=>{clearTimeout(a),t.close(),c(new Error(`WebSocket error: ${u.message}`))},t.onclose=()=>{console.log("WebSocket closed")}});return{ws:t,ready:s,message:r}}function f(n,e=null){d.integrationMode==="debug"?b(n):d.integrationMode==="form-fill"&&S(n,e)}function b(n){let e=document.createElement("pre");e.textContent=JSON.stringify(n,null,2),document.body.appendChild(e)}function S(n){let e=formId?document.getElementById(formId):document;Object.entries(json).forEach(([i,o])=>{let t=e.querySelector(`#${i}`);t&&(t.value=o)})}var p=class{constructor(e=null,i=null){console.log("in Constructor ..."),this.formId=e,this.scriptElement=i,this.recorder=new h,this.sessionId=this.generateSessionId(),this.selectedDeviceId=null,this.injectStyles(),this.createDOM(),this.setupUI()}injectStyles(){if(document.getElementById("qiqi-style"))return;let e=document.createElement("style");e.id="qiqi-style",e.textContent=`
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
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 9999px;
        padding: 6px 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
        width: 24px;
        height: 24px;
        border: 3px solid #ccc;
        border-top: 3px solid #e60023;
        border-radius: 50%;
        animation: qiqi-spin 1s linear infinite;
      }

      @keyframes qiqi-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,document.head.appendChild(e)}createDOM(){this.container=document.createElement("div"),this.container.className="qiqi-widget-inline";let e=this.sessionId;this.container.innerHTML=`
      <div class="qiqi-controls">
        <button id="qiqiMicBtn-${e}" title="Start recording">
          <img src="https://isabellesteven.github.io/widgetbehavior/mic-icon-red.png" alt="Record" style="width: 30px;" />
        </button>
        <button id="qiqiDropdownBtn-${e}" title="Choose mic">\u25BC</button>
        <select id="qiqiMicSelect-${e}" class="qiqi-hidden"></select>
      </div>
      <div class="qiqi-brand">
        <small>Powered by <a href="https://voxfields.com" target="_blank">Voxfields</a></small>
      </div>
      <div id="qiqiSpinner" class="qiqi-spinner qiqi-hidden"></div>
    `,this.scriptElement.parentNode.insertBefore(this.container,this.scriptElement.nextSibling)}setupUI(){let e=this.sessionId;this.micBtn=this.container.querySelector(`#qiqiMicBtn-${e}`),this.dropdownBtn=this.container.querySelector(`#qiqiDropdownBtn-${e}`),this.micSelect=this.container.querySelector(`#qiqiMicSelect-${e}`),this.micBtn.addEventListener("click",async()=>{if(!this.isRecording)this.isRecording=!0,this.micBtn.classList.add("qiqi-pulsing"),this.micSelect.options.length===0&&await this.populateMicrophones(),await this.recorder.start(this.selectedDeviceId);else{this.isRecording=!1,this.micBtn.classList.remove("qiqi-pulsing");let i=await this.recorder.stop();console.log("Blob type:",i.type),console.log("Blob size:",i.size,"bytes"),this.showSpinner();let o=await m(i,this.formId,this.sessionId);i=null,this.hideSpinner(),f(o,this.formId)}}),this.dropdownBtn.addEventListener("click",async()=>{this.micSelect.options.length===0&&await this.populateMicrophones(),this.micSelect.classList.toggle("qiqi-hidden")}),this.micSelect.addEventListener("change",()=>{this.selectedDeviceId=this.micSelect.value,this.micSelect.classList.add("qiqi-hidden")})}async populateMicrophones(){let e=await navigator.mediaDevices.getUserMedia({audio:!0}),i=await navigator.mediaDevices.enumerateDevices();this.micSelect.innerHTML="",i.forEach(o=>{if(o.kind==="audioinput"){let t=document.createElement("option");t.value=o.deviceId,t.textContent=o.label||"Microphone",this.micSelect.appendChild(t)}}),this.micSelect.options.length>0&&(this.selectedDeviceId=this.micSelect.options[0].value)}generateSessionId(){return Math.floor(1e5+Math.random()*9e5)}showSpinner(){this.container.querySelector("#qiqiSpinner")?.classList.remove("qiqi-hidden")}hideSpinner(){this.container.querySelector("#qiqiSpinner")?.classList.add("qiqi-hidden")}},y=document.querySelectorAll('script[src*="voice-widget"]');y.forEach(n=>{let e=n.getAttribute("data-formid");new p(e,n)});})();
