const ALLOWED_ORIGINS = [
    "https://delbanna.com",
    "http://localhost:4200",
    "http://localhost:3000",
];

export default {
    async fetch(request, env) {
        const origin = request.headers.get("Origin");
        const response = await env.ASSETS.fetch(request); // replaces next()

        if (origin && ALLOWED_ORIGINS.includes(origin)) {
            const newResponse = new Response(response.body, response);
            newResponse.headers.set("Access-Control-Allow-Origin", origin);
            newResponse.headers.set("Vary", "Origin");
            return newResponse;
        }

        return response;
    }
};