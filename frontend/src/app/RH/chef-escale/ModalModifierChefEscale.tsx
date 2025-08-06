"use client";
import React, { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import styles from './modalShared.module.css';

interface ChefEscale {
  id_chef_escale: string;
  nbr_aff_manuelle: number;
  id_shift: number | null;
  nom: string;
  prenom: string;
  telephone: number | null;
  email: string | null;
  date_debut_shift?: string;
  date_fin_shift?: string;
}

interface ModalModifierChefEscaleProps {
  chef: ChefEscale;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalModifierChefEscale: React.FC<ModalModifierChefEscaleProps> = ({ chef, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nom: chef.nom || '',
    prenom: chef.prenom || '',
    email: chef.email || '',
    telephone: chef.telephone ? chef.telephone.toString() : '',
    id_shift: chef.id_shift ? chef.id_shift.toString() : '',
    nbr_aff_manuelle: chef.nbr_aff_manuelle.toString()
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
      if (!formData.nom || !formData.prenom) {
        throw new Error('Les champs Nom et Prénom sont obligatoires');
      }

      // Validation du nombre d'affectations manuelles
      const nbrAff = parseInt(formData.nbr_aff_manuelle);
      if (nbrAff > 4) {
        throw new Error('Le nombre d\'affectations manuelles ne peut pas dépasser 4');
      }

      // Préparer les données à envoyer (seulement les champs modifiés)
      const updateData: any = {};
      
      if (formData.nom !== chef.nom) updateData.nom = formData.nom;
      if (formData.prenom !== chef.prenom) updateData.prenom = formData.prenom;
      if (formData.email !== (chef.email || '')) updateData.email = formData.email || null;
      if (formData.telephone !== (chef.telephone?.toString() || '')) {
        updateData.telephone = formData.telephone ? parseInt(formData.telephone) : null;
      }
      if (formData.id_shift !== (chef.id_shift?.toString() || '')) {
        updateData.id_shift = formData.id_shift ? parseInt(formData.id_shift) : null;
      }
      if (nbrAff !== chef.nbr_aff_manuelle) updateData.nbr_aff_manuelle = nbrAff;

      // Si aucun champ n'a été modifié
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      const response = await fetch(`${API_URL}/chef-escale/modifier/${chef.id_chef_escale}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification du chef d\'escale');
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
            <FaEdit className={styles.modalIcon} />
            <h2>Modifier le Chef d'Escale</h2>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.chefInfo}>
          <span className={styles.chefId}>ID: {chef.id_chef_escale}</span>
          <span className={styles.chefName}>{chef.nom} {chef.prenom}</span>
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
                  Modification en cours...
                </>
              ) : (
                <>
                  <FaSave />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalModifierChefEscale; 