import api from "./axios";

export const updateProfile = async (payload) => {
  const res = await api.patch("/users/profile",payload);
  return res.data;
};
