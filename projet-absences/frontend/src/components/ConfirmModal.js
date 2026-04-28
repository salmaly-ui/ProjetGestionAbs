import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050 }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "90%", maxWidth: "400px" }}>
        <h3 style={{ marginBottom: "12px", fontSize: "18px" }}>{title}</h3>
        <p style={{ marginBottom: "20px", color: "#475569" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}>Annuler</button>
          <button onClick={onConfirm} style={{ padding: "8px 16px", borderRadius: "10px", background: "#ef4444", color: "white", border: "none", cursor: "pointer" }}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}