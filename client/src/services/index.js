import axios from "axios";


export const callRegisterUserApi = async (formData) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/user/register`,
    formData,
    { withCredentials: true }
  );

  return response?.data;
};

export const callLoginUserApi = async (formData) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/user/login`,
    formData,
    { withCredentials: true }
  );

  return response?.data;
};


export const callUserAuthApi=async () => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/user/auth`,{},
    { withCredentials: true }
  );
  //console.log('User Auth API Response:', response?.data);
  return response?.data;
}

export const callLogoutUserApi=async () => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/user/logout`,{},
    { withCredentials: true }
  );
  console.log('User Logout API Response:', response?.data);
  return response?.data;
}
