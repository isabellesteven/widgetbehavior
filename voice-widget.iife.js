(()=>{var p=class{constructor(){console.log("in recorder constructor"),this.audioChunks=[],this.selectedDeviceId=null,this.stream=null,this.audioContext=null,this.sourceSampleRate=null,this.targetSampleRate=16e3,this.bufferedData=[]}async start(e){console.log("recorder started"),this.selectedDeviceId=e,this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e}}}),this.audioContext=new AudioContext,this.sourceSampleRate=this.audioContext.sampleRate;let o=this.audioContext.createMediaStreamSource(this.stream),i=new AudioWorkletNode(await this._getAudioWorkletContext(),"capture-processor");i.port.onmessage=t=>{let n=t.data;this.bufferedData.push(...n)},o.connect(i).connect(this.audioContext.destination),this.processor=i}async stop(){return console.log("Recorder stopped"),new Promise(async e=>{console.log("stopping1"),this.processor.disconnect(),console.log("stopping2"),this.stream.getTracks().forEach(n=>n.stop()),await this.audioContext.close();let o=await this._resampleToTarget(this.bufferedData,this.sourceSampleRate,this.targetSampleRate);console.log("stopping3");let i=this._convertFloat32ToInt16(o),t=this._encodeWAV(i,this.targetSampleRate);console.log("stopping4"),e(t)})}async _getAudioWorkletContext(){if(!this.audioContext.audioWorklet.modules.includes("capture-processor")){let e=new Blob([`
        class CaptureProcessor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0][0];
            this.port.postMessage([...input]);
            return true;
          }
        }
        registerProcessor('capture-processor', CaptureProcessor);
        `],{type:"application/javascript"}),o=URL.createObjectURL(e);await this.audioContext.audioWorklet.addModule(o)}return this.audioContext}async _resampleToTarget(e,o,i){if(o===i)return Float32Array.from(e);let t=new OfflineAudioContext(1,e.length*i/o,i),n=t.createBuffer(1,e.length,o);n.copyToChannel(Float32Array.from(e),0);let r=t.createBufferSource();return r.buffer=n,r.connect(t.destination),r.start(),(await t.startRendering()).getChannelData(0)}_convertFloat32ToInt16(e){let o=new Int16Array(e.length);for(let i=0;i<e.length;i++)o[i]=Math.max(-32768,Math.min(32767,e[i]*32767));return o}_encodeWAV(e,o){let i=new ArrayBuffer(44+e.length*2),t=new DataView(i),n=(r,c,l)=>{for(let a=0;a<l.length;a++)r.setUint8(c+a,l.charCodeAt(a))};n(t,0,"RIFF"),t.setUint32(4,36+e.length*2,!0),n(t,8,"WAVE"),n(t,12,"fmt "),t.setUint32(16,16,!0),t.setUint16(20,1,!0),t.setUint16(22,1,!0),t.setUint32(24,o,!0),t.setUint32(28,o*2,!0),t.setUint16(32,2,!0),t.setUint16(34,16,!0),n(t,36,"data"),t.setUint32(40,e.length*2,!0);for(let r=0;r<e.length;r++)t.setInt16(44+r*2,e[r],!0);return new Blob([t],{type:"audio/wav"})}};var d={websocketUrl:"wss://ksamuwry9l.execute-api.us-east-1.amazonaws.com/production/",apiGatewayUploadUrl:"https://3c8t1k5p92.execute-api.us-east-1.amazonaws.com/stage/upload",tokenEndpoint:"https://q19mkers91.execute-api.us-east-1.amazonaws.com/dev/widget/token",integrationMode:"form-fill",debugMode:!1};async function m(s,e,o){if(!e)return console.error("No FormId configured"),null;console.log("Obtaining token...");let i=await f(e);if(console.log("Token:",i),!i)throw new Error("Unable to obtain token");let{ready:t,message:n}=b(o,"standalone");if(await t,!await w(s,e,o,i))throw new Error("Unable to upload audio");return await n}async function f(s){let e=await fetch(`${d.tokenEndpoint}?formId=${s}`);if(!e.ok)throw new Error("Unable to fetch token");return(await e.json()).token}async function w(s,e,o,i){let t=`${o}.wav`,n=`${o}.json`,r={app_template:" ",formId:e,param3:"parameter3"},c=new URLSearchParams({sessionId:o,wav_filename:t,metadata_filename:n,metadata_content:encodeURIComponent(JSON.stringify(r))}),l=`${d.apiGatewayUploadUrl}?${c.toString()}`,a=await fetch(l,{method:"POST",headers:{Authorization:`Bearer ${i}`,"Content-Type":"audio/wav"},body:s});return a.ok?(console.log("Upload successful"),!0):(console.error("Upload failed with status:",a.status),null)}function b(s,e="standalone",o=3e4){let i=`${d.websocketUrl}?sessionId=${s}&role=${e}`;console.log("Connecting WebSocket:",i);let t=new WebSocket(i),n=new Promise((c,l)=>{t.onopen=()=>{console.log("WebSocket connected"),c()},t.onerror=a=>l(a)}),r=new Promise((c,l)=>{let a=setTimeout(()=>{t.close(),console.log("timeout"),l(new Error(`Timeout: No WebSocket message received in ${o} ms`))},o);t.onmessage=u=>{clearTimeout(a),console.log("WebSocket message received:",u.data),t.close(),c(JSON.parse(u.data))},t.onerror=u=>{clearTimeout(a),t.close(),l(new Error(`WebSocket error: ${u.message}`))},t.onclose=()=>{console.log("WebSocket closed")}});return{ws:t,ready:n,message:r}}function g(s,e=null){d.integrationMode==="debug"?q(s):d.integrationMode==="form-fill"&&y(s,e)}function q(s){let e=document.createElement("pre");e.textContent=JSON.stringify(s,null,2),document.body.appendChild(e)}function y(s,e){let o=e?document.getElementById(e):document;Object.entries(s).forEach(([i,t])=>{let n=o.querySelector(`#${i}`);n&&(n.value=t)})}var h=class{constructor(e=null,o=null){console.log("in Constructor ..."),this.formId=e,this.scriptElement=o,this.recorder=new p,this.sessionId=this.generateSessionId(),this.selectedDeviceId=null,this.injectStyles(),this.createDOM(),this.setupUI()}injectStyles(){if(document.getElementById("qiqi-style"))return;let e=document.createElement("style");e.id="qiqi-style",e.textContent=`
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
    `,this.scriptElement.parentNode.insertBefore(this.container,this.scriptElement.nextSibling)}setupUI(){let e=this.sessionId;this.micBtn=this.container.querySelector(`#qiqiMicBtn-${e}`),this.dropdownBtn=this.container.querySelector(`#qiqiDropdownBtn-${e}`),this.micSelect=this.container.querySelector(`#qiqiMicSelect-${e}`),this.micBtn.addEventListener("click",async()=>{if(!this.isRecording)this.isRecording=!0,this.micBtn.classList.add("qiqi-pulsing"),this.micSelect.options.length===0&&await this.populateMicrophones(),await this.recorder.start(this.selectedDeviceId);else{this.isRecording=!1,this.micBtn.classList.remove("qiqi-pulsing");let o=await this.recorder.stop();console.log("Blob type:",o.type),console.log("Blob size:",o.size,"bytes");let i=await m(o,this.formId,this.sessionId);g(i,this.formId)}}),this.dropdownBtn.addEventListener("click",async()=>{this.micSelect.options.length===0&&await this.populateMicrophones(),this.micSelect.classList.toggle("qiqi-hidden")}),this.micSelect.addEventListener("change",()=>{this.selectedDeviceId=this.micSelect.value,this.micSelect.classList.add("qiqi-hidden")})}async populateMicrophones(){let e=await navigator.mediaDevices.getUserMedia({audio:!0}),o=await navigator.mediaDevices.enumerateDevices();this.micSelect.innerHTML="",o.forEach(i=>{if(i.kind==="audioinput"){let t=document.createElement("option");t.value=i.deviceId,t.textContent=i.label||"Microphone",this.micSelect.appendChild(t)}}),this.micSelect.options.length>0&&(this.selectedDeviceId=this.micSelect.options[0].value)}generateSessionId(){return Math.floor(1e5+Math.random()*9e5)}},S=document.querySelectorAll('script[src*="voice-widget"]');S.forEach(s=>{let e=s.getAttribute("data-formid");new h(e,s)});})();
