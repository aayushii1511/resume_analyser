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