import 'dotenv/config';
import fs from 'fs';

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('error-dump.txt', msg + '\n');
};

log("Debug script starting...");
log("Encryption Key check: " + (process.env.ENCRYPTION_KEY ? "Present" : "Missing"));

(async () => {
    try {
        log("Importing app...");
        await import('./src/app.js');
        log("App imported successfully.");
        await import('./src/server.js');
    } catch (error) {
        log("CRITICAL ERROR CATCH:");
        log(error.message);
        log(error.stack);
        if (error.code) log("Code: " + error.code);
    }
})();
