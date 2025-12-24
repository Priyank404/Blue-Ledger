import api from "./axios";

export const logInUser = async (email, password) =>{
   const response = await api.post("/api/auth/login",{email,password});
    return response.data
};

export const signUpUser = async (email, password, confirmPassword) =>{
    const response = await api.post("/api/auth/signup",{email,password,confirmPassword});
    return response.data
}

export const logOutUser = async ()=>{
  const response = await api.post("/api/auth/logout");
  return response.data
}