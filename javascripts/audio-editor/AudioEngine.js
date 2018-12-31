import ADPCMSoundDecoder from './ADPCMSoundDecoder.js';

/**
 * Wrapper to ensure that audioContext.decodeAudioData is a promise
 * @param {object} audioContext The current AudioContext
 * @param {ArrayBuffer} buffer Audio data buffer to decode
 * @return {Promise} A promise that resolves to the decoded audio
 */
const decodeAudioData = function (audioContext, buffer) {
    // Check for newer promise-based API
    if (audioContext.decodeAudioData.length === 1) {
        return audioContext.decodeAudioData(buffer);
    }
    // Fall back to callback API
    return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(buffer,
            decodedAudio => resolve(decodedAudio),
            error => reject(error)
        );
    });
};

/**
 * There is a single instance of the AudioEngine. It handles global audio
 * properties and effects, loads all the audio buffers for sounds belonging to
 * sprites.
 */
class AudioEngine {
    constructor (audioContext) {
        /**
         * AudioContext to play and manipulate sounds with a graph of source
         * and effect nodes.
         * @type {AudioContext}
         */
        this.audioContext = audioContext;
    }

    /**
     * Decode a sound, decompressing it into audio samples.
     * @param {object} sound - an object containing audio data and metadata for
     *     a sound
     * @param {Buffer} sound.data - sound data loaded from scratch-storage
     * @returns {?Promise} - a promise which will resolve to the sound id and
     *     buffer if decoded
     */
    _decodeSound (sound) {
        // Make a copy of the buffer because decoding detaches the original
        // buffer
        const bufferCopy1 = sound.data.buffer.slice(0);

        // Attempt to decode the sound using the browser's native audio data
        // decoder If that fails, attempt to decode as ADPCM
        const decoding = decodeAudioData(this.audioContext, bufferCopy1)
            .catch(() => {
                // The audio context failed to parse the sound data
                // we gave it, so try to decode as 'adpcm'

                // First we need to create another copy of our original data
                const bufferCopy2 = sound.data.buffer.slice(0);
                // Try decoding as adpcm
                return new ADPCMSoundDecoder(this.audioContext).decode(bufferCopy2);
            })
            .then(
                buffer => buffer,
                error => {
                    console.warn('audio data could not be decoded', error);
                }
            );

        return decoding;
    }
}

export default AudioEngine;
