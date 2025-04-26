import { widgetConfig } from "./config.js";

export async function uploadAudio(blob, sessionId) {
  const tokenRes = await fetch(`${widgetConfig.tokenEndpoint}?sessionId=${sessionId}`);
  const { token } = await tokenRes.json();

  const formData = new FormData();
  formData.append("file", blob);

  const uploadRes = await fetch(`${widgetConfig.backendApiUrl}?sessionId=${sessionId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const responseJson = await uploadRes.json();
  return responseJson;
}