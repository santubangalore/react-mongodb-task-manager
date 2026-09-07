import axios from "axios";


export const callRegisterUserApi = async (formData) => {
  const response = await axios.post(
    "http://localhost:5000/api/user/register",
    formData,
    { withCredentials: true }
  );

  return response?.data;
};

export const callLoginUserApi = async (formData) => {
  const response = await axios.post(
    "http://localhost:5000/api/user/login",
    formData,
    { withCredentials: true }
  );

  return response?.data;
};


export const callUserAuthApi=async () => {
  const response = await axios.post(
    "http://localhost:5000/api/user/auth",{},
    { withCredentials: true }
  );
  console.log('User Auth API Response:', response?.data);
  return response?.data;
}
