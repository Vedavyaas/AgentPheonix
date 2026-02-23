import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8777', // Assuming Gateway runs on 8777
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});


// Add request interceptor to attach JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


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

// ProjectService API calls
export const setGitCredentials = async (credentials) => {
    const response = await api.post('/PROJECTSERVICE/set/credentials', credentials);
    return response.data;
};

export const updateGitUsername = async (gitUsername) => {
    const response = await api.put(`/PROJECTSERVICE/update/credentials/username?gitUsername=${gitUsername}`);
    return response.data;
};

export const updateGitPAT = async (pat) => {
    const response = await api.put(`/PROJECTSERVICE/update/credentials/pat?pat=${pat}`);
    return response.data;
};

export const addGitRepository = async (gitDetails) => {
    const response = await api.post('/PROJECTSERVICE/git/details/repo', gitDetails);
    return response.data;
};

export const getAllProjects = async () => {
    const response = await api.get('/PROJECTSERVICE/get/all');
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await api.delete(`/PROJECTSERVICE/git/delete?id=${id}`);
    return response.data;
};

export const startBuild = async (id) => {
    const response = await api.post(`/PROJECTSERVICE/start/build?id=${id}`);
    return response.data;
};

// DeploymentService API calls
export const createCloudCredentials = async (storedUrl, credentials) => {
    const response = await api.post(`/DEPLOYMENTSERVICE/create/credentials/cloud?storedUrl=${encodeURIComponent(storedUrl)}`, credentials);
    return response.data;
};

export const updateCloudPAT = async (pat, storedUrl) => {
    const response = await api.put(`/DEPLOYMENTSERVICE/update/credentials/pat?pat=${encodeURIComponent(pat)}&storedUrl=${encodeURIComponent(storedUrl)}`);
    return response.data;
};

export const updateCloudRegion = async (region, storedUrl) => {
    const response = await api.put(`/DEPLOYMENTSERVICE/update/credentials/region?region=${encodeURIComponent(region)}&storedUrl=${encodeURIComponent(storedUrl)}`);
    return response.data;
};

export const updateCloudInfra = async (cloudInfrastructure, storedUrl) => {
    const response = await api.put(`/DEPLOYMENTSERVICE/update/credential/infra?cloudInfrastructure=${encodeURIComponent(cloudInfrastructure)}&storedUrl=${encodeURIComponent(storedUrl)}`);
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/logout');
    return response.data;
};

export default api;
