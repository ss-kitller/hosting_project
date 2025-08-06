const API_URL = "http://localhost:8000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  
  return res.json();
}

export async function login(idUtilisateur: string, motDePasse: string) {
  return apiFetch("/users/login/", {
    method: "POST",
    body: JSON.stringify({ id_utilisateur: idUtilisateur, mot_de_passe: motDePasse }),
  });
}

export async function getEquipes() {
  return apiFetch("/equipe/");
}

export async function getMembresEquipe(idEquipe: string) {
  return apiFetch(`/equipe/${idEquipe}/membres/`);
}

export async function createAbsence(absenceData: {
  matricule: string;
  type_employe: string;
  id_shift: string;
  date_debut_abs: string;
  date_fin_abs: string;
  justification: string;
  est_justifie: boolean;
}) {
  return apiFetch("/absences/", {
    method: "POST",
    body: JSON.stringify({
      matricule: absenceData.matricule,
      date_debut_abs: absenceData.date_debut_abs,
      date_fin_abs: absenceData.date_fin_abs,
      justification: absenceData.justification,
      etat: "en attente"  // État par défaut pour une nouvelle absence
    }),
  });
} 