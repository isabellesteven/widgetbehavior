(()=>{var d=class{constructor(){this.mediaRecorder=null,this.audioChunks=[],this.selectedDeviceId=null,this.stream=null}async start(e){this.selectedDeviceId=e,this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e}}}),this.mediaRecorder=new MediaRecorder(this.stream),this.mediaRecorder.ondataavailable=t=>{this.audioChunks.push(t.data)},this.mediaRecorder.start()}async stop(){return new Promise(e=>{this.mediaRecorder.onstop=async()=>{let t=new Blob(this.audioChunks,{type:"audio/webm"});this.stream.getTracks().forEach(o=>o.stop()),e(t)},this.mediaRecorder.stop()})}};var l={websocketUrl:"wss://ksamuwry9l.execute-api.us-east-1.amazonaws.com/production/",apiGatewayUploadUrl:"https://3c8t1k5p92.execute-api.us-east-1.amazonaws.com/stage/upload",tokenEndpoint:"https://q19mkers91.execute-api.us-east-1.amazonaws.com/dev/widget/token",integrationMode:"form-fill",debugMode:!1};async function u(i,e,t){if(!e)return console.error("No FormId configured"),null;console.log("obtaining Token ...");let o=await f(e);if(!o)throw new Error("Unable to obtainToken");console.log("obtaining Transcript ...");let n=await g(i,e,t,o);if(!response)throw new Error("Unable to obtainFormTranscription");return n}async function f(i){i||console.error("No FormId configured");let e=await fetch(`${l.tokenEndpoint}?formId=${i}`);if(!e.ok)throw new Error("Unable to fetch token");return(await e.json()).token}async function g(i,e,t,o){let n="standalone",a=`${t}.wav`,s=`${t}.json`,c={app_template:" ",formId:e,param3:"parameter3"},r=new URLSearchParams({sessionId:t,wav_filename:a,metadata_filename:s,metadata_content:btoa(JSON.stringify(c))});w(`${l.websocketUrl}?sessionId=${t}&role=${n}`,`${l.apiGatewayUploadUrl}?${r.toString()}`,audioBlob,7e3).then(m=>{console.log("Got WebSocket response:",m)}).catch(m=>{console.error("Error:",m.message)})}async function w(i,e,t,o=5e3){return new Promise((n,a)=>{let s=new WebSocket(i),c;s.onopen=async()=>{console.log("WebSocket connected. Sending POST to REST API..."),c=setTimeout(()=>{s.close(),a(new Error(`Timeout: No WebSocket message received in ${o} ms`))},o);try{let r=await fetch(e,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"audio/wav"},body:t});r.ok?console.log("REST API call succeeded"):(clearTimeout(c),s.close(),a(new Error(`REST API call failed with status ${r.status}`)))}catch(r){clearTimeout(c),s.close(),a(new Error(`REST API call error: ${r.message}`))}},s.onmessage=r=>{clearTimeout(c),console.log("WebSocket message received:",r.data),s.close(),n(r.data)},s.onerror=r=>{clearTimeout(c),s.close(),a(new Error(`WebSocket error: ${r.message}`))},s.onclose=()=>{console.log("WebSocket closed")}})}function p(i,e=null){l.integrationMode==="debug"?b(i):l.integrationMode==="form-fill"&&q(i,e)}function b(i){let e=document.createElement("pre");e.textContent=JSON.stringify(i,null,2),document.body.appendChild(e)}function q(i,e){let t=e?document.getElementById(e):document;Object.entries(i).forEach(([o,n])=>{let a=t.querySelector(`#${o}`);a&&(a.value=n)})}var h=class{constructor(e=null,t=null){console.log("in Constructor ..."),this.formId=e,this.scriptElement=t,this.recorder=new d,this.sessionId=this.generateSessionId(),this.selectedDeviceId=null,this.injectStyles(),this.createDOM(),this.setupUI()}injectStyles(){if(document.getElementById("qiqi-style"))return;let e=document.createElement("style");e.id="qiqi-style",e.textContent=`
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
    `,this.scriptElement.parentNode.insertBefore(this.container,this.scriptElement.nextSibling)}setupUI(){let e=this.sessionId;this.micBtn=this.container.querySelector(`#qiqiMicBtn-${e}`),this.dropdownBtn=this.container.querySelector(`#qiqiDropdownBtn-${e}`),this.micSelect=this.container.querySelector(`#qiqiMicSelect-${e}`),this.micBtn.addEventListener("click",async()=>{if(!this.isRecording)this.isRecording=!0,this.micBtn.classList.add("qiqi-pulsing"),this.micSelect.options.length===0&&await this.populateMicrophones(),await this.recorder.start(this.selectedDeviceId);else{this.isRecording=!1,this.micBtn.classList.remove("qiqi-pulsing");let t=await this.recorder.stop(),o=await u(t,this.formId,this.sessionId);p(o,this.formId)}}),this.dropdownBtn.addEventListener("click",async()=>{this.micSelect.options.length===0&&await this.populateMicrophones(),this.micSelect.classList.toggle("qiqi-hidden")}),this.micSelect.addEventListener("change",()=>{this.selectedDeviceId=this.micSelect.value,this.micSelect.classList.add("qiqi-hidden")})}async populateMicrophones(){let e=await navigator.mediaDevices.getUserMedia({audio:!0}),t=await navigator.mediaDevices.enumerateDevices();this.micSelect.innerHTML="",t.forEach(o=>{if(o.kind==="audioinput"){let n=document.createElement("option");n.value=o.deviceId,n.textContent=o.label||"Microphone",this.micSelect.appendChild(n)}}),this.micSelect.options.length>0&&(this.selectedDeviceId=this.micSelect.options[0].value)}generateSessionId(){return Math.floor(1e5+Math.random()*9e5)}},y=document.querySelectorAll('script[type="module"][src$="voice-widget.js"]');y.forEach(i=>{let e=i.getAttribute("data-formid");new h(e,i)});})();
