"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import styles from "./equipes.module.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface Membre {
  id: number;
  matricule: string;
  fonction: string;
  id_equipe: number;
  nom: string;
  prenom: string;
  email: string;
  phone_number: string;
  date_embauche: string;
  disponibilite: string;
}

interface Equipe {
  id_equipe: number;
  id_chef_escale: number;
}

const disponibiliteOptions = [
  { value: "en service", label: "En service" },
  { value: "en repos", label: "En repos" },
  { value: "disponible", label: "Disponible" },
  { value: "non disponible", label: "Non disponible" },
];

const EquipesPage: React.FC = () => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    matricule: "",
    fonction: "conducteur",
    id_equipe: "",
    nom: "",
    prenom: "",
    email: "",
    phone_number: "",
    date_embauche: "",
    disponibilite: "disponible",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://localhost:8000";

  // Helper pour fetch avec token
  const fetchWithAuth = (url: string, options: any = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  // Charger membres et équipes
  const fetchAll = () => {
    setLoading(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    Promise.all([
      fetch(`${API_BASE}/api/info_equipe/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(async res => {
        if (!res.ok) throw new Error("Erreur API membres");
        return res.json();
      }),
      fetch(`${API_BASE}/api/equipes/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(async res => {
        if (!res.ok) throw new Error("Erreur API équipes");
        return res.json();
      }),
    ])
      .then(([membresData, equipesData]) => {
        setMembres(membresData);
        setEquipes(equipesData);
        setError(null);
      })
      .catch((err) => setError("Impossible de charger les membres ou équipes. Vérifiez votre connexion ou vos droits."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Ajout membre
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWithAuth(`${API_BASE}/api/info_equipe/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        id_equipe: form.id_equipe, // Correction ici : string, pas Number()
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setShowForm(false);
        setForm({
          matricule: "",
          fonction: "conducteur",
          id_equipe: "",
          nom: "",
          prenom: "",
          email: "",
          phone_number: "",
          date_embauche: "",
          disponibilite: "disponible",
        });
        fetchAll();
      })
      .catch(() => setError("Erreur lors de l'ajout du membre."));
  };

  // Suppression membre
  const handleDelete = (matricule: string) => {
    if (!window.confirm("Supprimer ce membre ?")) return;
    fetchWithAuth(`${API_BASE}/api/info_equipe/${matricule}/`, { method: "DELETE" })
      .then(() => fetchAll());
  };

  // Séparation conducteurs/dockers
  const conducteurs = membres.filter(m => m.fonction === "conducteur");
  const dockers = membres.filter(m => m.fonction === "docker");

  // Fonction utilitaire pour exporter en Excel
  const exportToExcel = (data: Membre[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data.map(({ id, ...rest }) => rest));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };
  // Fonction utilitaire pour exporter en PDF
  const exportToPDF = async (data: Membre[], filename: string) => {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    const tableColumn = [
      "Matricule",
      "Nom",
      "Prénom",
      "Email",
      "Téléphone",
      "Date embauche",
      "Disponibilité",
      "Équipe"
    ];
    const tableRows = data.map(m => [
      m.matricule,
      m.nom,
      m.prenom,
      m.email,
      m.phone_number,
      m.date_embauche,
      disponibiliteOptions.find(opt => opt.value === m.disponibilite)?.label || m.disponibilite,
      m.id_equipe
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className={styles.pageBg}>
      <Header />
      <main className={styles.mainCentered}>
        <div className={styles.card}>
          <h1 className={styles.title}>Gestion des équipes & membres</h1>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.actionsRow}>
            <button className={styles.addBtn} onClick={() => setShowForm(true)}>
              <span className={styles.plusIcon}>+</span> Ajouter un membre
            </button>
            <button className={styles.refreshBtn} onClick={fetchAll}>
              <span className={styles.refreshIcon}>&#8635;</span> Actualiser
            </button>
          </div>
          {showForm && (
            <form onSubmit={handleSubmit} className={styles.formCard}>
              <div className={styles.formGrid}>
                <div>
                  <label>Matricule</label>
                  <input className={styles.input} required value={form.matricule} onChange={e => setForm(f => ({ ...f, matricule: e.target.value }))} />
                </div>
                <div>
                  <label>Fonction</label>
                  <select className={styles.input} value={form.fonction} onChange={e => setForm(f => ({ ...f, fonction: e.target.value }))}>
                    <option value="conducteur">Conducteur</option>
                    <option value="docker">Docker</option>
                  </select>
                </div>
                <div>
                  <label>Équipe</label>
                  <select className={styles.input} required value={form.id_equipe} onChange={e => setForm(f => ({ ...f, id_equipe: e.target.value }))}>
                    <option value="">{equipes.length === 0 ? "Aucune équipe disponible" : "Sélectionner..."}</option>
                    {equipes.map(eq => (
                      <option key={eq.id_equipe} value={eq.id_equipe}>Équipe {eq.id_equipe}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Nom</label>
                  <input className={styles.input} required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div>
                  <label>Prénom</label>
                  <input className={styles.input} required value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
                </div>
                <div>
                  <label>Email</label>
                  <input className={styles.input} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label>Téléphone</label>
                  <input className={styles.input} required value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
                </div>
                <div>
                  <label>Date d'embauche</label>
                  <input className={styles.input} type="date" required value={form.date_embauche} onChange={e => setForm(f => ({ ...f, date_embauche: e.target.value }))} />
                </div>
                <div>
                  <label>Disponibilité</label>
                  <select className={styles.input} value={form.disponibilite} onChange={e => setForm(f => ({ ...f, disponibilite: e.target.value }))}>
                    {disponibiliteOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.formActions}>
                <button className={styles.addBtn} type="submit">Créer</button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </form>
          )}
          <h2 className={styles.sectionTitle}>Conducteurs</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Date embauche</th>
                  <th>Disponibilité</th>
                  <th>Équipe</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {conducteurs.map(m => (
                  <tr key={m.id}>
                    <td>{m.matricule}</td>
                    <td>{m.nom}</td>
                    <td>{m.prenom}</td>
                    <td>{m.email}</td>
                    <td>{m.phone_number}</td>
                    <td>{m.date_embauche}</td>
                    <td>{disponibiliteOptions.find(opt => opt.value === m.disponibilite)?.label || m.disponibilite}</td>
                    <td>{m.id_equipe}</td>
                    <td>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(m.matricule)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 className={styles.sectionTitle}>Dockers</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Date embauche</th>
                  <th>Disponibilité</th>
                  <th>Équipe</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {dockers.map(m => (
                  <tr key={m.id}>
                    <td>{m.matricule}</td>
                    <td>{m.nom}</td>
                    <td>{m.prenom}</td>
                    <td>{m.email}</td>
                    <td>{m.phone_number}</td>
                    <td>{m.date_embauche}</td>
                    <td>{disponibiliteOptions.find(opt => opt.value === m.disponibilite)?.label || m.disponibilite}</td>
                    <td>{m.id_equipe}</td>
                    <td>
                      <button className={styles.deleteBtn} onClick={() => handleDelete(m.matricule)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.exportRow}>
            <label>Exporter Conducteurs : </label>
            <select
              onChange={async e => {
                if (e.target.value === "excel") exportToExcel(conducteurs, "conducteurs");
                if (e.target.value === "pdf") await exportToPDF(conducteurs, "conducteurs");
                e.target.selectedIndex = 0;
              }}
              defaultValue=""
              className={styles.exportSelect}
            >
              <option value="" disabled>Choisir le format</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div className={styles.exportRow}>
            <label>Exporter Dockers : </label>
            <select
              onChange={async e => {
                if (e.target.value === "excel") exportToExcel(dockers, "dockers");
                if (e.target.value === "pdf") await exportToPDF(dockers, "dockers");
                e.target.selectedIndex = 0;
              }}
              defaultValue=""
              className={styles.exportSelect}
            >
              <option value="" disabled>Choisir le format</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EquipesPage; 