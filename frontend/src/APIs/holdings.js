import api from "./axios";

export const getHoldings = async ()=>{
    const response = await api.get('/api/holdings/get');
    return response.data.data
}