import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares pour lire les données du formulaire
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route pour afficher la page d'inscription
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "inscription_s.html"));
});

// ROUTE D'INSCRIPTION : C'est ici que la magie opère
app.post("/etudiant-inscription", async (req, res) => {
  try {
    // On extrait les noms correspondant aux "name" de ton HTML
    const { nom_etudiant, prenom_etudiant, email_academique, num_telephone, année_etude, formation_etudiant, mdp_etudiant } = req.body;

    const sql = `INSERT INTO etudiant 
      (nom_etudiant, prenom_etudiant, email_academique, num_telephone, année_etude, formation_etudiant, mdp_etudiant) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    await db.query(sql, [nom_etudiant, prenom_etudiant, email_academique, num_telephone, année_etude, formation_etudiant, mdp_etudiant]);
    console.log(`✅ Inscription réussie pour : ${nom_etudiant} ${prenom_etudiant}`);
    res.redirect("/profil_s.html"); // Redirige vers le profil après inscription

  } catch (error) {
    console.error("❌ Erreur lors de l'insertion :", error);
    res.status(500).send("Erreur lors de l'enregistrement en base de données.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});