import api from "./api";

export const runAnalysis = async (payload) => {
  const response = await api.post("/analyses", payload);
  return response.data;
};

export const getMyAnalyses = async () => {
  const response = await api.get("/analyses");
  return response.data;
};

export const getAnalysisById = async (analysisId) => {
  const response = await api.get(`/analyses/${analysisId}`);
  return response.data;
};

export const deleteAnalysis = async (analysisId) => {
  const response = await api.delete(`/analyses/${analysisId}`);
  return response.data;
};
