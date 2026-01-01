import api from  './axios'

export const exportData = async (type, format) => {
    const response = await api.get('/api/export', {
        params: { type, format },
        responseType: 'blob'
    });
    return response.data
}