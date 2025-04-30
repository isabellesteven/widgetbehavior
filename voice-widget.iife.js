(()=>{var u=class{constructor(){this.mediaRecorder=null,this.audioChunks=[],this.selectedDeviceId=null,this.stream=null}async start(e){this.selectedDeviceId=e,this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e}}}),this.mediaRecorder=new MediaRecorder(this.stream),this.mediaRecorder.ondataavailable=t=>{this.audioChunks.push(t.data)},this.mediaRecorder.start()}async stop(){return new Promise(e=>{this.mediaRecorder.onstop=async()=>{let t=new Blob(this.audioChunks,{type:"audio/webm"});this.stream.getTracks().forEach(n=>n.stop()),e(t)},this.mediaRecorder.stop()})}};var r={websocketUrl:"wss://ksamuwry9l.execute-api.us-east-1.amazonaws.com/production/",apiGatewayUploadUrl:"https://3c8t1k5p92.execute-api.us-east-1.amazonaws.com/stage/upload",tokenEndpoint:"https://q19mkers91.execute-api.us-east-1.amazonaws.com/dev/widget/token",integrationMode:"form-fill",debugMode:!1};async function p(i,e,t){if(!e)return console.error("No FormId configured"),null;console.log("Obtaining token...");let n=await g(e);if(console.log("Token:",n),!n)throw new Error("Unable to obtain token");let{ready:o,message:s}=q(t,"standalone");if(await o,!await w(i,e,t,n))throw new Error("Unable to upload audio");return await s}async function g(i){let e=await fetch(`${r.tokenEndpoint}?formId=${i}`);if(!e.ok)throw new Error("Unable to fetch token");return(await e.json()).token}async function w(i,e,t,n){let o=`${t}.wav`,s=`${t}.json`,d={app_template:" ",formId:e,param3:"parameter3"},c=new URLSearchParams({sessionId:t,wav_filename:o,metadata_filename:s,metadata_content:encodeURIComponent(JSON.stringify(d))}),l=`${r.apiGatewayUploadUrl}?${c.toString()}`,a=await fetch(l,{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"audio/wav"},body:i});return a.ok?(console.log("Upload successful"),!0):(console.error("Upload failed with status:",a.status),null)}function q(i,e="standalone",t=3e4){let n=`${r.websocketUrl}?sessionId=${i}&role=${e}`;console.log("Connecting WebSocket:",n);let o=new WebSocket(n),s=new Promise((c,l)=>{o.onopen=()=>{console.log("WebSocket connected"),c()},o.onerror=a=>l(a)}),d=new Promise((c,l)=>{let a=setTimeout(()=>{o.close(),l(new Error(`Timeout: No WebSocket message received in ${t} ms`))},t);o.onmessage=m=>{clearTimeout(a),console.log("WebSocket message received:",m.data),o.close(),c(JSON.parse(m.data))},o.onerror=m=>{clearTimeout(a),o.close(),l(new Error(`WebSocket error: ${m.message}`))},o.onclose=()=>{console.log("WebSocket closed")}});return{ws:o,ready:s,message:d}}function f(i,e=null){r.integrationMode==="debug"?b(i):r.integrationMode==="form-fill"&&y(i,e)}function b(i){let e=document.createElement("pre");e.textContent=JSON.stringify(i,null,2),document.body.appendChild(e)}function y(i,e){let t=e?document.getElementById(e):document;Object.entries(i).forEach(([n,o])=>{let s=t.querySelector(`#${n}`);s&&(s.value=o)})}var h=class{constructor(e=null,t=null){console.log("in Constructor ..."),this.formId=e,this.scriptElement=t,this.recorder=new u,this.sessionId=this.generateSessionId(),this.selectedDeviceId=null,this.injectStyles(),this.createDOM(),this.setupUI()}injectStyles(){if(document.getElementById("qiqi-style"))return;let e=document.createElement("style");e.id="qiqi-style",e.textContent=`
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
    `,this.scriptElement.parentNode.insertBefore(this.container,this.scriptElement.nextSibling)}setupUI(){let e=this.sessionId;this.micBtn=this.container.querySelector(`#qiqiMicBtn-${e}`),this.dropdownBtn=this.container.querySelector(`#qiqiDropdownBtn-${e}`),this.micSelect=this.container.querySelector(`#qiqiMicSelect-${e}`),this.micBtn.addEventListener("click",async()=>{if(!this.isRecording)this.isRecording=!0,this.micBtn.classList.add("qiqi-pulsing"),this.micSelect.options.length===0&&await this.populateMicrophones(),await this.recorder.start(this.selectedDeviceId);else{this.isRecording=!1,this.micBtn.classList.remove("qiqi-pulsing");let t=await this.recorder.stop(),n=await p(t,this.formId,this.sessionId);f(n,this.formId)}}),this.dropdownBtn.addEventListener("click",async()=>{this.micSelect.options.length===0&&await this.populateMicrophones(),this.micSelect.classList.toggle("qiqi-hidden")}),this.micSelect.addEventListener("change",()=>{this.selectedDeviceId=this.micSelect.value,this.micSelect.classList.add("qiqi-hidden")})}async populateMicrophones(){let e=await navigator.mediaDevices.getUserMedia({audio:!0}),t=await navigator.mediaDevices.enumerateDevices();this.micSelect.innerHTML="",t.forEach(n=>{if(n.kind==="audioinput"){let o=document.createElement("option");o.value=n.deviceId,o.textContent=n.label||"Microphone",this.micSelect.appendChild(o)}}),this.micSelect.options.length>0&&(this.selectedDeviceId=this.micSelect.options[0].value)}generateSessionId(){return Math.floor(1e5+Math.random()*9e5)}},S=document.querySelectorAll('script[src*="voice-widget"]');S.forEach(i=>{let e=i.getAttribute("data-formid");new h(e,i)});})();
