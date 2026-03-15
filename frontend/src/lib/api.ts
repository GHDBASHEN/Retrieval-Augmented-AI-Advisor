const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
    login: (email: string, password: string) => {
        return fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
    },
    register: (email: string, password: string) => {
        return fetch(`${BASE_URL}/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
    },
    getBots: (apiKey: string) => {
        return fetch(`${BASE_URL}/bots/`, {
            headers: { 'X-API-Key': apiKey }
        });
    },
    createBot: (name: string, description: string, apiKey: string) => {
        return fetch(`${BASE_URL}/bots/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({ name, description })
        });
    },
    ingestFile: (botId: number, file: File, apiKey: string) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${BASE_URL}/bots/${botId}/ingest-file`, {
            method: 'POST',
            headers: { 'X-API-Key': apiKey },
            body: formData
        });
    },
    ingestUrl: (botId: number, url: string, apiKey: string) => {
        return fetch(`${BASE_URL}/bots/${botId}/ingest-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({ url })
        });
    },
    getHistory: (botId: number, apiKey: string) => {
        return fetch(`${BASE_URL}/conversations/${botId}/history`, {
            headers: { 'X-API-Key': apiKey }
        });
    },
    chat: (botId: string, user_query: string, apiKey: string) => {
        return fetch(`${BASE_URL}/conversations/${botId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey
            },
            body: JSON.stringify({ user_query })
        });
    }
};
