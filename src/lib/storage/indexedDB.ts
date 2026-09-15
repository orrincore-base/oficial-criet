import { BrandConfig, Project } from '../../types';
import {
  getLocalStorageBrand,
  saveLocalStorageBrand,
} from './base64Helper';

const DB_NAME = 'criet_db';
const DB_VERSION = 1;

export const DEFAULT_BRAND: BrandConfig = {
  pageName: 'Minha Marca',
  logoUrl: '',
  instagram: '@suapagina',
  facebook: 'facebook.com/suapagina',
  website: 'www.suapagina.com',
  phone: '+244 923 000 000',
  email: 'contato@suapagina.com',
  primaryColor: '#1D4ED8', // Clean modern blue
  secondaryColor: '#0F172A', // Dark navy
  footerText: '@suapagina  •  WhatsApp: +244 923 000 000  •  www.suapagina.com',
  additionalInfo: 'Comunicação rápida, visual e independente.',
  footerEnabled: true,
  showLogo: true,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
        projectStore.createIndex('createdAt', 'createdAt', { unique: false });
        projectStore.createIndex('type', 'type', { unique: false });
      }
      if (!db.objectStoreNames.contains('brand')) {
        db.createObjectStore('brand', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('media')) {
        db.createObjectStore('media', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Erro ao abrir IndexedDB'));
  });
}

// Brand configuration storage
export async function getStoredBrand(): Promise<BrandConfig> {
  // 1. Prioritize user's localStorage configuration
  const localBrand = getLocalStorageBrand();
  if (localBrand) {
    return localBrand;
  }

  // 2. Otherwise check IndexedDB
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('brand', 'readonly');
      const store = tx.objectStore('brand');
      const req = store.get('current');

      req.onsuccess = () => {
        if (req.result && req.result.data) {
          const brandData = req.result.data as BrandConfig;
          saveLocalStorageBrand(brandData);
          resolve(brandData);
        } else {
          resolve(DEFAULT_BRAND);
        }
      };
      req.onerror = () => {
        resolve(DEFAULT_BRAND);
      };
    });
  } catch (err) {
    console.warn('Falha ao aceder IndexedDB para marca, usando padrão:', err);
    return DEFAULT_BRAND;
  }
}

export async function saveBrand(brand: BrandConfig): Promise<void> {
  try {
    // 1. Persist directly in browser LocalStorage with full Base64 logo and contacts
    saveLocalStorageBrand(brand);

    // 2. Also persist in IndexedDB for redundancy
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('brand', 'readwrite');
      const store = tx.objectStore('brand');
      const req = store.put({ id: 'current', data: brand, updatedAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erro ao salvar marca:', err);
  }
}

// Projects storage
export async function getAllProjects(): Promise<Project[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const req = store.getAll();

      req.onsuccess = () => {
        const list = (req.result as Project[]) || [];
        // sort by updatedAt desc
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        resolve(list);
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn('Erro ao carregar projetos do IndexedDB:', err);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('projects', 'readonly');
      const store = tx.objectStore('projects');
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readwrite');
      const store = tx.objectStore('projects');
      const req = store.put(project);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Erro salvando projeto:', err);
    throw err;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readwrite');
      const store = tx.objectStore('projects');
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Erro eliminando projeto:', err);
  }
}

export async function duplicateProject(original: Project): Promise<Project> {
  const newProject: Project = {
    ...original,
    id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name: `${original.name} (Cópia)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveProject(newProject);
  return newProject;
}

export async function clearAllProjects(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('projects', 'readwrite');
      const store = tx.objectStore('projects');
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Erro limpando projetos:', err);
  }
}
