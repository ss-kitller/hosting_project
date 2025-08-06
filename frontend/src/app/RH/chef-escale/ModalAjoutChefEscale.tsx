"use client";
import React, { useState } from 'react';
import { FaTimes, FaUserPlus, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import styles from './modalShared.module.css';

interface ModalAjoutChefEscaleProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ModalAjoutChefEscale: React.FC<ModalAjoutChefEscaleProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id_chef_escale: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    id_shift: '',
    nbr_aff_manuelle: '4'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = "http://localhost:8000/api";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation des champs requis
      if (!formData.id_chef_escale || !formData.nom || !formData.prenom) {
        throw new Error('Les champs ID, Nom et Prénom sont obligatoires');
      }

      // Validation du nombre d'affectations manuelles
      const nbrAff = parseInt(formData.nbr_aff_manuelle);
      if (nbrAff > 4) {
        throw new Error('Le nombre d\'affectations manuelles ne peut pas dépasser 4');
      }

      const response = await fetch(`${API_URL}/chef-escale/ajouter/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_chef_escale: formData.id_chef_escale,
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email || null,
          telephone: formData.telephone ? parseInt(formData.telephone) : null,
          id_shift: formData.id_shift ? parseInt(formData.id_shift) : null,
          nbr_aff_manuelle: nbrAff
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du chef d\'escale');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <FaUserPlus className={styles.modalIcon} />
            <h2>Ajouter un Chef d'Escale</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="id_chef_escale">ID Chef d'escale *</label>
              <input
                type="text"
                id="id_chef_escale"
                name="id_chef_escale"
                value={formData.id_chef_escale}
                onChange={handleInputChange}
                required
                placeholder="Ex: CE001"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nom">Nom *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                placeholder="Nom du chef d'escale"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="prenom">Prénom *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                placeholder="Prénom du chef d'escale"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="telephone">Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                placeholder="0612345678"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="id_shift">ID Shift</label>
              <input
                type="number"
                id="id_shift"
                name="id_shift"
                value={formData.id_shift}
                onChange={handleInputChange}
                placeholder="Numéro du shift"
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nbr_aff_manuelle">Affectations manuelles</label>
              <select
                id="nbr_aff_manuelle"
                name="nbr_aff_manuelle"
                value={formData.nbr_aff_manuelle}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="0">0 - Limite atteinte</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4 - Maximum</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <FaSave />
                  Ajouter le chef d'escale
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAjoutChefEscale; 