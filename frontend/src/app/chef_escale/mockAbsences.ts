import { Absence } from "./AbsencesTable";

const now = new Date();
const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

export const mockAbsences: Absence[] = [
  {
    matricule: "C1234",
    nom: "El Amrani",
    prenom: "Yassine",
    type: "Conducteur",
    date_debut_abs: now.toISOString().slice(0, 10),
    date_fin_abs: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    justification: "Maladie",
    justifiee: true,
  },
  {
    matricule: "D5678",
    nom: "Benali",
    prenom: "Sara",
    type: "Docker",
    date_debut_abs: now.toISOString().slice(0, 10),
    date_fin_abs: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    justification: "Congé annuel",
    justifiee: true,
  },
  {
    matricule: "C4321",
    nom: "Moujahid",
    prenom: "Omar",
    type: "Conducteur",
    date_debut_abs: nextMonth.toISOString().slice(0, 10),
    date_fin_abs: new Date(nextMonth.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    justification: "Accident",
    justifiee: false,
  },
  {
    matricule: "D8765",
    nom: "Zahraoui",
    prenom: "Imane",
    type: "Docker",
    date_debut_abs: nextMonth.toISOString().slice(0, 10),
    date_fin_abs: new Date(nextMonth.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    justification: "Congé maternité",
    justifiee: true,
  },
]; 