import * as SQLite from 'expo-sqlite';

// Open the database (creates it if it doesn't exist)
const db = SQLite.openDatabaseSync('dream-journal.db');

export interface DreamData {
  id?: number; // Database IDs are numbers
  title: string;
  body: string;
  date: string;
  mood: number;
  isLucid: number; // SQLite uses 0/1 for booleans
  isNightmare: number;
  tags: string;   // Stored as JSON string
  images: string; // Stored as JSON string
}

// 1. Initialize Table
export const initDatabase = () => {
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
      images TEXT
    );
  `);
};

// 2. Fetch All Dreams
export const getDreams = () => {
  const result = db.getAllSync('SELECT * FROM dreams ORDER BY id DESC');
  return result;
};

// 3. Insert Dream
export const insertDream = (dream: DreamData) => {
  const statement = db.prepareSync(
    'INSERT INTO dreams (title, body, date, mood, isLucid, isNightmare, tags, images) VALUES ($title, $body, $date, $mood, $isLucid, $isNightmare, $tags, $images)'
  );
  
  const result = statement.executeSync({
    $title: dream.title,
    $body: dream.body,
    $date: dream.date,
    $mood: dream.mood,
    $isLucid: dream.isLucid,
    $isNightmare: dream.isNightmare,
    $tags: dream.tags,
    $images: dream.images
  });

  return result.lastInsertRowId;
};

// 4. Delete Dream
export const removeDream = (id: number) => {
  db.execSync(`DELETE FROM dreams WHERE id = ${id}`);
};

export const updateDreamInDb = (dream: DreamData) => {
  const statement = db.prepareSync(
    'UPDATE dreams SET title = $title, body = $body, date = $date, mood = $mood, isLucid = $isLucid, isNightmare = $isNightmare, tags = $tags, images = $images WHERE id = $id'
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
    $images: dream.images
  });

  return result.changes;
};

// 6. Nuke Everything
export const clearDatabase = () => {
  db.execSync('DELETE FROM dreams');
};