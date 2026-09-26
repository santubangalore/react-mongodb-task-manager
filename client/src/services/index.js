import axios from "axios";

// ─── User APIs ────────────────────────────────────────────────────────────────
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

// ─── Project APIs ─────────────────────────────────────────────────────────────
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

// ─── Task APIs ────────────────────────────────────────────────────────────────
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

export const getTasksByStoryIdApi = async (storyId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/task/get-all-task-by-storyId/${storyId}`,
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

// ─── Story APIs ───────────────────────────────────────────────────────────────
export const addNewStoryApi = async (formData) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/story/add-new-story`,
    formData,
    { withCredentials: true }
  );
  return response?.data;
};

export const getStoriesByProjectApi = async (projectId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/story/get-stories-by-project/${projectId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const getStoryByIdApi = async (storyId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/story/get-story/${storyId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const updateStoryApi = async (formData) => {
  const response = await axios.put(
    `${import.meta.env.VITE_SERVER_URL}/api/story/update-story`,
    formData,
    { withCredentials: true }
  );
  return response?.data;
};

export const deleteStoryApi = async (storyId) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_SERVER_URL}/api/story/delete-story/${storyId}`,
    { withCredentials: true }
  );
  return response?.data;
};

// ─── Sprint APIs ──────────────────────────────────────────────────────────────
export const addNewSprintApi = async (formData) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/add-new-sprint`,
    formData,
    { withCredentials: true }
  );
  return response?.data;
};

export const getSprintsByProjectApi = async (projectId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/get-sprints-by-project/${projectId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const getSprintByIdApi = async (sprintId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/get-sprint/${sprintId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const updateSprintApi = async (formData) => {
  const response = await axios.put(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/update-sprint`,
    formData,
    { withCredentials: true }
  );
  return response?.data;
};

export const startSprintApi = async (sprintId) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/start-sprint/${sprintId}`,
    {},
    { withCredentials: true }
  );
  return response?.data;
};

export const closeSprintApi = async (sprintId) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/close-sprint/${sprintId}`,
    {},
    { withCredentials: true }
  );
  return response?.data;
};

export const addTaskToSprintApi = async (sprintId, taskId) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/add-task-to-sprint`,
    { sprintId, taskId },
    { withCredentials: true }
  );
  return response?.data;
};

export const removeTaskFromSprintApi = async (taskId) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/remove-task-from-sprint/${taskId}`,
    {},
    { withCredentials: true }
  );
  return response?.data;
};

export const getActiveSprintApi = async (projectId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/get-active-sprint/${projectId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const deleteSprintApi = async (sprintId) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/delete-sprint/${sprintId}`,
    { withCredentials: true }
  );
  return response?.data;
};

// ─── Project Team Member APIs ─────────────────────────────────────────────────
export const getProjectMembersApi = async (projectId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/project/get-members/${projectId}`,
    { withCredentials: true }
  );
  return response?.data;
};

export const addProjectMemberApi = async (projectId, email) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/project/add-member`,
    { projectId, email },
    { withCredentials: true }
  );
  return response?.data;
};

export const removeProjectMemberApi = async (projectId, memberId) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_SERVER_URL}/api/project/remove-member/${projectId}/${memberId}`,
    { withCredentials: true }
  );
  return response?.data;
};

// ─── Assigned Tasks APIs ──────────────────────────────────────────────────────
export const getTasksAssignedToUserApi = async (userId, projectId = null) => {
  const url = projectId
    ? `${import.meta.env.VITE_SERVER_URL}/api/task/get-tasks-assigned-to/${userId}?projectId=${projectId}`
    : `${import.meta.env.VITE_SERVER_URL}/api/task/get-tasks-assigned-to/${userId}`;
  const response = await axios.get(url, { withCredentials: true });
  return response?.data;
};

export const updateTaskStatusApi = async (taskId, status) => {
  const response = await axios.patch(
    `${import.meta.env.VITE_SERVER_URL}/api/task/update-task-status`,
    { _id: taskId, status },
    { withCredentials: true }
  );
  return response?.data;
};

export const batchAssignTasksToSprintApi = async (sprintId, assignments, projectId) => {
  const response = await axios.post(
    `${import.meta.env.VITE_SERVER_URL}/api/task/batch-assign-to-sprint`,
    { sprintId, assignments, projectId },
    { withCredentials: true }
  );
  return response?.data;
};

// ─── Sprint History API ────────────────────────────────────────────────────────
export const getSprintHistoryApi = async (projectId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_URL}/api/sprint/get-sprint-history/${projectId}`,
    { withCredentials: true }
  );
  return response?.data;
};
