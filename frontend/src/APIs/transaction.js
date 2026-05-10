import api from "./axios";

export const addTransaction = async (type, name, quantity, price, date) =>{
    const response = await api.post("/api/transaction/add", {type,name,quantity,price,date});
    return response.data
}

export const importTransactionsFromCsv = async (transactions) => {
    const response = await api.post("/api/transaction/import-csv", { transactions });
    return response.data.data
}

export const deleteTransaction = async (transactionId) => {
    const response = await api.delete(`/api/transaction/remove/${transactionId}`);
    return response.data
}

export const getTransactions = async ({ page = 1, limit = 8 } = {})=>{
    const response = await api.get("/api/transaction/get", {
        params: { page, limit }
    })
    return response.data.data
}
