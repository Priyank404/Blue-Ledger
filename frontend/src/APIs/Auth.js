import api from "./axios";

export const logInUser = async (email, password) => {
  const response = await api.post("/api/auth/login", { email, password });
  return response.data;
};

export const signUpUser = async (email, password, confirmPassword) => {
  const response = await api.post("/api/auth/signup", {
    email,
    password,
    confirmPassword,
  });
  return response.data;
};

export const logOutUser = async () => {
  const response = await api.post("/api/auth/logout");
  return response.data;
};

export const sendOtp = async (email) => {
  const response = await api.post("/api/auth/otp/send", { email });
  return response.data;
};

export const verifyOtpLogin = async (email, otp) => {
  const response = await api.post("/api/auth/otp/verify", { email, otp });
  return response.data;
};

export const googleLogin = async (token) => {
  const response = await api.post("/api/auth/google/login", { token });
  return response.data;
};