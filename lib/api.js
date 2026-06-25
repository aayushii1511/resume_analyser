const BASE_URL = "http://localhost:5000/api";

export const analyzeResume = async (resumeText, token) => {
  const res = await fetch(`${BASE_URL}/ai/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ resumeText }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Analysis failed");
  return data.analysis;
};

export const generateRoadmap = async (resumeText, token) => {
  const res = await fetch(`${BASE_URL}/ai/roadmap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ resumeText }),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.error || "Roadmap generation failed";
    if (res.status === 503) {
      throw new Error(errorMsg);
    }
    throw new Error(errorMsg);
  }
  return data.milestones || [];
};

export const generateInterviewQuestions = async (resumeText, targetRole, token) => {
  const res = await fetch(`${BASE_URL}/ai/interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ resumeText, targetRole }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Question generation failed");
  return data.questions || [];
};

export const getUserProfile = async (token) => {
  const res = await fetch(`${BASE_URL}/user/profile`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
  return data;
};

export const getUserRoadmap = async (token) => {
  const res = await fetch(`${BASE_URL}/user/roadmap`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch roadmap");
  return data;
};

export const saveRoadmap = async (milestones, token) => {
  const res = await fetch(`${BASE_URL}/user/roadmap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ milestones }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save roadmap");
  return data;
};

export const updateMilestone = async (index, completed, token) => {
  const res = await fetch(`${BASE_URL}/user/roadmap/${index}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ completed }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update milestone");
  return data;
};