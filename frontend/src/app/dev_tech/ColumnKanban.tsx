import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { FaCheckCircle, FaTools, FaUserTie } from 'react-icons/fa';
import EnginCard, { Engin } from "./EnginCard";
import styles from "./dev-tech.module.css";

type Props = {
  etat: "disponible" | "en maintenance" | "affecté";
  engins: Engin[];
  index: number;
};

const ETAT_LABELS: Record<string, string> = {
  "disponible": "Disponible",
  "en maintenance": "En maintenance",
  "affecté": "Affecté",
};

const ETAT_ICONS: Record<string, React.ReactNode> = {
  "disponible": <FaCheckCircle style={{ color: "#4caf50" }} />,
  "en maintenance": <FaTools style={{ color: "#ff9800" }} />,
  "affecté": <FaUserTie style={{ color: "#2196f3" }} />,
};

export default function ColumnKanban({ etat, engins }: Props) {
  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        {ETAT_ICONS[etat]}
        {ETAT_LABELS[etat]}
        <span style={{ marginLeft: "auto", color: "#6c757d", fontSize: "0.9rem", fontWeight: "500" }}>
          {engins.length}
        </span>
      </div>
      <Droppable droppableId={etat}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              minHeight: 80,
              background: snapshot.isDraggingOver ? "#e3f2fd" : undefined,
              borderRadius: 8,
              transition: "background 0.2s",
              padding: "0.5rem",
            }}
          >
            {engins.map((engin, idx) => (
              <Draggable key={engin.code_engin} draggableId={engin.code_engin} index={idx}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <EnginCard engin={engin} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
} 