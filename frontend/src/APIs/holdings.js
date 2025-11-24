import api from "./axios";

export const getHoldings = async ()=>{
    const response = await api.get('/holdings/get');
    return response.data.data
}