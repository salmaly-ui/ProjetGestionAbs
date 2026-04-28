import React from "react";

export default function SplashScreen() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <img 
        src="/logo.png" 
        alt="Logo" 
        style={{
          width: "120px",
          borderRadius: "20px",
          animation: "bounce 1s ease-in-out"
        }}
      />
      <div style={{ marginTop: "24px", color: "white", fontSize: "20px", fontWeight: "bold", textAlign: "center", maxWidth: "80%" }}>
        Système de Gestion<br />des Absences Médicales
      </div>
      <div style={{
        position: "absolute",
        bottom: "40px",
        width: "30px",
        height: "30px",
        border: "3px solid rgba(255,255,255,0.3)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <style>{`
        @keyframes bounce {
          0%,100%{ transform: translateY(0); }
          50%{ transform: translateY(-15px); }
        }
        @keyframes spin {
          to{ transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}