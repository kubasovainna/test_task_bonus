import {createServer, STATUS_CODES} from 'node:http';
import {readFileSync} from 'node:fs';
import {setTimeout} from 'node:timers/promises';

let variantsRaw;
/**
 * По умолчанию файл с вариантами должен лежать рядом с server.mjs
 */
try {
    variantsRaw = readFileSync('./variants.json', 'utf-8');
} catch (error) {
    if (error?.code === 'ENOENT') {
        console.error('Файл variants.json по умолчанию должен находиться рядом с server.mjs');
    }

    throw error;
}

// По умолчанию варианты представлены JSON формате
try {
    JSON.parse(variantsRaw);
} catch (error) {
    console.error('Используется невалидный формат данных (по умолчанию json) или json сломан');

    throw error;
}

const server = createServer();

server.on('request', async (req, res, body) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    console.info(`[inconming message]: ${req.method} ${url.pathname}`);

    res.setHeader('access-control-allow-credentials', 'true');
    res.setHeader('access-control-allow-origin', '*');

    if (/^\/get-variants\/?$/.test(url.pathname)) {
        if (req.method !== 'GET') {
            return notAllowed(res);
        }

        res.setHeader('Content-Type', 'application/json');
        await setTimeout(1000);
        res.write(variantsRaw);
        res.end();
        return;
    }

    if (/^\/save-variant\/?$/.test(url.pathname)) {
        if (req.method !== 'POST') {
            return notAllowed(res);
        }

        res.setHeader('Content-Type', 'text/plain');

        res.write(STATUS_CODES[200]);

        res.end();

        return;
    }

    res.statusCode = 404;

    res.write(STATUS_CODES[404]);

    res.end();
});

function notAllowed(res) {
    res.statusCode = 405;

    res.write(STATUS_CODES[405]);

    res.end();
}

server.listen(8080, () => {
    console.info(`Server start on http://localhost:8080/`);
});
