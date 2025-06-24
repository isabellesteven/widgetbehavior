(()=>{var d={websocketUrl:"wss://ksamuwry9l.execute-api.us-east-1.amazonaws.com/production/",apiGatewayUploadUrl:"https://3c8t1k5p92.execute-api.us-east-1.amazonaws.com/stage/upload",tokenEndpoint:"https://q19mkers91.execute-api.us-east-1.amazonaws.com/dev/widget/token",integrationMode:"form-fill",debugMode:!1};async function f(o,e,t){if(!e)return console.error("No FormId configured"),null;console.log("Obtaining token...");let n=await q(e);if(console.log("Token:",n),!n)throw new Error("Unable to obtain token");let{ready:s,message:i}=y(t,"standalone");if(await s,!await b(o,e,t,n))throw new Error("Unable to upload audio");return await i}async function q(o){let e=await fetch(`${d.tokenEndpoint}?formId=${o}`);if(!e.ok)throw new Error("Unable to fetch token");return(await e.json()).token}async function b(o,e,t,n){let s=`${t}.wav`,i=`${t}.json`,a={app_template:" ",formId:e,param3:"parameter3"},c=new URLSearchParams({sessionId:t,wav_filename:s,metadata_filename:i,metadata_content:btoa(JSON.stringify(a))}),r=`${d.apiGatewayUploadUrl}?${c.toString()}`;console.log("Posting to",r);let l=await fetch(r,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"audio/wav"},body:o});return console.log(l),l.ok?(console.log("Upload successful"),!0):(console.error("Upload failed with status:",l.status),null)}function y(o,e="standalone",t=3e4){let n=`${d.websocketUrl}?sessionId=${o}&role=${e}`;console.log("Connecting WebSocket:",n);let s=new WebSocket(n),i=new Promise((c,r)=>{s.onopen=()=>{console.log("WebSocket connected"),c()},s.onerror=l=>r(l)}),a=new Promise((c,r)=>{let l=setTimeout(()=>{s.close(),console.log("timeout"),r(new Error(`Timeout: No WebSocket message received in ${t} ms`))},t);s.onmessage=u=>{clearTimeout(l),console.log("WebSocket message received:",u.data),s.close(),c(JSON.parse(u.data))},s.onerror=u=>{clearTimeout(l),s.close(),r(new Error(`WebSocket error: ${u.message}`))},s.onclose=()=>{console.log("WebSocket closed")}});return{ws:s,ready:i,message:a}}function g(o,e=null){d.integrationMode==="debug"?S(o):d.integrationMode==="form-fill"&&(console.log("In handleResonse",o),k(o,e))}function S(o){let e=document.createElement("pre");e.textContent=JSON.stringify(o,null,2),document.body.appendChild(e)}function k(o,e){console.log("in formfill data.type is",o),Object.keys(o).length===1&&typeof Object.values(o)[0]=="object"&&(o=Object.values(o)[0]);let t=new Set(["sessionId","app_template"]);for(let[i,a]of Object.entries(o)){if(t.has(i))continue;console.log("In fillform key = ",i);let c=i.trim().toLowerCase().replace(/\s+/g,"_"),r=document.getElementById(i)||document.getElementById(c);if(console.log("in formfill input",r),r)n(r,a,i);else{let l=document.querySelectorAll(`input[type="radio"][name="${i}"]`);l.length>0?s(l,a,i):console.warn(`\u{1F50D} Field not found in DOM for key: "${i}"`)}}function n(i,a,c){if(i.type==="radio"){let r=document.querySelectorAll(`input[type="radio"][name="${i.name}"]`);this._fillRadioGroup(r,a,c)}else i.value=a||"",console.log(`\u2705 Filled "${c}" into #${i.id}`)}function s(i,a,c){let r=!1;i.forEach(l=>{l.value===a&&(l.checked=!0,r=!0)}),r?console.log(`\u{1F518} Selected radio "${a}" for "${c}"`):console.warn(`\u26A0\uFE0F No radio option matched value "${a}" for "${c}"`)}}var h=class{constructor(){this.mediaRecorder=null,this.chunks=[],this.selectedDeviceId=null,this.stream=null}async start(e){this.selectedDeviceId=e,this.chunks=[],this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:e?{exact:e}:void 0,sampleRate:16e3,channelCount:1}});let t={mimeType:"audio/webm;codecs=opus"};this.mediaRecorder=new MediaRecorder(this.stream,t),this.mediaRecorder.ondataavailable=n=>{n.data.size>0&&this.chunks.push(n.data)},this.mediaRecorder.start()}async stop(){return new Promise(e=>{this.mediaRecorder.onstop=()=>{let t=new Blob(this.chunks,{type:"audio/webm"});this._cleanup(),e(t)},this.mediaRecorder.stop()})}_cleanup(){this.stream?.getTracks().forEach(e=>e.stop()),this.mediaRecorder=null,this.stream=null,this.chunks=[]}};var p=class{constructor(e=null,t=null){if(!e){console.error("\u274C VoiceWidget requires a formId");return}this.formId=e,this.scriptElement=t,this.recorder=new h,this.sessionId=this.generateSessionId(),this.selectedDeviceId=null,this.injectStyles(),this.createDOM(),this.setupUI()}injectStyles(){if(document.getElementById("qiqi-style"))return;let e=document.createElement("style");e.id="qiqi-style",e.textContent=`
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
    `,this.scriptElement.parentNode.insertBefore(this.container,this.scriptElement.nextSibling)}setupUI(){console.log("in setupUI");let e=this.sessionId;this.micBtn=this.container.querySelector(`#qiqiMicBtn-${e}`),this.dropdownBtn=this.container.querySelector(`#qiqiDropdownBtn-${e}`),this.micSelect=this.container.querySelector(`#qiqiMicSelect-${e}`),this.micBtn.addEventListener("click",async()=>{if(console.log("button: ",this.micSelect,this.isRecording,this.micSelect),!this.isRecording)this.isRecording=!0,this.micBtn.classList.add("qiqi-pulsing"),this.micSelect.options.length===0&&await this.populateMicrophones(),await this.recorder.start(this.selectedDeviceId);else{this.isRecording=!1,this.micBtn.classList.remove("qiqi-pulsing");let t=await this.recorder.stop();console.log("Blob type:",t.type),console.log("Blob size:",t.size,"bytes"),this.showSpinner();let n=await f(t,this.formId,this.sessionId);t=null,this.hideSpinner(),g(n,this.formId)}}),this.dropdownBtn.addEventListener("click",async()=>{this.micSelect.options.length===0&&await this.populateMicrophones(),this.micSelect.classList.toggle("qiqi-hidden")}),this.micSelect.addEventListener("change",()=>{this.selectedDeviceId=this.micSelect.value,this.micSelect.classList.add("qiqi-hidden")})}async populateMicrophones(){let e=await navigator.mediaDevices.getUserMedia({audio:!0}),t=await navigator.mediaDevices.enumerateDevices();this.micSelect.innerHTML="",t.forEach(n=>{if(n.kind==="audioinput"){let s=document.createElement("option");s.value=n.deviceId,s.textContent=n.label||"Microphone",this.micSelect.appendChild(s)}}),this.micSelect.options.length>0&&(this.selectedDeviceId=this.micSelect.options[0].value)}generateSessionId(){return Math.floor(1e5+Math.random()*9e5)}showSpinner(){let e=this.sessionId;console.log("in showspinner, uid = ",e),this.container.querySelector(`#qiqiSpinner-${e}`)?.classList.remove("qiqi-hidden")}hideSpinner(){let e=this.sessionId;this.container.querySelector(`#qiqiSpinner-${e}`)?.classList.add("qiqi-hidden")}},m=document.currentScript;console.log("instantiating widget",m);var w=new URL(m.src).searchParams.get("formid");console.log("formId = ",w);new p(w,m);})();
