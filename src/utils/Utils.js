import { axios } from '@/plugins/request';

export function randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export function checkLocation() {
    return axios({
        url: 'http://ip-api.com/json',
        method: 'GET',
    });
}

export function isURL(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

export function isPortTaken(port) {
    const net = require('net');
    return new Promise((resolve, reject) => {
        const tester = net.createServer()
            .once('error', err => {
                if (err.code === 'EADDRINUSE') {
                    resolve(true);
                } else {
                    reject(err);
                }
            })
            .once('listening', () => {
                tester
                    .once('close', () => {
                        resolve(false);
                    })
                    .close();
            })
            .listen(port);
    });
}

export async function checkPortRange(startPort, endPort) {
    const results = [];
    for (let port = startPort; port <= endPort; port++) {
        const taken = await isPortTaken(port);
        results.push({ port, taken });
    }
    return results;
}
