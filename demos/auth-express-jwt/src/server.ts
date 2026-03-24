import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { DatabaseSync } from "node:sqlite";

// =============================================================================
// CONFIGURATION
// =============================================================================

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10; // Nombre de tours de salage bcrypt pour le hachage du mot de passe
const TOKEN_EXPIRY = "24h"; // Durée de validité du token JWT

// =============================================================================
// BASE DE DONNÉES
// =============================================================================

// Le chemin ":memory:" crée une base de données en mémoire (données perdues au redémarrage)
// Pour persister les données, utiliser un chemin de fichier comme "./database.sqlite"
const db = new DatabaseSync(":memory:");

// Création de la table users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    bio TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// =============================================================================
// TYPES
// =============================================================================

// Le payload qu'on encode dans le JWT - on le garde minimal !
interface JwtPayload {
  userId: number;
}

// Extension de la Request Express pour inclure notre utilisateur
interface AuthenticatedRequest extends Request {
  userId?: number;
}

// Utilisateur tel que stocké en base de données
interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  bio: string | null;
  created_at: string;
}

// Infos utilisateur publiques (visibles par tout le monde)
type PublicUser = Pick<User, "id" | "username" | "display_name" | "bio" | "created_at">;

// Infos utilisateur privées (visibles uniquement par l'utilisateur lui-même)
type PrivateUser = Omit<User, "password_hash">;


// =============================================================================
// CONFIGURATION EXPRESS
// =============================================================================

const app = express();
app.use(express.json());
app.use(parseToken);

// =============================================================================
// MIDDLEWARES
// =============================================================================

/**
 * Parse le token JWT s'il est présent et définit req.userId.
 * Si un token est fourni mais invalide/expiré, renvoie 401.
 */
function parseToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return next();

  try {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

/**
 * Vérifie qu'un utilisateur est connecté (req.userId doit être défini).
 * À utiliser après parseToken.
 */
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.userId) {
    return res.status(401).json({ error: "Authentification requise" });
  }
  next();
}

// =============================================================================
// ROUTES PUBLIQUES (pas d'authentification requise)
// =============================================================================

/**
 * Point de contrôle de santé (Health Check)
 * Un endpoint simple pour vérifier que le serveur fonctionne.
 */
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * Inscription
 */
app.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email et password sont requis" });
  }

  try {
    // Hachage du mot de passe avec bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(username, email, passwordHash);

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      userId: result.lastInsertRowid,
    });
  } catch (error: unknown) {
    // Gestion des violations de contrainte d'unicité (username ou email en double)
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "Ce username ou email existe déjà" });
    }
    console.error("Erreur signup:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * Connexion
 */
app.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et password sont requis" });
  }

  try {
    // Recherche de l'utilisateur par email
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = stmt.get(email) as User | undefined;

    if (!user) {
      // Utilisateur non trouvé - message générique pour éviter l'énumération d'emails
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Vérification du mot de passe contre le hash stocké
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Création du token JWT avec un payload minimal (juste l'ID utilisateur)
    const token = jwt.sign({ userId: user.id } satisfies JwtPayload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// =============================================================================
// ROUTES: RESSOURCE UTILISATEUR
// =============================================================================

/**
 * Récupérer un utilisateur par ID
 */
app.get("/users/:id", (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.id as string, 10);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const publicUser: PublicUser = {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    bio: user.bio,
    created_at: user.created_at,
  };

  // AUTORISATION : déterminer ce que le demandeur est autorisé à voir
  // Vérifier si le demandeur est l'utilisateur lui-même
  const isOwnProfile = req.userId === user.id;

  if (isOwnProfile) {
    // Retourner tous les champs sauf password_hash
    const privateUser: PrivateUser = { ...publicUser, email: user.email };
    res.json(privateUser);
  } else {
    // Retourner uniquement les champs publics
    res.json(publicUser);
  }
});

/**
 * Mettre à jour un utilisateur
 * Met à jour les informations d'un utilisateur. Authentification requise.
 */
app.put("/users/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.id as string, 10);

  // Vérification d'autorisation : on ne peut modifier que son propre profil
  if (req.userId !== userId) {
    return res.status(403).json({ error: "Vous ne pouvez modifier que votre propre profil" });
  }

  // Récupérer l'utilisateur actuel
  const current = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
  if (!current) return res.status(404).json({ error: "Utilisateur non trouvé" });

  const { username, email, password, displayName, bio } = req.body;

  // Si un nouveau mot de passe est fourni, le hacher ; sinon garder l'ancien
  const passwordHash = password
    ? await bcrypt.hash(password, SALT_ROUNDS)
    : current.password_hash;

  try {
    // Mettre à jour avec les nouvelles valeurs, ou garder les anciennes (via ??)
    db.prepare(`
      UPDATE users
      SET username = ?, email = ?, password_hash = ?, display_name = ?, bio = ?
      WHERE id = ?
    `).run(
      username ?? current.username,
      email ?? current.email,
      passwordHash,
      displayName ?? current.display_name,
      bio ?? current.bio,
      userId
    );

    res.json({ message: "Utilisateur mis à jour avec succès" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "Ce username ou email existe déjà" });
    }
    console.error("Erreur update:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

/**
 * Supprimer un utilisateur
   Authentification requise.
 */
app.delete("/users/:id", requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.params.id as string, 10);

  // Vérification d'autorisation : on ne peut supprimer que son propre compte
  if (req.userId !== userId) {
    return res.status(403).json({ error: "Vous ne pouvez supprimer que votre propre compte" });
  }

  const result = db.prepare("DELETE FROM users WHERE id = ?").run(userId);

  if (result.changes === 0) return res.status(404).json({ error: "Utilisateur non trouvé" });

  res.json({ message: "Utilisateur supprimé avec succès" });
});

// =============================================================================
// DÉMARRAGE DU SERVEUR
// =============================================================================

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
