import * as SQLite from 'expo-sqlite';

// Open the database (creates it if it doesn't exist)
const db = SQLite.openDatabaseSync('dream-journal.db');

// 1. Strict Typing
export interface DreamData {
  id?: number;
  title: string;
  body: string;
  date: string;
  mood: number;
  isLucid: number; // 0 or 1
  isNightmare: number; // 0 or 1
  tags: string;   // JSON string
  images: string; // JSON string
  interpretation: string; // Ensure this is always a string, default to '' if missing
}

// Current Schema Version
const CURRENT_DB_VERSION = 1;

export const initDatabase = () => {
  try {
    // A. Check current version
    const versionResult = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    let currentVersion = versionResult?.user_version || 0;

    if (currentVersion >= CURRENT_DB_VERSION) {
      return; // Already up to date
    }

    if (currentVersion === 0) {
      // Initialize Fresh
      db.execSync(`
        CREATE TABLE IF NOT EXISTS dreams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          body TEXT,
          date TEXT,
          mood INTEGER,
          isLucid INTEGER,
          isNightmare INTEGER,
          tags TEXT,
          images TEXT,
          interpretation TEXT
        );
      `);
      currentVersion = 1;
      db.execSync(`PRAGMA user_version = ${currentVersion}`);
    }

    // Example Future Migration (e.g., version 2)
    // if (currentVersion < 2) {
    //    db.execSync('ALTER TABLE dreams ADD COLUMN ...');
    //    currentVersion = 2;
    //    db.execSync(`PRAGMA user_version = ${currentVersion}`);
    // }

    // Final sanity check
    db.execSync(`PRAGMA user_version = ${CURRENT_DB_VERSION}`);

  } catch (e) {
    console.error("Database Initialization Error:", e);
    throw e; // Re-throw so Context can catch it
  }
};

// 2. Fetch All Dreams
export const getDreams = () => {
  const result = db.getAllSync<DreamData>('SELECT * FROM dreams ORDER BY id DESC');
  return result;
};

// 3. Insert Dream (UPDATED)
export const insertDream = (dream: DreamData) => {
  const statement = db.prepareSync(
    'INSERT INTO dreams (title, body, date, mood, isLucid, isNightmare, tags, images, interpretation) VALUES ($title, $body, $date, $mood, $isLucid, $isNightmare, $tags, $images, $interpretation)'
  );

  const result = statement.executeSync({
    $title: dream.title,
    $body: dream.body,
    $date: dream.date,
    $mood: dream.mood,
    $isLucid: dream.isLucid,
    $isNightmare: dream.isNightmare,
    $tags: dream.tags,
    $images: dream.images,
    $interpretation: dream.interpretation || '' // Default to empty string
  });

  return result.lastInsertRowId;
};

// 4. Delete Dream
export const removeDream = (id: number) => {
  db.execSync(`DELETE FROM dreams WHERE id = ${id}`);
};

// 5. Update Dream (UPDATED)
export const updateDreamInDb = (dream: DreamData) => {
  const statement = db.prepareSync(
    'UPDATE dreams SET title = $title, body = $body, date = $date, mood = $mood, isLucid = $isLucid, isNightmare = $isNightmare, tags = $tags, images = $images, interpretation = $interpretation WHERE id = $id'
  );

  const result = statement.executeSync({
    $id: dream.id!, // ID is required for updates
    $title: dream.title,
    $body: dream.body,
    $date: dream.date,
    $mood: dream.mood,
    $isLucid: dream.isLucid,
    $isNightmare: dream.isNightmare,
    $tags: dream.tags,
    $images: dream.images,
    $interpretation: dream.interpretation || ''
  });

  return result.changes;
};

// 6. Nuke Everything
export const clearDatabase = () => {
  db.execSync('DELETE FROM dreams');
};