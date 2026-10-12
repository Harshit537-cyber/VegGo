import apiClient from '../../../api/axiosInstance'

export const getPlatformSettings = async () => {
    const response = await apiClient.get('/api/admin/settings')
    return response.data
}

export const updatePlatformSettings = async (payload) => {
    const response = await apiClient.put('/api/admin/settings', payload)
    return response.data
}