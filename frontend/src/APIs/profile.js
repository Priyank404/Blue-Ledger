import api from "./axios";

export const updateProfile = async (payload) => {
  const res = await api.patch("/api/users/profile",payload);
  return res.data;
};
