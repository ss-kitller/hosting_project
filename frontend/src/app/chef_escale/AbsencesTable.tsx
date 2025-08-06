import React from "react";
import styles from "./absences.module.css";

export interface Absence {
  matricule: string;
  nom: string;
  prenom: string;
  type: string;
  date_debut_abs: string;
  date_fin_abs: string;
  justification: string;
  justifiee: boolean;
}

interface AbsencesTableProps {
  data: Absence[];
  title: string;
}

const AbsencesTable: React.FC<AbsencesTableProps> = ({ data, title }) => (
  <section>
    <h2 className={styles.sectionTitle}>{title}</h2>
    <div className={styles.tableWrapper}>
      <table className={styles.absTable}>
        <thead>
          <tr>
            <th>Matricule</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Type</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Justification</th>
            <th>Justifiée ?</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center", color: "#b0b8c1" }}>Aucune absence à afficher.</td>
            </tr>
          ) : (
            data.map((abs, idx) => (
              <tr key={abs.matricule + abs.date_debut_abs + idx}>
                <td>{abs.matricule}</td>
                <td>{abs.nom}</td>
                <td>{abs.prenom}</td>
                <td>{abs.type}</td>
                <td>{abs.date_debut_abs}</td>
                <td>{abs.date_fin_abs}</td>
                <td>{abs.justification}</td>
                <td className={abs.justifiee ? styles.justified : styles.notJustified}>
                  {abs.justifiee ? "oui" : "non"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>
);

export default AbsencesTable; 