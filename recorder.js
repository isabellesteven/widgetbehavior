// recorder.js
export class Recorder {
  constructor() {
    this.audioChunks = [];
    this.selectedDeviceId = null;
    this.stream = null;
    this.audioContext = null;
    this.sourceSampleRate = null;
    this.targetSampleRate = 16000;
    this.bufferedData = [];
    this._workletModuleLoaded = false;
  }

  async start(selectedDeviceId) {
    //this.bufferedData = [];
    this.selectedDeviceId = selectedDeviceId;
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: selectedDeviceId } },
    });

    this.audioContext = new AudioContext();
    this.sourceSampleRate = this.audioContext.sampleRate;
    const source = this.audioContext.createMediaStreamSource(this.stream);

    const processor = new AudioWorkletNode(await this._getAudioWorkletContext(), 'capture-processor');
    processor.port.onmessage = (e) => {
      const float32Chunk = e.data;
      this.bufferedData.push(...float32Chunk);
    };

    source.connect(processor).connect(this.audioContext.destination);
    this.processor = processor;
  }

  async stop() {
    return new Promise(async (resolve) => {
      this.processor.disconnect();
      this.stream.getTracks().forEach((track) => track.stop());
      await this.audioContext.close();
      this.audioContext = null;

      const resampled = await this._resampleToTarget(this.bufferedData, this.sourceSampleRate, this.targetSampleRate);
      const int16Data = this._convertFloat32ToInt16(resampled);
      const wavBlob = this._encodeWAV(int16Data, this.targetSampleRate);

      // For testing: create download link
   /*   const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recording_${Date.now()}.wav`;
      a.textContent = 'Download WAV';
      document.body.appendChild(a);*/
      resolve(wavBlob);
    });
  }

  async _getAudioWorkletContext() {
    if (!this._workletModuleLoaded) {
      const blob = new Blob([
        `
        class CaptureProcessor extends AudioWorkletProcessor {
          process(inputs) {
            const input = inputs[0][0];
            this.port.postMessage([...input]);
            return true;
          }
        }
        registerProcessor('capture-processor', CaptureProcessor);
        `
      ], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await this.audioContext.audioWorklet.addModule(url);
      this._workletModuleLoaded = true;
    }
    return this.audioContext;
  }

  async _resampleToTarget(input, fromRate, toRate) {
    if (fromRate === toRate) return Float32Array.from(input);

    const offlineCtx = new OfflineAudioContext(1, input.length * toRate / fromRate, toRate);
    const buffer = offlineCtx.createBuffer(1, input.length, fromRate);
    buffer.copyToChannel(Float32Array.from(input), 0);

    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(offlineCtx.destination);
    source.start();

    const renderedBuffer = await offlineCtx.startRendering();
    return renderedBuffer.getChannelData(0);
  }

  _convertFloat32ToInt16(buffer) {
    const int16 = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      int16[i] = Math.max(-32768, Math.min(32767, buffer[i] * 32767));
    }
    return int16;
  }

  _encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (view, offset, str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    for (let i = 0; i < samples.length; i++) {
      view.setInt16(44 + i * 2, samples[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }
}
