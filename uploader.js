import { widgetConfig } from "./config.js";

export async function uploadAudio(blob, formId, sessionId) {
    if (!formId) {
        console.error('No FormId configured');
        return null;
      }
      
      // Obtain Token
      console.log("obtaining Token ...")
      const token = await obtainToken(formId);
      console.log(token)
      if (!token) {
          throw new Error("Unable to obtainToken");
      }
      // Obtain the form transcription
      console.log("obtaining Transcript** ...")
      const responseJson = await obtainFormTranscription(blob, formId, sessionId, token);

      // TBD Add more error checking
      if (!response) {
        throw new Error("Unable to obtainFormTranscription");
    }

    return responseJson
}

async function obtainToken(formId){
    if (!formId) {
        console.error('No FormId configured');
    }

    const response = await fetch(`${widgetConfig.tokenEndpoint}?formId=${formId}`);
    if (!response.ok) {
        throw new Error("Unable to fetch token");
    }
    const data = await response.json();
    return data.token;
}

async function obtainFormTranscription(blob, formId, sessionId, token){
    const role = "standalone";

    const filename = `${sessionId}.wav`;
    const metadataFilename = `${sessionId}.json`;

    const metadata = {
        app_template: " ",
        formId: formId,
        param3: "parameter3"
    };

    const queryParams = new URLSearchParams({
        sessionId: sessionId,
        wav_filename: filename,
        metadata_filename: metadataFilename,
        metadata_content: btoa(JSON.stringify(metadata))
    });
    console.log("Calling waitForWebSocketMessageAfterPostxxxx");
    console.log(`${widgetConfig.websocketUrl}?sessionId=${sessionId}&role=${role}`);
    console.log(queryParams.toString);
    console.log(`${widgetConfig.apiGatewayUploadUrl}?${queryParams.toString()}`)
    await waitForWebSocketMessageAfterPost(
        `${widgetConfig.websocketUrl}?sessionId=${sessionId}&role=${role}`,
        `${widgetConfig.apiGatewayUploadUrl}?${queryParams.toString()}`,
        blob,
        7000
      )
        .then((message) => {
          console.log("Got WebSocket response:", message);
        })
        .catch((err) => {
          console.error("Error:", err.message);
        });
    return;  // eventually return the JSON from here.
}

async function waitForWebSocketMessageAfterPost(wsUrl, apiUrl, audioBlob, timeoutMs = 5000) {
  console.log("inwait ...")
  console.log(wsUrl);
  console.log(apiUrl);
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      let timeoutId;
  
      ws.onopen = async () => {
        console.log("WebSocket connected. Sending POST to REST API...");
  
        // Start timeout timer
        timeoutId = setTimeout(() => {
          ws.close();
          reject(new Error(`Timeout: No WebSocket message received in ${timeoutMs} ms`));
        }, timeoutMs);
  
        try{
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "audio/wav"
            },
            body: audioBlob
        });
  
          if (!response.ok) {
            console.log("POST Failed ...")
            clearTimeout(timeoutId);
            ws.close();
            reject(new Error(`REST API call failed with status ${response.status}`));
          } else {
            console.log("REST API call succeeded");
          }
        } catch (err) {
          clearTimeout(timeoutId);
          ws.close();
          reject(new Error(`REST API call error: ${err.message}`));
        }
      };
  
      ws.onmessage = (event) => {
        clearTimeout(timeoutId);
        console.log("WebSocket message received:", event.data);
        ws.close();
        resolve(event.data);
      };
  
      ws.onerror = (err) => {
        clearTimeout(timeoutId);
        ws.close();
        reject(new Error(`WebSocket error: ${err.message}`));
      };
  
      ws.onclose = () => {
        console.log("WebSocket closed");
      };
    });
  }
  