import api from "./axios";

export const getSingleStokData = async(id)=>{
    const response = await api.get(`/api/stock/details/${id}`);
    return response.data.data;
}