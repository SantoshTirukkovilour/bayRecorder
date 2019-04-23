'use strict';

// --------------------------------------------------
// Santosh Tirukkovilour
// MIT License   -
// --------------------------------------------------

function bayRecorder(mediaStream, config) {
}

bayRecorder.version = '1.0.0';

if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
    module.exports = bayRecorder;
}

if (typeof define === 'function' && define.amd) {
    define('bayRecorder', [], function() {
        return bayRecorder;
    });
}

function bayAudioRecorder(stream, config) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if(getBrowser() == "Chrome"){
        var constraints = {"audio": true};//Chrome
    }else if(getBrowser() == "Firefox"){
        var constraints = {audio: true}; //Firefox
    }

    var dataElement = document.querySelector('#data');
    var downloadLink = document.querySelector('a#downloadLink');


    function errorCallback(error){
    }

    var mediaRecorder;
    var canvas;
    var audioCtx;
    var canvasCtx;
    var chunks = [];
    var count = 0;

    var audioContext = null;
    var canvasContext = null;
    var meter = null;
    var WIDTH=100;
    var HEIGHT=25;
    var rafID = null;
    var canvas = $('#canvas')[0];
    if(canvas)
        canvasContext = canvas.getContext('2d');
    this.startRecording = function() {
        console.log('Start recording...');
        if (typeof MediaRecorder.isTypeSupported == 'function'){
            var options = {mimeType: 'audio/webm'};
            mediaRecorder = new MediaRecorder(stream, options);
        }else{
            console.log('Using default codecs for browser');
            mediaRecorder = new MediaRecorder(stream);
        }
        /*audioCtx = new (window.AudioContext || webkitAudioContext)();
        canvas = document.getElementById("canvas");
        canvasCtx = canvas.getContext("2d");
        visualize(stream);*/
        if(canvas){
            audioContext = new AudioContext();
            gotStream(stream);
        }
        mediaRecorder.start(10);
        mediaRecorder.ondataavailable = function(e) {
            if (e.data.size > 0){
                chunks.push(e.data);
            }
        };

        mediaRecorder.onerror = function(e){
            //console.log('Error: ' + e);
            //console.log('Error: ', e);
        };


        mediaRecorder.onstart = function(){
            //console.log('Started & state = ' + mediaRecorder.state);
        };

        mediaRecorder.onstop = function(e){
            //console.log('Stopped  & state = ' + mediaRecorder.state);
            var blob = new Blob(chunks, {type: "audio/wav"});
            chunks = [];
        };

        mediaRecorder.onpause = function(){
            //console.log('Paused & state = ' + mediaRecorder.state);
        }

        mediaRecorder.onresume = function(){
            //console.log('Resumed  & state = ' + mediaRecorder.state);
        }

        mediaRecorder.onwarning = function(e){
            //console.log('Warning: ' + e);
        };
    };


    function recordAudio(callback){
        if (typeof MediaRecorder === 'undefined' || !navigator.getUserMedia) {
            alert('MediaRecorder not supported on your browser, use Firefox 30 or Chrome 49 instead.');
        }else {
            navigator.getUserMedia(constraints, startRecording, errorCallback);
        }
        if(callback)
            callback();
    }

    this.stopRecBlob = function(callback) {
        mediaRecorder.stop();
        if(meter)
            meter.shutdown();

        var base64data;
        var blob = new Blob(chunks, {type: "audio/wav"});
        callback(blob);
    };
	
	this.stopRecBase64 = function(callback) {
        mediaRecorder.stop();
        if(meter)
            meter.shutdown();

        var base64data;
        var blob = new Blob(chunks, {type: "audio/wav"});
        var reader = new window.FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
            base64data = reader.result;
            callback(base64data.split(',')[1]);
        }
    };

    function onPauseResumeClicked(){
        if(pauseResBtn.textContent === "Pause"){
            mediaRecorder.pause();
        }else{
            mediaRecorder.resume();
        }
    }

    function playBackAudio(callback){
        var blob = new Blob(chunks, {type: "audio/wav"});
        var url = window.URL.createObjectURL(blob);
        callback(url);
    }

// volume meter
    var mediaStreamSource = null;

    function gotStream(stream) {
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        meter = createAudioMeter(audioContext,0.98,0.95,100);
        mediaStreamSource.connect(meter);
        drawLoop();
    }

    function drawLoop( time ) {
        canvasContext.clearRect(0,0,WIDTH,HEIGHT);
        if(meter){
            if (meter.checkClipping())
                canvasContext.fillStyle = "green";
            else
                canvasContext.fillStyle = "green";
            canvasContext.fillRect(0, 0, meter.volume*WIDTH*1.4, HEIGHT);

            rafID = window.requestAnimationFrame( drawLoop );
        }
    }
//browser ID
    function getBrowser(){
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName  = navigator.appName;
        var fullVersion  = ''+parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion,10);
        var nameOffset,verOffset,ix;

        // In Opera, the true version is after "Opera" or after "Version"
        if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
            browserName = "Opera";
            fullVersion = nAgt.substring(verOffset+6);
            if ((verOffset=nAgt.indexOf("Version"))!=-1)
                fullVersion = nAgt.substring(verOffset+8);
        }
        // In MSIE, the true version is after "MSIE" in userAgent
        else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
            browserName = "Microsoft Internet Explorer";
            fullVersion = nAgt.substring(verOffset+5);
        }
        // In Chrome, the true version is after "Chrome"
        else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
            browserName = "Chrome";
            fullVersion = nAgt.substring(verOffset+7);
        }
        // In Safari, the true version is after "Safari" or after "Version"
        else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
            browserName = "Safari";
            fullVersion = nAgt.substring(verOffset+7);
            if ((verOffset=nAgt.indexOf("Version"))!=-1)
                fullVersion = nAgt.substring(verOffset+8);
        }
        // In Firefox, the true version is after "Firefox"
        else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
            browserName = "Firefox";
            fullVersion = nAgt.substring(verOffset+8);
        }
        // In most other browsers, "name/version" is at the end of userAgent
        else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <
            (verOffset=nAgt.lastIndexOf('/')) )
        {
            browserName = nAgt.substring(nameOffset,verOffset);
            fullVersion = nAgt.substring(verOffset+1);
            if (browserName.toLowerCase()==browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }
        // trim the fullVersion string at semicolon/space if present
        if ((ix=fullVersion.indexOf(";"))!=-1)
            fullVersion=fullVersion.substring(0,ix);
        if ((ix=fullVersion.indexOf(" "))!=-1)
            fullVersion=fullVersion.substring(0,ix);

        majorVersion = parseInt(''+fullVersion,10);
        if (isNaN(majorVersion)) {
            fullVersion  = ''+parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion,10);
        }
        return browserName;
    }


// Volume meter
    function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
        var processor = audioContext.createScriptProcessor(512);
        processor.onaudioprocess = volumeAudioProcess;
        processor.clipping = false;
        processor.lastClip = 0;
        processor.volume = 0;
        processor.clipLevel = clipLevel || 0.98;
        processor.averaging = averaging || 0.95;
        processor.clipLag = clipLag || 750;

        // this will have no effect, since we don't copy the input to the output,
        // but works around a current Chrome bug.
        processor.connect(audioContext.destination);

        processor.checkClipping =
            function(){
                if (!this.clipping)
                    return false;
                if ((this.lastClip + this.clipLag) < window.performance.now())
                    this.clipping = false;
                return this.clipping;
            };

        processor.shutdown =
            function(){
                this.disconnect();
                this.onaudioprocess = null;
            };

        return processor;
    }

    function volumeAudioProcess( event ) {
        var buf = event.inputBuffer.getChannelData(0);
        var bufLength = buf.length;
        var sum = 0;
        var x;

        // Do a root-mean-square on the samples: sum up the squares...
        for (var i=0; i<bufLength; i++) {
            x = buf[i];
            if (Math.abs(x)>=this.clipLevel) {
                this.clipping = true;
                this.lastClip = window.performance.now();
            }
            sum += x * x;
        }

        // ... then take the square root of the sum.
        var rms =  Math.sqrt(sum / bufLength);

        // Now smooth this out with the averaging factor applied
        // to the previous sample - take the max here because we
        // want "fast attack, slow release."
        this.volume = Math.max(rms, this.volume*this.averaging);
    }
}

if (typeof bayRecorder !== 'undefined') {
    bayRecorder.bayAudioRecorder = bayAudioRecorder;
}
