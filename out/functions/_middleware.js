const ALLOWED_ORIGINS = [
    "https://delbanna.com",
    "http://localhost:4200",
    "http://localhost:3000", // add any other dev ports
];

export async function onRequest({ request, next }) {
    const origin = request.headers.get("Origin");
    const response = await next();

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        const newResponse = new Response(response.body, response);
        newResponse.headers.set("Access-Control-Allow-Origin", origin);
        newResponse.headers.set("Vary", "Origin"); // important — tells caches the response varies by origin
        return newResponse;
    }

    return response;
}