// Zero-dependency, crypto-native JWT implementation for Node.js
// Compatible with standard RFC 7519 HS256 tokens used by jsonwebtoken
const crypto = require('crypto');

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
}

function parseExpiresIn(expiresIn) {
    if (typeof expiresIn === 'number') return expiresIn;
    if (typeof expiresIn !== 'string') return 86400; // default 24h
    const match = expiresIn.match(/^(\d+)([smhd])?$/);
    if (!match) return 86400;
    const val = parseInt(match[1], 10);
    const unit = match[2] || 's';
    if (unit === 's') return val;
    if (unit === 'm') return val * 60;
    if (unit === 'h') return val * 3600;
    if (unit === 'd') return val * 86400;
    return 86400;
}

const jwt = {
    sign(payload, secret, options = {}) {
        const header = { alg: 'HS256', typ: 'JWT' };
        const now = Math.floor(Date.now() / 1000);
        const fullPayload = { ...payload, iat: now };
        if (options.expiresIn) {
            fullPayload.exp = now + parseExpiresIn(options.expiresIn);
        }
        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
        const data = `${encodedHeader}.${encodedPayload}`;
        const signature = crypto
            .createHmac('sha256', secret)
            .update(data)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
        return `${data}.${signature}`;
    },

    verify(token, secret) {
        if (!token || typeof token !== 'string') {
            throw new Error('Token is required');
        }
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token structure');
        }
        const [encodedHeader, encodedPayload, signature] = parts;
        const data = `${encodedHeader}.${encodedPayload}`;
        const expectedSig = crypto
            .createHmac('sha256', secret)
            .update(data)
            .digest('base64')
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');

        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSig);
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
            throw new Error('Invalid token signature');
        }

        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            throw new Error('Token expired');
        }
        return payload;
    }
};

module.exports = jwt;
