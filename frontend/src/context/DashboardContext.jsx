import {  createContext, useContext, useEffect, useState } from "react";
import {getDashboardData} from '../APIs/dashboard'

const DashboardContext = createContext();

export const DashboardProvider = ({children}) =>{
    const [dashboardData, setDashboardData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const fetchDashboardData = async () =>{
            try {
                const response = await getDashboardData();

                setDashboardData(response)
            } catch (error) {
                console.log("Error fetching dashboard data", error);
                setDashboardData([]);
            }finally{
                setLoading(false);
            }
        }

        fetchDashboardData();
    },[]);


    return (
        <DashboardContext.Provider value={{dashboardData, loading}}>
            {children}
        </DashboardContext.Provider>
    )
}


export const useDashboard = () => useContext(DashboardContext);
