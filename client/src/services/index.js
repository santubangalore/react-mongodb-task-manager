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


export const addNewTaskApi = async(formData)=>{
  const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/task/add-new-task`,formData,
      { withCredentials: true }
  );

  return response?.data;
}

export const getAllTaskApi = async(userId)=>{
  const response=await axios.get(
      `${import.meta.env.VITE_SERVER_URL}/api/task/get-all-task-by-userId/${userId}`

  )
  return response.data;
  
}

export const updateTaskApi = async(formData)=>{
  
}

export const daleteTaskApi = async(taskId)=>{
  
}