import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";
import session from "express-session";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares pour lire les données du formulaire
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(session({
  secret: "votre_secret",
  resave: false,
  saveUninitialized: false
}));

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
    res.redirect("/creationcompte.html"); // Redirige vers le profil après inscription

  } catch (error) {
    console.error("❌ Erreur lors de l'insertion :", error);
    res.status(500).send("Erreur lors de l'enregistrement en base de données.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

// route: connexion
app.post("/connexion", async (req, res) => {
  try {
    const { email_connexion, mdp_connexion } = req.body;

    const [etudiant] = await db.query(
      "SELECT * FROM etudiant WHERE email_academique = ? AND mdp_etudiant = ?",
      [email_connexion, mdp_connexion]
    );

    if (etudiant.length > 0) {
      console.log(`✅ Connexion réussie pour : ${email_connexion}`);

      req.session.userId = etudiant[0].id_etudiant;
      req.session.role = "etudiant";
      req.session.nom = etudiant[0].nom_etudiant;
      
      res.status(200).json({ success: true });
    } else {
      console.log(`❌ Échec de la connexion pour : ${email_connexion}`);
      res.status(401).json({ success: false, message: "Identifiants incorrects." });
    }

      const {entreprise}= await db.query("SELECT * FROM entreprise WHERE email_entreprise = ? AND mdp_entreprise = ?", [email_connexion, mdp_connexion]);
  if (entreprise.length > 0) {
    console.log(`✅ Connexion réussie pour : ${email_connexion}`);
    req.session.userId = entreprise[0].id;
      req.session.role = "entreprise";
      req.session.nom = entreprise[0].nom_entreprise;
      
    res.status(200).json({ success: true });
  } else {
    console.log(`❌ Échec de la connexion pour : ${email_connexion}`);
    res.status(401).json({ success: false, message: "Identifiants incorrects." });
  }
  } catch (error) {
    console.error("❌ Erreur lors de la connexion :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }




});

// route : session


app.get("/profil", async (req, res) => {
  try {
    const userId = req.session.userId;
    const role = req.session.role;

    // SÉCURITÉ : Si l'utilisateur n'est pas connecté ou n'est pas étudiant, on stoppe TOUT de suite
    if (!userId || role !== "etudiant") {
      return res.status(401).json({ error: "Non autorisé. Veuillez vous connecter." });
    }

    // AJUSTE ICI : remplace 'id_etudiant' par le nom exact de ta colonne ID dans ta table SQL
    const [etudiant] = await db.query(
      "SELECT id_etudiant, nom_etudiant, prenom_etudiant, email_academique, num_telephone, année_etude, formation_etudiant FROM etudiant WHERE id_etudiant = ?",
      [userId]
    );

    if (etudiant.length > 0) {
      return res.json(etudiant[0]); // On renvoie les infos de l'étudiant
    } else {
      return res.status(404).json({ error: "Étudiant non trouvé." });
    }

  } catch (error) {
    console.error("❌ Erreur lors de la récupération du profil :", error);
    return res.status(500).json({ error: "Erreur serveur." });
  }
});