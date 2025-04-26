export class Recorder {
    constructor() {
      this.mediaRecorder = null;
      this.audioChunks = [];
      this.selectedDeviceId = null;
      this.stream = null;
    }
  
    async start(selectedDeviceId) {
      this.selectedDeviceId = selectedDeviceId;
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: selectedDeviceId } },
      });
      this.mediaRecorder = new MediaRecorder(this.stream);
  
      this.mediaRecorder.ondataavailable = event => {
        this.audioChunks.push(event.data);
      };
  
      this.mediaRecorder.start();
    }
  
    async stop() {
      return new Promise(resolve => {
        this.mediaRecorder.onstop = async () => {
          const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.stream.getTracks().forEach(track => track.stop());
          resolve(blob);
        };
        this.mediaRecorder.stop();
      });
    }
  }
  