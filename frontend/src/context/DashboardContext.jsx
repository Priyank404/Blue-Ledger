import {  createContext, useContext, useEffect, useState } from "react";
import {getDashboardData} from '../APIs/dashboard'
import { useAuth } from '../context/AuthContext'

const DashboardContext = createContext();

export const DashboardProvider = ({children}) =>{
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const {user, loading: authLoading } = useAuth()

    useEffect(()=>{

        if(authLoading) return;
    
        if(!user){
            setLoading(false);
            return
        };

        setLoading(true);

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
    },[user,authLoading]);


    return (
        <DashboardContext.Provider value={{dashboardData, loading}}>
            {children}
        </DashboardContext.Provider>
    )
}


export const useDashboard = () => useContext(DashboardContext);
