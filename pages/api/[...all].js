const app = require('../../server/app');

export default function handler(req, res) {
    // Ensure we handle the request with the Express app
    // Express's app function is (req, res) => { ... }
    return new Promise((resolve, reject) => {
        app(req, res, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Disable Next.js default body parser to let Express handle it if needed
// However, since we use express.json() in server/app.js, we might need to be careful.
// Usually, for standard Next.js API routes, the body is already parsed.
export const config = {
    api: {
        externalResolver: true,
        bodyParser: false, // Let Express handle the body
    },
};
