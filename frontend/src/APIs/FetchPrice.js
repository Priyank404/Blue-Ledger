import api from "./axios";


export const getPrice = async (symbols) => {
    try {
        const response = await api.post('/api/stock/price/bulk', symbols);
        return response.data;
    } catch (error) {
        console.log(error);
    }
};