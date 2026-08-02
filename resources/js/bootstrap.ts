import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

declare global {
    interface Window {
        axios: typeof axios;
        Pusher: typeof Pusher;
        Echo: InstanceType<typeof Echo>;
    }
}

const broadcaster = import.meta.env.VITE_REVERB_APP_KEY ? 'reverb' : null;

if (broadcaster) {
    window.Pusher = Pusher;
    window.Echo = new Echo({
        broadcaster,
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT,
        wssPort: import.meta.env.VITE_REVERB_PORT,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
}

export default axios;
