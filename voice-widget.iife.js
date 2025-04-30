(()=>{var d=class{constructor(){this.mediaRecorder=null,this.audioChunks=[],this.selectedDeviceId=null,this.stream=null}async start(e){this.selectedDeviceId=e,this.stream=await navigator.mediaDevices.getUserMedia({audio:{deviceId:{exact:e}}}),this.mediaRecorder=new MediaRecorder(this.stream),this.mediaRecorder.ondataavailable=t=>{this.audioChunks.push(t.data)},this.mediaRecorder.start()}async stop(){return new Promise(e=>{this.mediaRecorder.onstop=async()=>{let t=new Blob(this.audioChunks,{type:"audio/webm"});this.stream.getTracks().forEach(i=>i.stop()),e(t)},this.mediaRecorder.stop()})}};var c={websocketUrl:"wss://ksamuwry9l.execute-api.us-east-1.amazonaws.com/production/",apiGatewayUploadUrl:"https://3c8t1k5p92.execute-api.us-east-1.amazonaws.com/stage/upload",tokenEndpoint:"https://q19mkers91.execute-api.us-east-1.amazonaws.com/dev/widget/token",integrationMode:"form-fill",debugMode:!1};async function u(o,e,t){if(!e)return console.error("No FormId configured"),null;console.log("obtaining Token ...");let i=await g(e);if(console.log(i),!i)throw new Error("Unable to obtainToken");console.log("obtaining Transcript** ...");let s=await f(o,e,t,i);if(!response)throw new Error("Unable to obtainFormTranscription");return s}async function g(o){o||console.error("No FormId configured");let e=await fetch(`${c.tokenEndpoint}?formId=${o}`);if(!e.ok)throw new Error("Unable to fetch token");return(await e.json()).token}async function f(o,e,t,i){let s="standalone",r=`${t}.wav`,a=`${t}.json`,l={app_template:" ",formId:e,param3:"parameter3"},n=new URLSearchParams({sessionId:t,wav_filename:r,metadata_filename:a,metadata_content:btoa(JSON.stringify(l))});console.log("Calling waitForWebSocketMessageAfterPostxxxx"),console.log(l),console.log(`${c.websocketUrl}?sessionId=${t}&role=${s}`),console.log("queryParams contents:",[...n.entries()]),console.log(`${c.apiGatewayUploadUrl}?${n.toString()}`),await w(`${c.websocketUrl}?sessionId=${t}&role=${s}`,`${c.apiGatewayUploadUrl}?${n.toString()}`,o,7e3).then(m=>{console.log("Got WebSocket response:",m)}).catch(m=>{console.error("Error:",m.message)})}async function w(o,e,t,i=5e3){return console.log("inwait ..."),console.log(o),console.log(e),new Promise((s,r)=>{let a=new WebSocket(o),l;a.onopen=async()=>{console.log("WebSocket connected. Sending POST to REST API..."),l=setTimeout(()=>{a.close(),r(new Error(`Timeout: No WebSocket message received in ${i} ms`))},i);try{let n=await fetch(e,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"audio/wav"},body:t});n.ok?console.log("REST API call succeeded"):(console.log("POST Failed ..."),clearTimeout(l),a.close(),r(new Error(`REST API call failed with status ${n.status}`)))}catch(n){clearTimeout(l),a.close(),r(new Error(`REST API call error: ${n.message}`))}},a.onmessage=n=>{clearTimeout(l),console.log("WebSocket message received:",n.data),a.close(),s(n.data)},a.onerror=n=>{clearTimeout(l),a.close(),r(new Error(`WebSocket error: ${n.message}`))},a.onclose=()=>{console.log("WebSocket closed")}})}function p(o,e=null){c.integrationMode==="debug"?b(o):c.integrationMode==="form-fill"&&q(o,e)}function b(o){let e=document.createElement("pre");e.textContent=JSON.stringify(o,null,2),document.body.appendChild(e)}function q(o,e){let t=e?document.getElementById(e):document;Object.entries(o).forEach(([i,s])=>{let r=t.querySelector(`#${i}`);r&&(r.value=s)})}var h=class{constructor(e=null,t=null){console.log("in Constructor ..."),this.formId=e,this.scriptElement=t,this.recorder=new d,this.sessionId=this.generateSessionId(),this.selectedDeviceId=null,this.injectStyles(),this.createDOM(),this.setupUI()}injectStyles(){if(document.getElementById("qiqi-style"))return;let e=document.createElement("style");e.id="qiqi-style",e.textContent=`
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
    `,this.scriptElement.parentNode.insertBefore(this.container,this.scriptElement.nextSibling)}setupUI(){let e=this.sessionId;this.micBtn=this.container.querySelector(`#qiqiMicBtn-${e}`),this.dropdownBtn=this.container.querySelector(`#qiqiDropdownBtn-${e}`),this.micSelect=this.container.querySelector(`#qiqiMicSelect-${e}`),this.micBtn.addEventListener("click",async()=>{if(!this.isRecording)this.isRecording=!0,this.micBtn.classList.add("qiqi-pulsing"),this.micSelect.options.length===0&&await this.populateMicrophones(),await this.recorder.start(this.selectedDeviceId);else{this.isRecording=!1,this.micBtn.classList.remove("qiqi-pulsing");let t=await this.recorder.stop(),i=await u(t,this.formId,this.sessionId);p(i,this.formId)}}),this.dropdownBtn.addEventListener("click",async()=>{this.micSelect.options.length===0&&await this.populateMicrophones(),this.micSelect.classList.toggle("qiqi-hidden")}),this.micSelect.addEventListener("change",()=>{this.selectedDeviceId=this.micSelect.value,this.micSelect.classList.add("qiqi-hidden")})}async populateMicrophones(){let e=await navigator.mediaDevices.getUserMedia({audio:!0}),t=await navigator.mediaDevices.enumerateDevices();this.micSelect.innerHTML="",t.forEach(i=>{if(i.kind==="audioinput"){let s=document.createElement("option");s.value=i.deviceId,s.textContent=i.label||"Microphone",this.micSelect.appendChild(s)}}),this.micSelect.options.length>0&&(this.selectedDeviceId=this.micSelect.options[0].value)}generateSessionId(){return Math.floor(1e5+Math.random()*9e5)}},S=document.querySelectorAll('script[src*="voice-widget"]');S.forEach(o=>{let e=o.getAttribute("data-formid");new h(e,o)});})();
