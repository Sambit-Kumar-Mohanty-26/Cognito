import { openDB, type DBSchema } from 'idb';
import type { ResearchCard } from '../types';

const DB_NAME = 'CognitoDB';
const DB_VERSION = 1;
const STORE_NAME = 'research-cards';

interface CognitoDBSchema extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: ResearchCard;
    indexes: { createdAt: number };
  };
}

async function initDB() {
  const db = await openDB<CognitoDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('createdAt', 'createdAt');
    },
  });
  return db;
}

export async function addCard(card: Omit<ResearchCard, 'id'>): Promise<void> {
  const db = await initDB();
  await db.add(STORE_NAME, card as ResearchCard);
}
export async function getCards(): Promise<ResearchCard[]> {
  const db = await initDB();
  return await db.getAllFromIndex(STORE_NAME, 'createdAt');
}

export async function deleteCard(id: number): Promise<void> {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

export async function updateCard(card: ResearchCard): Promise<void> {
  const db = await initDB();
  await db.put(STORE_NAME, card);
}