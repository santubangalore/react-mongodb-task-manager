import axios from "axios";

// User APIs
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

export const callUserAuthApi = async () => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/user/auth`,
    {},
    { withCredentials: true }
  );
  return response?.data;
};

export const callLogoutUserApi = async () => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/user/logout`,
    {},
    { withCredentials: true }
  );
  return response?.data;
};

// Project APIs
export const addNewProjectApi = async (formData) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/project/add-new-project`,
    formData,
    { withCredentials: true }
  );
  return response?.data;
};

export const getAllProjectsApi = async (userId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/project/get-all-projects-by-userId/${userId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const getProjectDetailsApi = async (projectId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/project/get-project-details/${projectId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const updateProjectApi = async (formData) => {
  const response = await axios.put(
    `${import.meta.env.VITE_SERVER_URL}/api/project/update-project`,
    formData,
    { withCredentials: true }
  );
  return response?.data;
};

export const deleteProjectApi = async (projectId) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_SERVER_URL}/api/project/delete-project/${projectId}`,
    { withCredentials: true }
  );
  return response?.data;
};

// Task APIs
export const addNewTaskApi = async (formData) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/task/add-new-task`,
    formData,
    { withCredentials: true }
  );
  return response?.data;
};

export const getAllTaskApi = async (userId, projectId = null) => {
  const url = projectId
    ? `${import.meta.env.VITE_SERVER_URL}/api/task/get-all-task-by-userId/${userId}?projectId=${projectId}`
    : `${import.meta.env.VITE_SERVER_URL}/api/task/get-all-task-by-userId/${userId}`;
  const response = await axios.get(url, { withCredentials: true });
  return response?.data;
};

export const getTasksByProjectIdApi = async (projectId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/task/get-all-task-by-projectId/${projectId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const updateTaskApi = async (formData) => {
  const response = await axios.put(
    `${import.meta.env.VITE_SERVER_URL}/api/task/update-task`,
    formData,
    { withCredentials: true }
  );
  return response?.data;
};

export const daleteTaskApi = async (taskId) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_SERVER_URL}/api/task/delete-task/${taskId}`,
    { withCredentials: true }
  );
  return response?.data;
};