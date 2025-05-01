(()=>{var h=class{constructor(){this.audioChunks=[],this.selectedDeviceId=null,this.stream=null,this.audioContext=null,this.sourceSampleRate=null,this.targetSampleRate=16e3,this.bufferedData=[],this._workletModuleLoaded=!1}async start(e){this.selectedDeviceId=e,this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e}}}),this.audioContext=new AudioContext,this.sourceSampleRate=this.audioContext.sampleRate;let o=this.audioContext.createMediaStreamSource(this.stream),i=new AudioWorkletNode(await this._getAudioWorkletContext(),"capture-processor");i.port.onmessage=t=>{let r=t.data;this.bufferedData.push(...r)},o.connect(i).connect(this.audioContext.destination),this.processor=i}async stop(){return new Promise(async e=>{this.processor.disconnect(),this.stream.getTracks().forEach(c=>c.stop()),await this.audioContext.close();let o=await this._resampleToTarget(this.bufferedData,this.sourceSampleRate,this.targetSampleRate),i=this._convertFloat32ToInt16(o),t=this._encodeWAV(i,this.targetSampleRate),r=URL.createObjectURL(t),n=document.createElement("a");n.href=r,n.download=`recording_${Date.now()}.wav`,n.textContent="Download WAV",document.body.appendChild(n),e(t)})}async _getAudioWorkletContext(){if(!this._workletModuleLoaded){let e=new Blob([`
        class CaptureProcessor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0][0];
            this.port.postMessage([...input]);
            return true;
          }
        }
        registerProcessor('capture-processor', CaptureProcessor);
        `],{type:"application/javascript"}),o=URL.createObjectURL(e);await this.audioContext.audioWorklet.addModule(o),this._workletModuleLoaded=!0}return this.audioContext}async _resampleToTarget(e,o,i){if(o===i)return Float32Array.from(e);let t=new OfflineAudioContext(1,e.length*i/o,i),r=t.createBuffer(1,e.length,o);r.copyToChannel(Float32Array.from(e),0);let n=t.createBufferSource();return n.buffer=r,n.connect(t.destination),n.start(),(await t.startRendering()).getChannelData(0)}_convertFloat32ToInt16(e){let o=new Int16Array(e.length);for(let i=0;i<e.length;i++)o[i]=Math.max(-32768,Math.min(32767,e[i]*32767));return o}_encodeWAV(e,o){let i=new ArrayBuffer(44+e.length*2),t=new DataView(i),r=(n,c,l)=>{for(let a=0;a<l.length;a++)n.setUint8(c+a,l.charCodeAt(a))};r(t,0,"RIFF"),t.setUint32(4,36+e.length*2,!0),r(t,8,"WAVE"),r(t,12,"fmt "),t.setUint32(16,16,!0),t.setUint16(20,1,!0),t.setUint16(22,1,!0),t.setUint32(24,o,!0),t.setUint32(28,o*2,!0),t.setUint16(32,2,!0),t.setUint16(34,16,!0),r(t,36,"data"),t.setUint32(40,e.length*2,!0);for(let n=0;n<e.length;n++)t.setInt16(44+n*2,e[n],!0);return new Blob([t],{type:"audio/wav"})}};var d={websocketUrl:"wss://ksamuwry9l.execute-api.us-east-1.amazonaws.com/production/",apiGatewayUploadUrl:"https://3c8t1k5p92.execute-api.us-east-1.amazonaws.com/stage/upload",tokenEndpoint:"https://q19mkers91.execute-api.us-east-1.amazonaws.com/dev/widget/token",integrationMode:"form-fill",debugMode:!1};async function m(s,e,o){if(!e)return console.error("No FormId configured"),null;console.log("Obtaining token...");let i=await g(e);if(console.log("Token:",i),!i)throw new Error("Unable to obtain token");let{ready:t,message:r}=q(o,"standalone");if(await t,!await w(s,e,o,i))throw new Error("Unable to upload audio");return await r}async function g(s){let e=await fetch(`${d.tokenEndpoint}?formId=${s}`);if(!e.ok)throw new Error("Unable to fetch token");return(await e.json()).token}async function w(s,e,o,i){let t=`${o}.wav`,r=`${o}.json`,n={app_template:" ",formId:e,param3:"parameter3"},c=new URLSearchParams({sessionId:o,wav_filename:t,metadata_filename:r,metadata_content:btoa(JSON.stringify(n))}),l=`${d.apiGatewayUploadUrl}?${c.toString()}`;console.log("Posting to",l);let a=await fetch(l,{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"audio/wav"},body:s});return console.log(a),a.ok?(console.log("Upload successful"),!0):(console.error("Upload failed with status:",a.status),null)}function q(s,e="standalone",o=3e4){let i=`${d.websocketUrl}?sessionId=${s}&role=${e}`;console.log("Connecting WebSocket:",i);let t=new WebSocket(i),r=new Promise((c,l)=>{t.onopen=()=>{console.log("WebSocket connected"),c()},t.onerror=a=>l(a)}),n=new Promise((c,l)=>{let a=setTimeout(()=>{t.close(),console.log("timeout"),l(new Error(`Timeout: No WebSocket message received in ${o} ms`))},o);t.onmessage=u=>{clearTimeout(a),console.log("WebSocket message received:",u.data),t.close(),c(JSON.parse(u.data))},t.onerror=u=>{clearTimeout(a),t.close(),l(new Error(`WebSocket error: ${u.message}`))},t.onclose=()=>{console.log("WebSocket closed")}});return{ws:t,ready:r,message:n}}function f(s,e=null){d.integrationMode==="debug"?b(s):d.integrationMode==="form-fill"&&y(s,e)}function b(s){let e=document.createElement("pre");e.textContent=JSON.stringify(s,null,2),document.body.appendChild(e)}function y(s){let e=formId?document.getElementById(formId):document;Object.entries(json).forEach(([o,i])=>{let t=e.querySelector(`#${o}`);t&&(t.value=i)})}var p=class{constructor(e=null,o=null){console.log("in Constructor ..."),this.formId=e,this.scriptElement=o,this.recorder=new h,this.sessionId=this.generateSessionId(),this.selectedDeviceId=null,this.injectStyles(),this.createDOM(),this.setupUI()}injectStyles(){if(document.getElementById("qiqi-style"))return;let e=document.createElement("style");e.id="qiqi-style",e.textContent=`
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
          <img src="./mic-icon-red.png" alt="Record" style="width: 30px;" />
        </button>
        <button id="qiqiDropdownBtn-${e}" title="Choose mic">\u25BC</button>
        <select id="qiqiMicSelect-${e}" class="qiqi-hidden"></select>
      </div>
      <div class="qiqi-brand">
        <small>Powered by <a href="https://voxfields.com" target="_blank">Voxfields</a></small>
      </div>
      <div id="qiqiSpinner" class="qiqi-spinner qiqi-hidden"></div>
    `,this.scriptElement.parentNode.insertBefore(this.container,this.scriptElement.nextSibling)}setupUI(){let e=this.sessionId;this.micBtn=this.container.querySelector(`#qiqiMicBtn-${e}`),this.dropdownBtn=this.container.querySelector(`#qiqiDropdownBtn-${e}`),this.micSelect=this.container.querySelector(`#qiqiMicSelect-${e}`),this.micBtn.addEventListener("click",async()=>{if(!this.isRecording)this.isRecording=!0,this.micBtn.classList.add("qiqi-pulsing"),this.micSelect.options.length===0&&await this.populateMicrophones(),await this.recorder.start(this.selectedDeviceId);else{this.isRecording=!1,this.micBtn.classList.remove("qiqi-pulsing");let o=await this.recorder.stop();console.log("Blob type:",o.type),console.log("Blob size:",o.size,"bytes"),this.showSpinner();let i=await m(o,this.formId,this.sessionId);this.hideSpinner(),f(i,this.formId)}}),this.dropdownBtn.addEventListener("click",async()=>{this.micSelect.options.length===0&&await this.populateMicrophones(),this.micSelect.classList.toggle("qiqi-hidden")}),this.micSelect.addEventListener("change",()=>{this.selectedDeviceId=this.micSelect.value,this.micSelect.classList.add("qiqi-hidden")})}async populateMicrophones(){let e=await navigator.mediaDevices.getUserMedia({audio:!0}),o=await navigator.mediaDevices.enumerateDevices();this.micSelect.innerHTML="",o.forEach(i=>{if(i.kind==="audioinput"){let t=document.createElement("option");t.value=i.deviceId,t.textContent=i.label||"Microphone",this.micSelect.appendChild(t)}}),this.micSelect.options.length>0&&(this.selectedDeviceId=this.micSelect.options[0].value)}generateSessionId(){return Math.floor(1e5+Math.random()*9e5)}showSpinner(){this.container.querySelector("#qiqiSpinner")?.classList.remove("qiqi-hidden")}hideSpinner(){this.container.querySelector("#qiqiSpinner")?.classList.add("qiqi-hidden")}},S=document.querySelectorAll('script[src*="voice-widget"]');S.forEach(s=>{let e=s.getAttribute("data-formid");new p(e,s)});})();
