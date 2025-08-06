// Nouvelle page d'absences moderne et complète
'use client';
import React, { useEffect, useState } from 'react';
import Header from '../Header';
import Footer from '../Footer';
import styles from '../absences.module.css';
import { getAbsences, getMembresEquipe, getShifts } from '@/services/api';
import AbsenceFormPage from '../absence-formulaire';
import { FaPlus } from 'react-icons/fa';

interface Absence {
  id_absence?: number;
  matricule: string;
  id_shift: number;
  date_debut_abs: string;
  date_fin_abs: string;
  justification: string | null;
  uploaded_at: string | null;
  est_justifié: boolean;
  justificatif_url?: string | null;
  nom?: string;
  prenom?: string;
  fonction?: string;
}

interface Membre {
  matricule: string;
  nom: string;
  prenom: string;
  fonction: string;
  id_equipe: string;
}

interface Shift {
  id_shift: number;
  date_debut_shift: string;
  date_fin_shift: string;
}

const todayISO = new Date().toISOString().slice(0, 10);
const thisMonth = new Date().toISOString().slice(0, 7);

const AbsencesPage: React.FC = () => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchNom, setSearchNom] = useState('');
  const [searchFonction, setSearchFonction] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [reclamationOpen, setReclamationOpen] = useState(false);
  const [reclamationText, setReclamationText] = useState('');
  const [reclamationFile, setReclamationFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les absences, membres et shifts
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAbsences(),
      getMembresEquipe(''), // tous les membres
      getShifts()
    ]).then(([abs, membresData, shiftsData]) => {
      setAbsences(abs);
      setMembres(membresData);
      setShifts(shiftsData);
    }).finally(() => setLoading(false));
  }, []);

  // Enrichir absences avec nom/prenom/fonction
  const absencesEnrichies = absences.map(abs => {
    const membre = membres.find(m => m.matricule === abs.matricule);
    return {
      ...abs,
      nom: membre?.nom || '',
      prenom: membre?.prenom || '',
      fonction: membre?.fonction || '',
    };
  });

  // Statistiques
  const absToday = absencesEnrichies.filter(a => a.date_debut_abs.slice(0, 10) <= todayISO && a.date_fin_abs.slice(0, 10) >= todayISO);
  const absNonJust = absencesEnrichies.filter(a => !a.est_justifié);
  const absMonth = absencesEnrichies.filter(a => a.date_debut_abs.slice(0, 7) === thisMonth || a.date_fin_abs.slice(0, 7) === thisMonth);
  const effectifTotal = membres.length || 1;
  const tauxAbsMonth = Math.round((absMonth.length / effectifTotal) * 100);

  // Filtres tableau
  const filteredAbsences = absencesEnrichies.filter(a =>
    (!searchNom || a.nom?.toLowerCase().includes(searchNom.toLowerCase())) &&
    (!searchFonction || a.fonction?.toLowerCase().includes(searchFonction.toLowerCase())) &&
    (!searchDate || a.date_debut_abs.slice(0, 10) === searchDate || a.date_fin_abs.slice(0, 10) === searchDate)
  );

  // Absences imprévues : membres qui ont un shift aujourd'hui mais pas d'absence justifiée
  const membresEnService = membres.filter(m => {
    // Un membre est "en service" aujourd'hui s'il a un shift aujourd'hui
    return shifts.some(s => {
      const debut = s.date_debut_shift.slice(0, 10);
      const fin = s.date_fin_shift.slice(0, 10);
      return todayISO >= debut && todayISO <= fin;
    });
  });
  const absMatricules = absencesEnrichies.filter(a => a.date_debut_abs.slice(0, 10) <= todayISO && a.date_fin_abs.slice(0, 10) >= todayISO).map(a => a.matricule);
  const absImprevues = membresEnService.filter(m => !absMatricules.includes(m.matricule));

  // Gestion soumission réclamation
  function handleReclamationSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Envoyer la réclamation au backend
    alert('Réclamation envoyée !');
    setReclamationOpen(false);
    setReclamationText('');
    setReclamationFile(null);
  }

  return (
    <div>
      <Header />
      <div className={styles.container} style={{ paddingTop: 20 }}>
        {/* Statistiques + bouton */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1, background: '#f8faff', borderRadius: '1.2rem', boxShadow: '0 2px 8px rgba(0,32,96,0.08)', padding: '1.5rem', border: '2px solid #e3e9f1', textAlign: 'center' }}>
            <div style={{ color: '#1a4fa0', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Total absents aujourd’hui</div>
            <div style={{ fontSize: '2.1rem', color: '#133a6a', fontWeight: 700 }}>{absToday.length}</div>
          </div>
          <div style={{ flex: 1, background: '#f8faff', borderRadius: '1.2rem', boxShadow: '0 2px 8px rgba(0,32,96,0.08)', padding: '1.5rem', border: '2px solid #e3e9f1', textAlign: 'center' }}>
            <div style={{ color: '#1a4fa0', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Absences imprévues</div>
            <div style={{ fontSize: '2.1rem', color: '#d7263d', fontWeight: 700 }}>{absImprevues.length}</div>
          </div>
          <div style={{ flex: 1, background: '#f8faff', borderRadius: '1.2rem', boxShadow: '0 2px 8px rgba(0,32,96,0.08)', padding: '1.5rem', border: '2px solid #e3e9f1', textAlign: 'center' }}>
            <div style={{ color: '#1a4fa0', fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Taux d’absence du mois</div>
            <div style={{ fontSize: '2.1rem', color: '#005baa', fontWeight: 700 }}>{tauxAbsMonth}%</div>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <button className={styles.addBtn} style={{ float: 'right', marginTop: 0 }} onClick={() => setShowForm(true)}>
              <FaPlus /> Faire une demande d’absence
            </button>
          </div>
        </div>

        {/* Modal formulaire d'absence */}
        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(220,230,245,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,32,96,0.15)', padding: '2.5rem', minWidth: 350, maxWidth: 500, position: 'relative', maxHeight: '90vh', overflowY: 'auto', width: '100%' }}>
              <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
              <AbsenceFormPage />
            </div>
          </div>
        )}

        {/* Filtres tableau */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: 18 }}>
          <input type="text" placeholder="Recherche matricule..." value={searchNom} onChange={e => setSearchNom(e.target.value)} style={{ flex: 1, border: '1.5px solid #e3e9f1', borderRadius: 8, padding: '0.7rem 1rem', fontSize: 16, color: '#1a4fa0', background: '#fff' }} />
          <input type="text" placeholder="Recherche fonction..." value={searchFonction} onChange={e => setSearchFonction(e.target.value)} style={{ flex: 1, border: '1.5px solid #e3e9f1', borderRadius: 8, padding: '0.7rem 1rem', fontSize: 16, color: '#1a4fa0', background: '#fff' }} />
          <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)} style={{ flex: 1, border: '1.5px solid #e3e9f1', borderRadius: 8, padding: '0.7rem 1rem', fontSize: 16, color: '#1a4fa0', background: '#fff' }} />
        </div>

        {/* Tableau des absences déclarées */}
        <div className={styles.tableWrapper}>
          <table className={styles.absTable}>
            <thead>
              <tr>
                <th>Matricule</th>
                <th>ID Shift</th>
                <th>Date début</th>
                <th>Date fin</th>
                <th>Justificatif</th>
                <th>Date upload</th>
                <th>Est justifié</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#b0b8c1' }}>Chargement...</td></tr>
              ) : filteredAbsences.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#b0b8c1' }}>Aucune absence à afficher.</td></tr>
              ) : (
                filteredAbsences.map((abs, idx) => (
                  <tr key={abs.matricule + abs.date_debut_abs + idx}>
                    <td>{abs.matricule}</td>
                    <td>{abs.id_shift}</td>
                    <td>{abs.date_debut_abs ? abs.date_debut_abs.slice(0, 16).replace('T', ' ') : ''}</td>
                    <td>{abs.date_fin_abs ? abs.date_fin_abs.slice(0, 16).replace('T', ' ') : ''}</td>
                    <td>
                      {abs.justification && abs.justification.endsWith('.pdf') ? (
                        <a href={abs.justification} target="_blank" rel="noopener noreferrer" style={{ color: '#005baa', textDecoration: 'underline' }}>Télécharger</a>
                      ) : (
                        <span style={{ color: '#b0b8c1' }}>Aucun</span>
                      )}
                    </td>
                    <td>{abs.uploaded_at ? abs.uploaded_at.slice(0, 16).replace('T', ' ') : ''}</td>
                    <td style={{ color: abs.est_justifié ? '#009e60' : '#d7263d', fontWeight: 600 }}>{abs.est_justifié ? 'Oui' : 'Non'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Section absences imprévues */}
        <div style={{ marginTop: 40, background: '#eaf2fb', border: '2px solid #b3d1f7', borderRadius: 12, padding: '1.5rem 1.2rem', boxShadow: '0 2px 8px rgba(0,32,96,0.06)' }}>
          <div style={{ color: '#005baa', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>
            Signaler une absence non déclarée
          </div>
          <div style={{ color: '#1a4fa0', marginBottom: 12 }}>
            Si un employé est absent sans déclaration préalable, merci de remplir le formulaire ci-dessous.
          </div>
          <form onSubmit={handleReclamationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
            <input type="text" placeholder="Matricule ou nom du conducteur" value={reclamationText} onChange={e => setReclamationText(e.target.value)} style={{ border: '1.5px solid #e3e9f1', borderRadius: 8, padding: 8, fontSize: 15, background: '#fff', color: '#1a1a1a' }} required />
            <input type="date" placeholder="Date du shift concerné" style={{ border: '1.5px solid #e3e9f1', borderRadius: 8, padding: 8, fontSize: 15, background: '#fff', color: '#1a1a1a' }} required />
            <textarea placeholder="Description du problème" rows={3} style={{ border: '1.5px solid #e3e9f1', borderRadius: 8, padding: 8, fontSize: 15, background: '#fff', color: '#1a1a1a' }} required />
            <input type="file" onChange={e => setReclamationFile(e.target.files?.[0] || null)} style={{ marginTop: 4, background: '#fff', color: '#1a1a1a' }} />
            <button type="submit" className={styles.addBtn} style={{ background: '#005baa', fontSize: 15, padding: '0.6rem 1.2rem', alignSelf: 'flex-start' }}>Envoyer</button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AbsencesPage; 