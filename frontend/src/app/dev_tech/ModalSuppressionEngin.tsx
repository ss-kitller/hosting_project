import React, { useState } from "react";
import { FaExclamationTriangle } from 'react-icons/fa';
import modalStyles from "./modalRH.module.css";
import { Engin } from "./EnginCard";

interface Props {
  engins: Engin[];
  onClose: () => void;
  onDelete: (code_engin: string) => void;
  loading: boolean;
}

export default function ModalSuppressionEngin({ engins, onClose, onDelete, loading }: Props) {
  const [selected, setSelected] = useState(engins[0]?.code_engin || "");
  const [confirm, setConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(selected);
  };

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <h2 className={modalStyles.formTitle}>Supprimer un engin</h2>
        {!confirm ? (
          <>
            <div className={modalStyles.formRow}>
              <label className={modalStyles.formLabel}>Sélectionner l'engin à supprimer</label>
              <select
                className={modalStyles.formSelect}
                value={selected}
                onChange={e => setSelected(e.target.value)}
              >
                {engins.map(e => (
                  <option key={e.code_engin} value={e.code_engin}>
                    {e.code_engin} — {e.famille_engin}
                  </option>
                ))}
              </select>
            </div>
            <div className={modalStyles.formActions}>
              <button type="button" onClick={onClose} className={modalStyles.cancelBtn}>
                Annuler
              </button>
              <button type="button" className={modalStyles.submitBtn} onClick={() => setConfirm(true)} disabled={!selected}>
                Supprimer
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ 
              margin: '1.5rem 0', 
              color: '#d32f2f', 
              textAlign: 'center', 
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaExclamationTriangle style={{ fontSize: '2rem', color: '#d32f2f' }} />
              <div>
                Confirmer la suppression de <b>{selected}</b> ?<br/>
                Cette action est irréversible.
              </div>
            </div>
            <div className={modalStyles.formActions}>
              <button type="button" onClick={onClose} className={modalStyles.cancelBtn}>
                Annuler
              </button>
              <button type="button" onClick={handleDelete} className={modalStyles.submitBtn} disabled={loading}>
                {loading ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 