define(["Tone/core/Tone"], function (Tone) {

	///////////////////////////////////////////////////////////////////////////
	//	TYPES
	///////////////////////////////////////////////////////////////////////////

	/**
	 * Units which a value can take on.
	 * @enum {String}
	 */
	Tone.Type = {
		/** 
		 *  The default value is a number which can take on any value between [-Infinity, Infinity]
		 */
		Default : "number",
		/**
		 *  Time can be described in a number of ways. Read more [Time](https://github.com/TONEnoTONE/Tone.js/wiki/Time).
		 *
		 *  <ul>
		 *  <li>Numbers, which will be taken literally as the time (in seconds).</li>
		 *  <li>Notation, ("4n", "8t") describes time in BPM and time signature relative values.</li>
		 *  <li>TransportTime, ("4:3:2") will also provide tempo and time signature relative times 
		 *  in the form BARS:QUARTERS:SIXTEENTHS.</li>
		 *  <li>Frequency, ("8hz") is converted to the length of the cycle in seconds.</li>
		 *  <li>Now-Relative, ("+1") prefix any of the above with "+" and it will be interpreted as 
		 *  "the current time plus whatever expression follows".</li>
		 *  <li>Expressions, ("3:0 + 2 - (1m / 7)") any of the above can also be combined 
		 *  into a mathematical expression which will be evaluated to compute the desired time.</li>
		 *  <li>No Argument, for methods which accept time, no argument will be interpreted as 
		 *  "now" (i.e. the currentTime).</li>
		 *  </ul>
		 *  
		 *  @typedef {Time}
		 */
		Time : "time",
		/**
		 *  Frequency can be described similar to time, except ultimately the
		 *  values are converted to frequency instead of seconds. A number
		 *  is taken literally as the value in hertz. Additionally any of the 
		 *  Time encodings can be used. Note names in the form
		 *  of NOTE OCTAVE (i.e. C4) are also accepted and converted to their
		 *  frequency value. 
		 *  @typedef {Frequency}
		 */
		Frequency : "frequency",
		/**
		 * Gain is the ratio between the input and the output value of a signal.
		 *  @typedef {Gain}
		 */
		Gain : "gain",
		/** 
		 *  Normal values are within the range [0, 1].
		 *  @typedef {NormalRange}
		 */
		NormalRange : "normalRange",
		/** 
		 *  AudioRange values are between [-1, 1].
		 *  @typedef {AudioRange}
		 */
		AudioRange : "audioRange",
		/** 
		 *  Decibels are a logarithmic unit of measurement which is useful for volume
		 *  because of the logarithmic way that we perceive loudness. 0 decibels 
		 *  means no change in volume. -10db is approximately half as loud and 10db 
		 *  is twice is loud. 
		 *  @typedef {Decibels}
		 */
		Decibels : "db",
		/** 
		 *  Half-step note increments, i.e. 12 is an octave above the root. and 1 is a half-step up.
		 *  @typedef {Interval}
		 */
		Interval : "interval",
		/** 
		 *  Beats per minute. 
		 *  @typedef {BPM}
		 */
		BPM : "bpm",
		/** 
		 *  The value must be greater than 0.
		 *  @typedef {Positive}
		 */
		Positive : "positive",
		/** 
		 *  A cent is a hundredth of a semitone. 
		 *  @typedef {Cents}
		 */
		Cents : "cents",
		/** 
		 *  Angle between 0 and 360. 
		 *  @typedef {Degrees}
		 */
		Degrees : "degrees",
		/** 
		 *  A number representing a midi note.
		 *  @typedef {MIDI}
		 */
		MIDI : "midi",
		/** 
		 *  A colon-separated representation of time in the form of
		 *  BARS:QUARTERS:SIXTEENTHS. 
		 *  @typedef {TransportTime}
		 */
		TransportTime : "transportTime",
		/** 
		 *  Ticks are the basic subunit of the Transport. They are
		 *  the smallest unit of time that the Transport supports.
		 *  @typedef {Ticks}
		 */
		Ticks : "tick",
		/** 
		 *  A frequency represented by a letter name, 
		 *  accidental and octave. This system is known as
		 *  [Scientific Pitch Notation](https://en.wikipedia.org/wiki/Scientific_pitch_notation).
		 *  @typedef {Note}
		 */
		Note : "note",
		/** 
		 *  A string representing a duration relative to a measure. 
		 *  <ul>
		 *  	<li>"4n" = quarter note</li>
		 *   	<li>"2m" = two measures</li>
		 *    	<li>"8t" = eighth-note triplet</li>
		 *  </ul>
		 *  @typedef {Notation}
		 */
		Notation : "notation",
	};

	///////////////////////////////////////////////////////////////////////////
	//	MATCHING TESTS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Test if a function is "now-relative", i.e. starts with "+".
	 *  
	 *  @param {String} str The string to test
	 *  @return {boolean} 
	 *  @method isNowRelative
	 *  @lends Tone.prototype.isNowRelative
	 */
	Tone.prototype.isNowRelative = (function(){
		var nowRelative = new RegExp(/^\W*\+(.)+/i);
		return function(note){
			return nowRelative.test(note);
		};
	})();

	/**
	 *  Tests if a string is in Ticks notation. 
	 *  
	 *  @param {String} str The string to test
	 *  @return {boolean} 
	 *  @method isTicks
	 *  @lends Tone.prototype.isTicks
	 */
	Tone.prototype.isTicks = (function(){
		var tickFormat = new RegExp(/^\d+i$/i);
		return function(note){
			return tickFormat.test(note);
		};
	})();

	/**
	 *  Tests if a string is musical notation.
	 *  i.e.:
	 *  <ul>
	 *  	<li>4n = quarter note</li>
	 *   	<li>2m = two measures</li>
	 *    	<li>8t = eighth-note triplet</li>
	 *  </ul>
	 *  
	 *  @param {String} str The string to test
	 *  @return {boolean} 
	 *  @method isNotation
	 *  @lends Tone.prototype.isNotation
	 */
	Tone.prototype.isNotation = (function(){
		var notationFormat = new RegExp(/^[0-9]+[mnt]$/i);
		return function(note){
			return notationFormat.test(note);
		};
	})();

	/**
	 *  Test if a string is in the transportTime format. 
	 *  "Bars:Beats:Sixteenths"
	 *  @param {String} transportTime
	 *  @return {boolean} 
	 *  @method isTransportTime
	 *  @lends Tone.prototype.isTransportTime
	 */
	Tone.prototype.isTransportTime = (function(){
		var transportTimeFormat = new RegExp(/^\d+(\.\d+)?:\d+(\.\d+)?(:\d+(\.\d+)?)?$/i);
		return function(transportTime){
			return transportTimeFormat.test(transportTime);
		};
	})();

	/**
	 *  Test if a string is in Scientific Pitch Notation: i.e. "C4". 
	 *  @param  {String}  note The note to test
	 *  @return {boolean}      true if it's in the form of a note
	 *  @method isNote
	 *  @lends Tone.prototype.isNote
	 *  @function
	 */
	Tone.prototype.isNote = ( function(){
		var noteFormat = new RegExp(/^[a-g]{1}([b#]{1}|[b#]{0})[0-9]+$/i);
		return function(note){
			return noteFormat.test(note);
		};
	})();

	/**
	 *  Test if the input is in the format of number + hz
	 *  i.e.: 10hz
	 *
	 *  @param {String} freq 
	 *  @return {boolean} 
	 *  @function
	 */
	Tone.prototype.isFrequency = (function(){
		var freqFormat = new RegExp(/^\d*\.?\d+hz$/i);
		return function(freq){
			return freqFormat.test(freq);
		};
	})();

	/**
	 *  Get the Tone.Type of the argument
	 *  @param {String|Number} value The value to test the type of
	 */
	 Tone.prototype.getType = function(value){
		if (this.isTicks(value)){
			return Tone.Type.Ticks;
		} else if (this.isNotation(value)){
			return Tone.Type.Notation;
		} else if (this.isNote(value)){
			return Tone.Type.Note;
		} else if (this.isTransportTime(value)){
			return Tone.Type.TransportTime;
		} else if (this.isFrequency(value)){
			return Tone.Type.Frequency;
		} else if (isFinite(value)){
			return Tone.Type.Default;
		}
	 };

	///////////////////////////////////////////////////////////////////////////
	//	TO SECOND CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *
	 *  convert notation format strings to seconds
	 *  
	 *  @param  {String} notation     
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature 
	 *  @return {number} 
	 *                
	 */
	Tone.prototype.notationToSeconds = function(notation, bpm, timeSignature){
		bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
		timeSignature = this.defaultArg(timeSignature, Tone.Transport.timeSignature);
		var beatTime = (60 / bpm);
		var subdivision = parseInt(notation, 10);
		var beats = 0;
		if (subdivision === 0){
			beats = 0;
		}
		var lastLetter = notation.slice(-1);
		if (lastLetter === "t"){
			beats = (4 / subdivision) * 2/3;
		} else if (lastLetter === "n"){
			beats = 4 / subdivision;
		} else if (lastLetter === "m"){
			beats = subdivision * timeSignature;
		} else {
			beats = 0;
		}
		return beatTime * beats;
	};

	/**
	 *  convert transportTime into seconds.
	 *  
	 *  ie: 4:2:3 == 4 measures + 2 quarters + 3 sixteenths
	 *
	 *  @param  {String} transportTime 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {number}               seconds
	 *
	 *  @lends Tone.prototype.transportTimeToSeconds
	 */
	Tone.prototype.transportTimeToSeconds = function(transportTime, bpm, timeSignature){
		bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
		timeSignature = this.defaultArg(timeSignature, Tone.Transport.timeSignature);
		var measures = 0;
		var quarters = 0;
		var sixteenths = 0;
		var split = transportTime.split(":");
		if (split.length === 2){
			measures = parseFloat(split[0]);
			quarters = parseFloat(split[1]);
		} else if (split.length === 1){
			quarters = parseFloat(split[0]);
		} else if (split.length === 3){
			measures = parseFloat(split[0]);
			quarters = parseFloat(split[1]);
			sixteenths = parseFloat(split[2]);
		}
		var beats = (measures * timeSignature + quarters + sixteenths / 4);
		return beats * this.notationToSeconds("4n");
	};
	
	/**
	 *  convert ticks into seconds
	 *  
	 *  @param  {number} ticks 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {number}               seconds
	 *  @private
	 */
	Tone.prototype.ticksToSeconds = function(ticks, bpm, timeSignature){
		if (this.isUndef(Tone.Transport)){
			return 0;
		}
		ticks = parseInt(ticks);
		var quater = this.notationToSeconds("4n", bpm, timeSignature);
		return (quater * ticks) / (Tone.Transport.PPQ);
	};

	/**
	 *  Convert a frequency into seconds.
	 *  Accepts numbers and strings: i.e. "10hz" or 
	 *  10 both return 0.1. 
	 *  
	 *  @param  {number|string} freq 
	 *  @return {number}      
	 */
	Tone.prototype.frequencyToSeconds = function(freq){
		return 1 / parseFloat(freq);
	};

	/**
	 *  Convert a sample count to seconds.
	 *  @param  {number} samples 
	 *  @return {number}         
	 */
	Tone.prototype.samplesToSeconds = function(samples){
		return samples / this.context.sampleRate;
	};

	/**
	 *  Convert from seconds to samples. 
	 *  @param  {number} seconds 
	 *  @return {number} The number of samples        
	 */
	Tone.prototype.secondsToSamples = function(seconds){
		return seconds * this.context.sampleRate;
	};

	///////////////////////////////////////////////////////////////////////////
	//	FROM SECOND CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Convert seconds to transportTime in the form 
	 *  	"measures:quarters:sixteenths"
	 *
	 *  @param {Number} seconds 
	 *  @param {Number=} bpm 
	 *  @param {Number=} timeSignature
	 *  @return {TransportTime}  
	 */
	Tone.prototype.secondsToTransportTime = function(seconds, bpm, timeSignature){
		bpm = this.defaultArg(bpm, Tone.Transport.bpm.value);
		timeSignature = this.defaultArg(timeSignature, Tone.Transport.timeSignature);
		var quarterTime = this.notationToSeconds("4n");
		var quarters = seconds / quarterTime;
		var measures = Math.floor(quarters / timeSignature);
		var sixteenths = (quarters % 1) * 4;
		quarters = Math.floor(quarters) % timeSignature;
		var progress = [measures, quarters, sixteenths];
		return progress.join(":");
	};

	/**
	 *  Convert a number in seconds to a frequency.
	 *  @param  {number} seconds 
	 *  @return {number}         
	 */
	Tone.prototype.secondsToFrequency = function(seconds){
		return 1/seconds;
	};

	///////////////////////////////////////////////////////////////////////////
	//	GENERALIZED CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Convert seconds to the closest transportTime in the form 
	 *  	measures:quarters:sixteenths
	 *
	 *  @method toTransportTime
	 *  
	 *  @param {Time} seconds 
	 *  @param {number=} bpm 
	 *  @param {number=} timeSignature
	 *  @return {String}  
	 *  
	 *  @lends Tone.prototype.toTransportTime
	 */
	Tone.prototype.toTransportTime = function(time, bpm, timeSignature){
		var seconds = this.toSeconds(time, bpm, timeSignature);
		return this.secondsToTransportTime(seconds, bpm, timeSignature);
	};

	/**
	 *  Convert a frequency representation into a number.
	 *  	
	 *  @param  {Frequency} freq 
	 *  @param {number=} 	now 	if passed in, this number will be 
	 *                        		used for all 'now' relative timings
	 *  @return {number}      the frequency in hertz
	 */
	Tone.prototype.toFrequency = function(freq, now){
		if (this.isFrequency(freq)){
			return parseFloat(freq);
		} else if (this.isNotation(freq) || this.isTransportTime(freq)) {
			return this.secondsToFrequency(this.toSeconds(freq, now));
		} else if (this.isNote(freq)){
			return this.noteToFrequency(freq);
		} else {
			return freq;
		}
	};

	/**
	 *  Convert the time representation into ticks.
	 *  Now-Relative timing will be relative to the current
	 *  Tone.Transport.ticks. 
	 *  @param  {Time} time
	 *  @return {Ticks}   
	 *  @private   
	 */
	Tone.prototype.toTicks = function(time, bpm, timeSignature){
		if (this.isUndef(Tone.Transport)){
			return 0;
		}
		//get the seconds
		var plusNow = 0;
		if (this.isNowRelative(time)){
			time = time.replace(/^\W*/, "");
			plusNow = Tone.Transport.ticks;
		} else if (this.isUndef(time)){
			return Tone.Transport.ticks;
		}
		var seconds = this.toSeconds(time);
		var quarter = this.notationToSeconds("4n", bpm, timeSignature);
		var quarters = seconds / quarter;
		var tickNum = quarters * Tone.Transport.PPQ;
		//quantize to tick value
		return Math.round(tickNum) + plusNow;
	};

	/**
	 *  convert a time into samples
	 *  
	 *  @param  {Time} time
	 *  @return {number}         
	 */
	Tone.prototype.toSamples = function(time){
		var seconds = this.toSeconds(time);
		return Math.round(seconds * this.context.sampleRate);
	};

	/**
	 *  Convert Time into seconds.
	 *  
	 *  Unlike the method which it overrides, this takes into account 
	 *  transporttime and musical notation.
	 *
	 *  Time : 1.40
	 *  Notation: 4n|1m|2t
	 *  TransportTime: 2:4:1 (measure:quarters:sixteens)
	 *  Now Relative: +3n
	 *  Math: 3n+16n or even very complicated expressions ((3n*2)/6 + 1)
	 *
	 *  @override
	 *  @param  {Time} time       
	 *  @param {number=} 	now 	if passed in, this number will be 
	 *                        		used for all 'now' relative timings
	 *  @return {number} 
	 */
	Tone.prototype.toSeconds = function(time, now){
		now = this.defaultArg(now, this.now());
		if (typeof time === "number"){
			return time; //assuming that it's seconds
		} else if (typeof time === "string"){
			var plusTime = 0;
			if(this.isNowRelative(time)) {
				time = time.replace(/^\W*/, "");
				plusTime = now;
			} 
			var components = time.split(/[\(\)\-\+\/\*]/);
			if (components.length > 1){
				var originalTime = time;
				for(var i = 0; i < components.length; i++){
					var symb = components[i].trim();
					if (symb !== ""){
						var val = this.toSeconds(symb);
						time = time.replace(symb, val);
					}
				}
				try {
					//eval is evil, but i think it's safe here
					time = eval(time); // jshint ignore:line
				} catch (e){
					throw new EvalError("problem evaluating Time: "+originalTime);
				}
			} else if (this.isNotation(time)){
				time = this.notationToSeconds(time);
			} else if (this.isTransportTime(time)){
				time = this.transportTimeToSeconds(time);
			} else if (this.isFrequency(time)){
				time = this.frequencyToSeconds(time);
			} else if (this.isTicks(time)){
				time = this.ticksToSeconds(time);
			} else {
				time = parseFloat(time);
			}
			return time + plusTime;
		} else {
			return now;
		}
	};

	///////////////////////////////////////////////////////////////////////////
	//	FREQUENCY CONVERSIONS
	///////////////////////////////////////////////////////////////////////////

	/**
	 *  Note to scale index
	 *  @type  {Object}
	 */
	var noteToScaleIndex = { "c" : 0, "c#" : 1, "db" : 1, "d" : 2, "d#" : 3, "eb" : 3, 
		"e" : 4, "f" : 5, "f#" : 6, "gb" : 6, "g" : 7, "g#" : 8, "ab" : 8, 
		"a" : 9, "a#" : 10, "bb" : 10, "b" : 11
	};

	/**
	 *  scale index to note (sharps)
	 *  @type  {Array}
	 */
	var scaleIndexToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

	/**
	 *  the frequency of Middle C
	 *  @type  {Number}
	 */
	var middleC = 261.6255653005986;

	/**
	 *  Convert a note name to frequency. 
	 *  @param  {String} note
	 *  @return {number}     
	 *  @example
	 * var freq = tone.noteToFrequency("A4"); //returns 440
	 */
	Tone.prototype.noteToFrequency = function(note){
		//break apart the note by frequency and octave
		var parts = note.split(/(\d+)/);
		if (parts.length === 3){
			var index = noteToScaleIndex[parts[0].toLowerCase()];
			var octave = parts[1];
			var noteNumber = index + parseInt(octave, 10) * 12;
			return Math.pow(2, (noteNumber - 48) / 12) * middleC;
		} else {
			return 0;
		}
	};

	/**
	 *  Convert a frequency to a note name (i.e. A4, C#5).
	 *  @param  {number} freq
	 *  @return {String}         
	 */
	Tone.prototype.frequencyToNote = function(freq){
		var log = Math.log(freq / middleC) / Math.LN2;
		var noteNumber = Math.round(12 * log) + 48;
		var octave = Math.floor(noteNumber/12);
		var noteName = scaleIndexToNote[noteNumber % 12];
		return noteName + octave.toString();
	};

	/**
	 *  Convert an interval (in semitones) to a frequency ratio.
	 *
	 *  @param  {Interval} interval the number of semitones above the base note
	 *  @return {number}          the frequency ratio
	 *  @example
	 * tone.intervalToFrequencyRatio(0); // returns 1
	 * tone.intervalToFrequencyRatio(12); // returns 2
	 */
	Tone.prototype.intervalToFrequencyRatio = function(interval){
		return Math.pow(2,(interval/12));
	};

	/**
	 *  Convert a midi note number into a note name. 
	 *
	 *  @param  {MIDI} midiNumber the midi note number
	 *  @return {String}            the note's name and octave
	 *  @example
	 * tone.midiToNote(60); // returns "C3"
	 */
	Tone.prototype.midiToNote = function(midiNumber){
		var octave = Math.floor(midiNumber / 12) - 2;
		var note = midiNumber % 12;
		return scaleIndexToNote[note] + octave;
	};

	/**
	 *  Convert a note to it's midi value. 
	 *
	 *  @param  {String} note the note name (i.e. "C3")
	 *  @return {MIDI} the midi value of that note
	 *  @example
	 * tone.noteToMidi("C3"); // returns 60
	 */
	Tone.prototype.noteToMidi = function(note){
		//break apart the note by frequency and octave
		var parts = note.split(/(\d+)/);
		if (parts.length === 3){
			var index = noteToScaleIndex[parts[0].toLowerCase()];
			var octave = parts[1];
			return index + (parseInt(octave, 10) + 2) * 12;
		} else {
			return 0;
		}
	};

	/**
	 *  Convert a MIDI note to frequency value. 
	 *
	 *  @param  {MIDI} midi The midi number to convert.
	 *  @return {Frequency} the corresponding frequency value
	 *  @example
	 * tone.midiToFrequency(57); // returns 440
	 */
	Tone.prototype.midiToFrequency = function(midi){
		return (440 * Math.pow(2, (midi - 69) / 12));
	};

	return Tone;
});