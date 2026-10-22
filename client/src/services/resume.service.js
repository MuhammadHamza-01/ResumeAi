import api from "./api";

export const uploadResume = async (formData) => {
  const response = await api.post("/resumes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getMyResumes = async () => {
  const response = await api.get("/resumes");
  return response.data;
};

export const getResumeById = async (resumeId) => {
  const response = await api.get(`/resumes/${resumeId}`);
  return response.data;
};

export const deleteResume = async (resumeId) => {
  const response = await api.delete(`/resumes/${resumeId}`);
  return response.data;
};
