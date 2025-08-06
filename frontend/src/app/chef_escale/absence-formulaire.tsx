import React, { useState, useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import styles from "./absence-formulaire.module.css";
import { useRouter } from "next/navigation";
import { getEquipes, getMembresEquipe, createAbsence } from "@/services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const justifications = ["Maladie", "Congé annuel", "Accident", "Congé maternité", "Autre"];

interface EquipeOption {
  id_equipe: string;
  nom_equipe?: string;
}
interface MembreOption {
  matricule: string;
  fonction: string;
  nom: string;
  prenom: string;
  id_equipe: string;
}

const AbsenceFormPage: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    id_equipe: "",
    matricule: "",
    fonction: "",
    nom: "",
    prenom: "",
    id_shift: "",
    date_debut_abs: "",
    date_fin_abs: "",
    justification: justifications[0],
    est_justifie: true,
  });
  const [equipes, setEquipes] = useState<EquipeOption[]>([]);
  const [membres, setMembres] = useState<MembreOption[]>([]);
  const [loadingEquipes, setLoadingEquipes] = useState(false);
  const [loadingMembres, setLoadingMembres] = useState(false);
  const [equipeError, setEquipeError] = useState<string | null>(null);
  const [membreError, setMembreError] = useState<string | null>(null);
  const [dateDebut, setDateDebut] = useState<Date | null>(null);
  const [dateFin, setDateFin] = useState<Date | null>(null);

  // Charger la liste des équipes
  useEffect(() => {
    setLoadingEquipes(true);
    getEquipes()
      .then((data: EquipeOption[]) => {
        setEquipes(data);
        setEquipeError(null);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des équipes:', error);
        setEquipeError("Impossible de charger les équipes");
      })
      .finally(() => setLoadingEquipes(false));
  }, []);

  // Charger les membres de l'équipe sélectionnée
  useEffect(() => {
    if (!form.id_equipe) {
      setMembres([]);
      setForm(f => ({ ...f, matricule: "", fonction: "", nom: "", prenom: "" }));
      return;
    }
    setLoadingMembres(true);
    getMembresEquipe(form.id_equipe)
      .then((data: MembreOption[]) => {
        // Filtrer les membres de l'équipe sélectionnée (comparaison en string)
        const membresEquipe = data.filter(membre => 
          membre.id_equipe === form.id_equipe
        );
        setMembres(membresEquipe);
        setMembreError(null);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des membres:', error);
        setMembreError("Impossible de charger les membres");
      })
      .finally(() => setLoadingMembres(false));
  }, [form.id_equipe]);

  // Synchroniser avec le state form
  useEffect(() => {
    setForm(f => ({ ...f, date_debut_abs: dateDebut ? dateDebut.toISOString().slice(0, 16) : "" }));
  }, [dateDebut]);
  useEffect(() => {
    setForm(f => ({ ...f, date_fin_abs: dateFin ? dateFin.toISOString().slice(0, 16) : "" }));
  }, [dateFin]);

  // Quand un matricule est sélectionné, auto-remplir les infos
  function handleMatriculeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const found = membres.find(m => m.matricule === value);
    setForm(f => ({
      ...f,
      matricule: value,
      fonction: found ? found.fonction : "",
      nom: found ? found.nom : "",
      prenom: found ? found.prenom : "",
    }));
  }

  function handleEquipeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    setForm(f => ({
      ...f,
      id_equipe: value,
      matricule: "",
      fonction: "",
      nom: "",
      prenom: "",
    }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm(f => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createAbsence({
      matricule: form.matricule,
      type_employe: form.fonction,
      id_shift: form.id_shift,
      date_debut_abs: form.date_debut_abs,
      date_fin_abs: form.date_fin_abs,
      justification: form.justification,
      est_justifie: form.est_justifie,
    })
      .then(() => {
        alert("Absence enregistrée !");
        router.push("/chef_escale/absences");
      })
      .catch(() => alert("Erreur lors de l'enregistrement de l'absence."));
  }

  return (
    <div>
      <Header />
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <h1 className={styles.formTitle}>Ajouter une absence</h1>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Équipe</label>
          <select
            className={styles.formSelect}
            name="id_equipe"
            value={form.id_equipe}
            onChange={handleEquipeChange}
            required
            disabled={loadingEquipes || !!equipeError}
          >
            <option value="">{loadingEquipes ? "Chargement..." : equipeError ? equipeError : "Sélectionner..."}</option>
            {equipes.length === 0 && !loadingEquipes && !equipeError && (
              <option value="" disabled>Aucune équipe disponible</option>
            )}
            {equipes.map((eq) => (
              <option key={eq.id_equipe} value={eq.id_equipe}>
                {eq.nom_equipe || `Équipe ${eq.id_equipe}`}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Matricule</label>
          <select
            className={styles.formSelect}
            name="matricule"
            value={form.matricule}
            onChange={handleMatriculeChange}
            required
            disabled={!form.id_equipe || loadingMembres || !!membreError}
          >
            <option value="">{loadingMembres ? "Chargement..." : membreError ? membreError : "Sélectionner..."}</option>
            {membres.length === 0 && !loadingMembres && !membreError && (
              <option value="" disabled>Aucun membre disponible</option>
            )}
            {membres.map(m => (
              <option key={m.matricule} value={m.matricule}>
                {m.matricule} - {m.nom} {m.prenom}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Fonction</label>
          <input
            className={styles.formInput}
            name="fonction"
            value={form.fonction}
            readOnly
            placeholder="Fonction"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Nom</label>
          <input
            className={styles.formInput}
            name="nom"
            value={form.nom}
            readOnly
            placeholder="Nom"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Prénom</label>
          <input
            className={styles.formInput}
            name="prenom"
            value={form.prenom}
            readOnly
            placeholder="Prénom"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>ID du shift concerné</label>
          <input
            className={styles.formInput}
            type="text"
            name="id_shift"
            value={form.id_shift}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Date de début d'absence</label>
          <DatePicker
            selected={dateDebut}
            onChange={date => setDateDebut(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="Sélectionner la date et l'heure"
            className={styles.formInput}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Date de fin d'absence</label>
          <DatePicker
            selected={dateFin}
            onChange={date => setDateFin(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="yyyy-MM-dd HH:mm"
            placeholderText="Sélectionner la date et l'heure"
            className={styles.formInput}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Justification</label>
          <textarea
            className={styles.formInput}
            name="justification"
            value={form.justification}
            onChange={handleChange}
            required
            rows={2}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Est-ce justifié ?</label>
          <div className={styles.formSwitch}>
            <input
              type="checkbox"
              name="est_justifie"
              checked={form.est_justifie}
              onChange={handleChange}
              id="est_justifie-switch"
            />
            <label htmlFor="est_justifie-switch">{form.est_justifie ? "Oui" : "Non"}</label>
          </div>
        </div>
        <button className={styles.submitBtn} type="submit">Enregistrer</button>
      </form>
      <Footer />
    </div>
  );
};

export default AbsenceFormPage; 