export function toJSONP(obj) {
    return JSON.stringify(obj, undefined, "\t");
}

export function generateHex8() {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    // Convert the 32-bit unsigned integer to a hex string and pad with leading zeros
    return arr[0].toString(16).padStart(8, '0');
}

export function generateHex16() {
    const arr = new BigUint64Array(1);
    crypto.getRandomValues(arr);
    // Convert the 64-bit BigInt to a hex string and pad to 16 characters
    return arr[0].toString(16).padStart(16, '0');
}

export const defaultStateUpdateCbFn = ((name = "", value = undefined) => {
});

export function encodeBase64Url(input) {
    // Convert string to a Uint8Array byte array
    const bytes = new TextEncoder().encode(input);

    // Encode to Base64url directly, omitting trailing '=' padding characters
    return bytes.toBase64({
        alphabet: "base64url",
        omitPadding: true
    });
}

export function decodeBase64Url(input) {
    // Parse the Base64url string into raw bytes
    const bytes = Uint8Array.fromBase64(input, {
        alphabet: "base64url"
    });

    // Decode the bytes back into a UTF-8 string
    return new TextDecoder().decode(bytes);
}

export function parseQueryObject() {
    return Object.fromEntries(window.location.search.replace('?', '&').split("&").filter(str => !!str).map(str => str.split('=').map(urie => decodeURI(urie))));
}

export function constructQueryString(obj) {
    return `?${Object.entries(obj).map(e => e.join('=')).join('&')}`;
}
export const toMillis = (() => {
    const milli = 1;
    const second = 1000 * milli;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;
    return { milli, second, minute, hour, day };
})();export function formatTime(milliseconds) {
    let flr = Math.floor;

    let hours = flr(milliseconds / toMillis.hour);
    milliseconds -= (toMillis.hour * hours);

    let minutes = flr(milliseconds / toMillis.minute);
    milliseconds -= (toMillis.minute * minutes);

    let seconds = flr(milliseconds / toMillis.second);
    milliseconds -= (toMillis.second * seconds);

    function pad(n, length) {
        n = '' + n;
        let len = n.length;
        return len < length ? "0".repeat(length - len) + n : n;
    }
    return [...[hours, minutes, seconds].map(n => pad(n, 2)), pad(milliseconds, 3)].join(":");
}

