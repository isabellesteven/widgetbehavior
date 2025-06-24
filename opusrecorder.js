export class OpusRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.chunks = [];
    this.selectedDeviceId = null;
    this.stream = null;
  }

  async start(selectedDeviceId) {
    this.selectedDeviceId = selectedDeviceId;
    this.chunks = [];

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        channelCount: 1,
      },
    });

    const options = {audioBitsPerSecond: 16000, mimeType: 'audio/webm;codecs=opus' };
    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };

    this.mediaRecorder.start();
  }

  async stop() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this._cleanup();
        resolve(blob);
      };
      this.mediaRecorder.stop();
    });
  }

  _cleanup() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
  }
}
