import api from "./axios";

export const addTransaction = async (type, name, quantity, price, date) =>{
    const response = await api.post("/api/transaction/add", {type,name,quantity,price,date});
    return response.data
}

export const deleteTransaction = async (transactionId) => {
    const response = await api.delete(`/api/transaction/remove/${transactionId}`);
    return response.data
}

export const getTransactions = async ()=>{
    const response = await api.get("/api/transaction/get")
    return response.data.data
}