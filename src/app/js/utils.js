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