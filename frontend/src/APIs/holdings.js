import api from "./axios";

export const getHoldings = async ()=>{
    const response = await api.get('/api/holdings/get');
    return response.data.data
}

export const getPortfolioData = async () => {
    const response = await api.get('/api/portfolio/analytic');
    return response.data.data
}