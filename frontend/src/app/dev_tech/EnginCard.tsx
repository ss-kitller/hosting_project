import React from "react";
import styles from "./dev-tech.module.css";

export type Engin = {
  code_engin: string;
  famille_engin: string;
  capacite_max: number;
  etat_engin: "disponible" | "en maintenance" | "affecté";
};

type Props = {
  engin: Engin;
};

export default function EnginCard({ engin }: Props) {
  return (
    <div className={styles.enginCard} data-etat={engin.etat_engin}>
      <div className={styles.enginCardTitle}>{engin.code_engin}</div>
      <div className={styles.enginCardFamille}>{engin.famille_engin}</div>
      <div className={styles.enginCardCapacite}>
        Capacité max : {engin.capacite_max}
      </div>
    </div>
  );
} 