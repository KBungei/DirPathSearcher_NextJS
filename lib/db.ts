
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement>;

async function initializeDb() {
  if (db) {
    return db;
  }

  try {
    db = await open({
      filename: './dir_searcher.db',
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS root_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS all_paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL UNIQUE,
        root_path_id INTEGER,
        FOREIGN KEY (root_path_id) REFERENCES root_paths (id)
      );
    `);

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function addRootPath(path: string): Promise<void> {
  const db = await initializeDb();
  const existing = await db.get('SELECT * FROM root_paths WHERE path = ?', path);
  if (!existing) {
    await db.run('INSERT INTO root_paths (path) VALUES (?)', path);
  }
}

export async function getRootPaths(): Promise<{ id: number; path: string }[]> {
  const db = await initializeDb();
  return db.all('SELECT id, path FROM root_paths');
}

export async function removeRootPath(path: string): Promise<void> {
  const db = await initializeDb();
  const rootPath = await db.get('SELECT id FROM root_paths WHERE path = ?', path);
  if (rootPath) {
    await db.run('DELETE FROM all_paths WHERE root_path_id = ?', rootPath.id);
    await db.run('DELETE FROM root_paths WHERE id = ?', rootPath.id);
  }
}

export async function addDirectory(path: string, rootPathId: number): Promise<void> {
    const db = await initializeDb();
    try {
        await db.run('INSERT INTO all_paths (path, root_path_id) VALUES (?, ?)', path, rootPathId);
    } catch (error) {
        // Ignore unique constraint errors
        if (!(error as any).message.includes('UNIQUE constraint failed')) {
            console.error(`Error adding path ${path}:`, error);
        }
    }
}

export async function removeDirectory(path: string): Promise<void> {
    const db = await initializeDb();
    await db.run('DELETE FROM all_paths WHERE path = ?', path);
}

export async function clearPathsForRoot(rootPathId: number): Promise<void> {
  const db = await initializeDb();
  await db.run('DELETE FROM all_paths WHERE root_path_id = ?', rootPathId);
}

export async function getAllPaths(): Promise<{ path: string }[]> {
    const db = await initializeDb();
    return db.all('SELECT path FROM all_paths');
}

export async function removePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) {
    return;
  }
  const db = await initializeDb();
  const placeholders = paths.map(() => '?').join(',');
  await db.run(`DELETE FROM all_paths WHERE path IN (${placeholders})`, ...paths);
  await db.run(`DELETE FROM root_paths WHERE path IN (${placeholders})`, ...paths);
}
