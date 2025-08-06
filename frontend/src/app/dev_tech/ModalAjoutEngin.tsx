import React, { useState } from "react";
import modalStyles from "./modalRH.module.css";

type Props = {
  onClose: () => void;
  onSubmit: (data: {
    code_engin: string;
    famille_engin: string;
    capacite_max: number;
    etat_engin: "disponible" | "en maintenance" | "affecté";
  }) => void;
  loading: boolean;
};

export default function ModalAjoutEngin({ onClose, onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    code_engin: "",
    famille_engin: "",
    capacite_max: "",
    etat_engin: "disponible",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.code_engin ||
      !form.famille_engin ||
      !form.capacite_max ||
      !form.etat_engin
    ) {
      return;
    }
    onSubmit({
      code_engin: form.code_engin,
      famille_engin: form.famille_engin,
      capacite_max: parseFloat(form.capacite_max),
      etat_engin: form.etat_engin as any,
    });
  };

  return (
    <div className={modalStyles.modalOverlay}>
      <form className={modalStyles.modalContent} onSubmit={handleSubmit}>
        <h2 className={modalStyles.formTitle}>Ajouter un engin</h2>
        <div className={modalStyles.formRow}>
          <label className={modalStyles.formLabel}>Code engin</label>
          <input
            className={modalStyles.formInput}
            name="code_engin"
            value={form.code_engin}
            onChange={handleChange}
            placeholder="Entrez le code de l'engin"
            required
          />
        </div>
        <div className={modalStyles.formRow}>
          <label className={modalStyles.formLabel}>Famille engin</label>
          <input
            className={modalStyles.formInput}
            name="famille_engin"
            value={form.famille_engin}
            onChange={handleChange}
            placeholder="Entrez la famille de l'engin"
            required
          />
        </div>
        <div className={modalStyles.formRow}>
          <label className={modalStyles.formLabel}>Capacité max</label>
          <input
            className={modalStyles.formInput}
            name="capacite_max"
            type="number"
            step="0.01"
            value={form.capacite_max}
            onChange={handleChange}
            placeholder="Entrez la capacité maximale"
            required
          />
        </div>
        <div className={modalStyles.formRow}>
          <label className={modalStyles.formLabel}>État</label>
          <select
            className={modalStyles.formSelect}
            name="etat_engin"
            value={form.etat_engin}
            onChange={handleChange}
            required
          >
            <option value="disponible">Disponible</option>
            <option value="en maintenance">En maintenance</option>
            <option value="affecté">Affecté</option>
          </select>
        </div>
        <div className={modalStyles.formActions}>
          <button type="button" onClick={onClose} className={modalStyles.cancelBtn}>
            Annuler
          </button>
          <button type="submit" className={modalStyles.submitBtn} disabled={loading}>
            {loading ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
} 