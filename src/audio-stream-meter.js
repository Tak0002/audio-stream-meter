"use strict";

module.exports = {
	audioStreamProcessor: createAudioStreamProcessor,
};

function createAudioStreamProcessor(audioContext, callback, config = {}) {
	var scriptProcessor = audioContext.createScriptProcessor(config.bufferSize || 1024);	
	
	scriptProcessor.onaudioprocess = volumeAudioStream;
	scriptProcessor.audioStreamCallback = callback;
	scriptProcessor.close = close;

	scriptProcessor.volume = 0;
	scriptProcessor.config = {
		volumeFall: config.volumeFall || 0.95, /* (0,1) more means volume wave will be fall slower */
	};

	scriptProcessor.connect(audioContext.destination);
	
	return scriptProcessor;
};

function volumeAudioStream(event) {
	var buffer = event.inputBuffer.getChannelData(0);
	var sum = 0;

    for (var i = 0 ; i < buffer.length ; i++) {
    	sum += buffer[i] * buffer[i];
    }
    var rms =  Math.sqrt(sum / buffer.length);
    this.volume = Math.max(rms, this.volume * this.config.volumeFall);
	
	this.audioStreamCallback();
};

function close() {
	this.disconnect();
	this.onaudioprocess = null;
};