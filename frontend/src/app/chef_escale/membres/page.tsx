"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import styles from "../absence-formulaire.module.css";

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
}

const disponibiliteOptions = [
  { value: "en_service", label: "En service" },
  { value: "en_repos", label: "En repos" },
  { value: "disponible", label: "Disponible" },
  { value: "non_disponible", label: "Non disponible" },
];

const MembresPage: React.FC = () => {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
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

  // Charger membres et équipes
  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/membres/").then(res => res.json()),
      fetch("/api/equipes/").then(res => res.json()),
    ])
      .then(([membresData, equipesData]) => {
        setMembres(membresData);
        setEquipes(equipesData);
        setError(null);
      })
      .catch(() => setError("Erreur lors du chargement des données."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Ajout membre
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch("/api/membre/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        id_equipe: Number(form.id_equipe),
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
    fetch(`/api/membre/${matricule}/`, { method: "DELETE" })
      .then(() => fetchAll());
  };

  // Séparation conducteurs/dockers
  const conducteurs = membres.filter(m => m.fonction === "conducteur");
  const dockers = membres.filter(m => m.fonction === "docker");

  return (
    <div>
      <Header />
      <div className={styles.formContainer} style={{ maxWidth: 1200 }}>
        <h1 className={styles.formTitle}>Gestion des membres d'équipe</h1>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <button className={styles.submitBtn} onClick={() => setShowForm(true)}>
            ➕ Ajouter un membre
          </button>
          <button className={styles.submitBtn} style={{ background: '#1a4fa0' }} onClick={fetchAll}>
            🔁 Actualiser
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: "#f8faff", padding: 20, borderRadius: 8, marginBottom: 30 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Matricule</label>
                <input className={styles.formInput} required value={form.matricule} onChange={e => setForm(f => ({ ...f, matricule: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Fonction</label>
                <select className={styles.formSelect} value={form.fonction} onChange={e => setForm(f => ({ ...f, fonction: e.target.value }))}>
                  <option value="conducteur">Conducteur</option>
                  <option value="docker">Docker</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Équipe</label>
                <select className={styles.formSelect} required value={form.id_equipe} onChange={e => setForm(f => ({ ...f, id_equipe: e.target.value }))}>
                  <option value="">Sélectionner...</option>
                  {equipes.map(eq => (
                    <option key={eq.id_equipe} value={eq.id_equipe}>Équipe {eq.id_equipe}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Nom</label>
                <input className={styles.formInput} required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Prénom</label>
                <input className={styles.formInput} required value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Email</label>
                <input className={styles.formInput} type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Téléphone</label>
                <input className={styles.formInput} required value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Date d'embauche</label>
                <input className={styles.formInput} type="date" required value={form.date_embauche} onChange={e => setForm(f => ({ ...f, date_embauche: e.target.value }))} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <label>Disponibilité</label>
                <select className={styles.formSelect} value={form.disponibilite} onChange={e => setForm(f => ({ ...f, disponibilite: e.target.value }))}>
                  {disponibiliteOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              <button className={styles.submitBtn} type="submit">Créer</button>
              <button type="button" className={styles.submitBtn} style={{ background: '#b0b8c1', marginLeft: 10 }} onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}
        <h2 style={{ color: "#1a4fa0", marginTop: 30 }}>Conducteurs</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", background: "#f8faff", borderRadius: 6, marginBottom: 30 }}>
            <thead>
              <tr style={{ background: "#e3e9f1" }}>
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
                    <button className={styles.submitBtn} style={{ background: '#e74c3c' }} onClick={() => handleDelete(m.matricule)}>🗑 Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 style={{ color: "#1a4fa0" }}>Dockers</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", background: "#f8faff", borderRadius: 6 }}>
            <thead>
              <tr style={{ background: "#e3e9f1" }}>
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
                    <button className={styles.submitBtn} style={{ background: '#e74c3c' }} onClick={() => handleDelete(m.matricule)}>🗑 Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MembresPage; 