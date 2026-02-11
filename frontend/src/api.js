import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8777', // Assuming Gateway runs on 8777
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

export const login = async (credentials) => {
    const response = await api.post('/login/account', credentials);
    return response.data;
};

export const createAccount = async (userData, otp) => {
    const response = await api.post(`/create/account?otp=${otp}`, userData);
    return response.data;
};

export const generateOtp = async (email) => {
    const response = await api.post(`/generate-otp?email=${email}`);
    return response.data;
};

export const resetPassword = async (email, newPassword, otp) => {
    const response = await api.put(`/reset/password?email=${email}&newPassword=${newPassword}&otp=${otp}`);
    return response.data;
};

export default api;
