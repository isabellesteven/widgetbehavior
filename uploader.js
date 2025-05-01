// uploader.js
import { widgetConfig } from "./config.js";

export async function uploadAudio(blob, formId, sessionId) {
  if (!formId) {
    console.error("No FormId configured");
    return null;
  }

  // Obtain token
  console.log("Obtaining token...");
  const token = await obtainToken(formId);
  console.log("Token:", token);
  if (!token) {
    throw new Error("Unable to obtain token");
  }

  // Start WebSocket listener before posting
  const { ready, message } = createWebSocketListener(sessionId, "standalone");
  await ready;

  // Upload audio
  const jobId = await postAudioAndMetadata(blob, formId, sessionId, token);
  if (!jobId) {
    throw new Error("Unable to upload audio");
  }

  // Wait for WebSocket message
  const responseJson = await message;
  return responseJson;
}

async function obtainToken(formId) {
  const response = await fetch(`${widgetConfig.tokenEndpoint}?formId=${formId}`);
  if (!response.ok) {
    throw new Error("Unable to fetch token");
  }
  const data = await response.json();
  return data.token;
}

async function postAudioAndMetadata(blob, formId, sessionId, token) {
  const filename = `${sessionId}.wav`;
  const metadataFilename = `${sessionId}.json`;

  const metadata = {
    app_template: " ",
    formId: formId,
    param3: "parameter3",
  };

  const queryParams = new URLSearchParams({
    sessionId: sessionId,
    wav_filename: filename,
    metadata_filename: metadataFilename,
    metadata_content: btoa(JSON.stringify(metadata)),
  });

  const apiUrl = `${widgetConfig.apiGatewayUploadUrl}?${queryParams.toString()}`;
  console.log("Posting to", apiUrl);
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "audio/wav",
    },
    body: blob,
  });
  console.log(response);
  if (!response.ok) {
    console.error("Upload failed with status:", response.status);
    return null;
  }

  console.log("Upload successful");
  return true; // Placeholder — you could return a job ID or status here
}

function createWebSocketListener(sessionId, role = "standalone", timeoutMs = 30000) {
  const wsUrl = `${widgetConfig.websocketUrl}?sessionId=${sessionId}&role=${role}`;
  console.log("Connecting WebSocket:", wsUrl);

  const ws = new WebSocket(wsUrl);

  const ready = new Promise((resolve, reject) => {
    ws.onopen = () => {
      console.log("WebSocket connected");
      resolve();
    };
    ws.onerror = (err) => reject(err);
  });

  const message = new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      ws.close();
      console.log("timeout");
      reject(new Error(`Timeout: No WebSocket message received in ${timeoutMs} ms`));
    }, timeoutMs);

    ws.onmessage = (event) => {
      clearTimeout(timeoutId);
      console.log("WebSocket message received:", event.data);
      ws.close();
      resolve(JSON.parse(event.data));
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

  return { ws, ready, message };
}

  