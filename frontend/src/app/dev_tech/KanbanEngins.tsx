"use client";
import React, { useState } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import { FaPlus, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import ColumnKanban from "./ColumnKanban";
import ModalAjoutEngin from "./ModalAjoutEngin";
import DashboardEngins from "./DashboardEngins";
import styles from "./dev-tech.module.css";
import { Engin } from "./EnginCard";
import ModalSuppressionEngin from "./ModalSuppressionEngin";

const fetchEngins = async (): Promise<Engin[]> => {
  const res = await fetch("http://localhost:8000/api/engins/");
  if (!res.ok) throw new Error("Erreur lors du chargement des engins");
  return res.json();
};

const patchEngin = async ({
  code_engin,
  etat_engin,
}: {
  code_engin: string;
  etat_engin: Engin["etat_engin"];
}) => {
  const res = await fetch(`http://localhost:8000/api/engins/${code_engin}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ etat_engin }),
  });
  if (!res.ok) throw new Error("Erreur lors de la mise à jour");
  return res.json();
};

const postEngin = async (data: Omit<Engin, "code_engin"> & { code_engin: string }) => {
  const res = await fetch("http://localhost:8000/api/engins/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de l'ajout");
  return res.json();
};

const ETATS: Engin["etat_engin"][] = ["disponible", "en maintenance", "affecté"];

export default function KanbanEngins() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: engins, isLoading, isError } = useQuery({
    queryKey: ["engins"],
    queryFn: fetchEngins,
  });

  const patchMutation = useMutation({
    mutationFn: patchEngin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engins"] });
      toast.success("État de l'engin mis à jour !");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const postMutation = useMutation({
    mutationFn: postEngin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engins"] });
      setModalOpen(false);
      toast.success("Engin ajouté !");
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (code_engin: string) => {
      const res = await fetch(`http://localhost:8000/api/engins/${code_engin}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["engins"] });
      setModalDeleteOpen(false);
      toast.success("Engin supprimé !");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const code_engin = result.draggableId;
    const newEtat = result.destination.droppableId as Engin["etat_engin"];
    const engin = engins?.find((e) => e.code_engin === code_engin);
    if (!engin || engin.etat_engin === newEtat) return;
    patchMutation.mutate({ code_engin, etat_engin: newEtat });
  };

  // Regrouper les engins par état
  const grouped: Record<Engin["etat_engin"], Engin[]> = {
    disponible: [],
    "en maintenance": [],
    affecté: [],
  };
  (engins || []).forEach((e) => grouped[e.etat_engin].push(e));

  // Stats dashboard
  const stats = {
    disponible: grouped["disponible"].length,
    "en maintenance": grouped["en maintenance"].length,
    affecté: grouped["affecté"].length,
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement des engins...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        <FaExclamationTriangle className={styles.errorIcon} />
        <h3>Erreur de chargement</h3>
        <p>Erreur lors du chargement des engins.</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <DashboardEngins stats={stats} />
      <div className={styles.actionsContainer}>
        <button className={styles.addButton} onClick={() => setModalOpen(true)}>
          <FaPlus />
          Ajouter un engin
        </button>
        <button className={styles.deleteButton} onClick={() => setModalDeleteOpen(true)}>
          <FaTrash />
          Supprimer un engin
        </button>
      </div>
      {modalOpen && (
        <ModalAjoutEngin
          onClose={() => setModalOpen(false)}
          onSubmit={postMutation.mutate}
          loading={postMutation.isPending}
        />
      )}
      {modalDeleteOpen && engins && engins.length > 0 && (
        <ModalSuppressionEngin
          engins={engins}
          onClose={() => setModalDeleteOpen(false)}
          onDelete={deleteMutation.mutate}
          loading={deleteMutation.isPending}
        />
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.kanbanBoard}>
          {ETATS.map((etat, idx) => (
            <ColumnKanban
              key={etat}
              etat={etat}
              engins={grouped[etat]}
              index={idx}
            />
          ))}
        </div>
      </DragDropContext>
    </>
  );
} 