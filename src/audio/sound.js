
/**
 * @brief very simple class to play audio via Web audio API
 *        IMPORTANT: ensure that the browser supports the file formats you try to play
 *                   before loading to ensure the format you are loading 
 *                   is supported by the browser! 
 * 
 * TODO: update to typescript
 *        
 * @author SurgeExperiments
 * https://www.html5rocks.com/en/tutorials/webaudio/intro/
 */
class Sound {
    constructor(settings) {
        this.context = settings.context;
        const volume = (settings.volume) ? settings.volume : 1.0; 
        this.gainNode = this.context.createGain(); 
        this.gainNode.gain.setValueAtTime(volume, this.context.currentTime);  
        this.gainNode.connect(this.context.destination); 
        // TODO: add fadeDuration
        this.autoStart = (settings.autoStart) ? settings.autoStart : false; 
        this.loop = (settings.loop) ? settings.loop : false; 

        this.buffer = null; 
        this.url = settings.url;
    }
    

    /**
     * @brief basic Ajax handler with error reporting for dl and decode fail 
     *        (via annoying alert boxes). A version of the classic "BufferLoader"
     * @param {@} url 
     */
    loadAudioFile() {
        var request = new XMLHttpRequest();
        request.open('GET', this.url, true);
        request.responseType = 'arraybuffer';

        var self = this; 

        // Decode asynchronously
        request.onload = function() {
            self.context.decodeAudioData(request.response, 
                function(buffer) {
                    if(!buffer) {
                        alert("Sound: error decoding audio file from: " + url); 
                        return; 
                    }
                    self.buffer = buffer;
                    if(self.autoStart) self.play(); 
                }, 
                function(error) {
                    alert("decodeAudioData failed: ", error); 
                }
            );  
        }

        request.onerror = function() {
            alert("Sound: error downloading audio file: " + url);
        }
        request.send();
    }
    
    
    // FOR NOW: only with bufferLoader 
    play() {
        if(this.buffer === null) {
            console.log("Sound:play() ran without a buffer"); 
            return; 
        }
		if (this.source!=undefined) this.source.stop();
		this.source = this.context.createBufferSource();
		this.source.loop = this.loop;
	  	this.source.buffer = this.buffer;
	  	this.source.connect(this.gainNode);
		this.source.start(0); 
    }

    pause() {
        if (this.source==undefined) return;
		this.source.stop();
    }

    stop() {
        if (this.source==undefined) return;
		this.source.stop();
		delete this.source;
    }
}


class SoundBrowserSupportChecker {
    constructor(audioContext) {
        this.context = audioContext; 
    }
   
    supportsFormat(format) {
        let audioElement = document.createElement('audio');
		return audioElement.canPlayType(format || type);
    }

     /**
     * @brief Test if a format can be played by the browser 
     *        Check the Web Audio API for more info on this.
     * @param {*} format: 'audio/mpeg', 'audio/ogg', 'audio/wav' ect
     * @retval "" if there is no support, the format string itself for maybe and 
     */
    testFormats(formatArray) {
            for (val in formatArray) {
                /* Will return "" if not, "maybe" or "probably" if perhaps possible. */
                let retVal = this.supportsFormat(val); 
                if (retVal != "") {
                    return {classifier: val, howPossible: retVal}; 
                }
            }
            return {classifier: "", howPossible: ""};
    }
}