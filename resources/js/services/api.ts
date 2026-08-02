import axios, { type AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
});

export default api;
