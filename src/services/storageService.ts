import { Recipe } from '../types';
import { db, storage, auth } from './firebaseConfig';
import {
  collection, doc, setDoc, getDoc, getDocs, deleteDoc,
  query, orderBy, updateDoc, where, limit, addDoc
} from "firebase/firestore";
import {
  ref, uploadString, getDownloadURL, deleteObject, listAll, uploadBytes
} from "firebase/storage";

const COLLECTION_RECIPES = 'recipes';
const COLLECTION_CODES = 'accessCodes';
const COLLECTION_PURCHASE_REQUESTS = 'purchaseRequests';

// ─── ERROR HANDLING ───────────────────────────────────────────────────────

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ─── SANITIZE ─────────────────────────────────────────────────────────────

export const removeUndefined = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(removeUndefined);
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) result[key] = removeUndefined(obj[key]);
    }
    return result;
  }
  return obj;
};

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────

const uploadImageToStorage = async (imageUrl: string, recipeId: string): Promise<string> => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('https://firebasestorage')) return imageUrl;

  const path = `recipes/${recipeId}/cover_${Date.now()}.jpg`;
  const storageRef = ref(storage, path);

  if (imageUrl.startsWith('data:')) {
    await uploadString(storageRef, imageUrl, 'data_url', { contentType: 'image/jpeg' });
  } else if (imageUrl.startsWith('blob:')) {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  } else {
    return imageUrl;
  }

  return await getDownloadURL(storageRef);
};

// ─── SAVE RECIPE ──────────────────────────────────────────────────────────

export const saveRecipeToDB = async (recipe: Recipe, folder?: string): Promise<void> => {
  try {
    let imageUrl = recipe.imageUrl;
    if (imageUrl && !imageUrl.startsWith('https://firebasestorage')) {
      try { 
        imageUrl = await uploadImageToStorage(imageUrl, recipe.id); 
      } catch (e) { 
        console.warn("Image upload failed:", e); 
        if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
          imageUrl = undefined;
        }
      }
    }

    const toSave = removeUndefined({
      ...recipe,
      imageUrl: imageUrl || null,
      isGeneratingImage: false,
      isFree: recipe.isFree ?? false,
      folder: folder || recipe.folder || 'Semua Resep',
      updatedAt: new Date().toISOString(),
      authorId: auth.currentUser?.uid || 'unknown'
    });

    await setDoc(doc(db, COLLECTION_RECIPES, recipe.id), toSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_RECIPES}/${recipe.id}`);
  }
};

// ─── GET ALL RECIPES (admin / chef) ──────────────────────────────────────

export const getAllRecipesFromDB = async (): Promise<Recipe[]> => {
  try {
    const q = query(collection(db, COLLECTION_RECIPES), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const recipes: Recipe[] = [];
    snap.forEach((d) => recipes.push(d.data() as Recipe));
    return recipes;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_RECIPES);
    return [];
  }
};

// ─── GET FREE RECIPES (public, max 10) ────────────────────────────────────

export const getFreeRecipesFromDB = async (): Promise<Recipe[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_RECIPES),
      where("isFree", "==", true),
      limit(20) // Fetch a bit more to sort in memory
    );
    const snap = await getDocs(q);
    const recipes: Recipe[] = [];
    snap.forEach((d) => recipes.push(d.data() as Recipe));
    
    // Sort in memory to avoid requiring a Firestore composite index
    recipes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return recipes.slice(0, 10);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_RECIPES);
    return [];
  }
};

// ─── GET SINGLE RECIPE ────────────────────────────────────────────────────

export const getRecipeFromDB = async (id: string): Promise<Recipe | null> => {
  try {
    const snap = await getDoc(doc(db, COLLECTION_RECIPES, id));
    return snap.exists() ? (snap.data() as Recipe) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_RECIPES}/${id}`);
    return null;
  }
};

// ─── DELETE RECIPE ────────────────────────────────────────────────────────

export const deleteRecipeFromDB = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_RECIPES, id));
    try {
      const folderRef = ref(storage, `recipes/${id}`);
      const listResult = await listAll(folderRef);
      await Promise.all(listResult.items.map((item) => deleteObject(item)));
    } catch (e) { console.warn("Storage cleanup:", e); }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_RECIPES}/${id}`);
  }
};

// ─── UPDATE RECIPE ────────────────────────────────────────────────────────

export const updateRecipeInDB = async (id: string, updates: Partial<Recipe>): Promise<void> => {
  try {
    let imageUrl = updates.imageUrl;
    if (imageUrl && !imageUrl.startsWith('https://firebasestorage')) {
      try { 
        imageUrl = await uploadImageToStorage(imageUrl, id); 
      } catch (e) { 
        console.warn("Image upload failed:", e); 
        if (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:')) {
          imageUrl = undefined; // Do not save base64 to firestore
        }
      }
    }

    const cleaned = removeUndefined({ 
      ...updates, 
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      updatedAt: new Date().toISOString() 
    });
    await updateDoc(doc(db, COLLECTION_RECIPES, id), cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_RECIPES}/${id}`);
  }
};

// ─── TOGGLE FREE STATUS ───────────────────────────────────────────────────

export const toggleRecipeFreeStatus = async (id: string, isFree: boolean): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTION_RECIPES, id), {
      isFree,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_RECIPES}/${id}`);
  }
};

// ─── ACCESS CODE: VALIDATE & MARK USED ───────────────────────────────────

export const validateAccessCode = async (code: string, email: string): Promise<boolean> => {
  try {
    const normalizedCode = code.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // --- KHUSUS TESTING / DEBUGGING ---
    if (normalizedCode === 'CHEF-TEST-BUGS' && normalizedEmail === 'dimasdimfad@gmail.com') {
      return true; // Selalu valid, tidak akan ditandai sebagai 'used' agar bisa dipakai berkali-kali
    }
    // ----------------------------------

    const q = query(
      collection(db, COLLECTION_CODES),
      where("code", "==", normalizedCode),
      where("used", "==", false),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return false;

    // Check if the code has a specific email assigned (from purchase request)
    const codeData = snap.docs[0].data();
    if (codeData.assignedEmail && codeData.assignedEmail.toLowerCase() !== normalizedEmail) {
      return false; // Email doesn't match
    }

    await updateDoc(snap.docs[0].ref, {
      used: true,
      usedAt: new Date().toISOString(),
      usedByEmail: normalizedEmail,
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_CODES);
    return false;
  }
};

// ─── ACCESS CODE: CREATE BATCH ────────────────────────────────────────────

export const createAccessCodes = async (codes: string[]): Promise<void> => {
  try {
    await Promise.all(codes.map(code =>
      addDoc(collection(db, COLLECTION_CODES), {
        code: code.toUpperCase(),
        used: false,
        createdAt: new Date().toISOString(),
      })
    ));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_CODES);
  }
};

// ─── PURCHASE REQUESTS ────────────────────────────────────────────────────

export const createPurchaseRequest = async (name: string, whatsapp: string, email: string): Promise<void> => {
  try {
    await addDoc(collection(db, COLLECTION_PURCHASE_REQUESTS), {
      name,
      whatsapp,
      email,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PURCHASE_REQUESTS);
  }
};

export const getPurchaseRequests = async (): Promise<any[]> => {
  try {
    const q = query(collection(db, COLLECTION_PURCHASE_REQUESTS), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_PURCHASE_REQUESTS);
    return [];
  }
};

export const approvePurchaseRequest = async (id: string, code: string, email: string): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTION_PURCHASE_REQUESTS, id), {
      status: 'approved',
      code: code.toUpperCase(),
      updatedAt: new Date().toISOString(),
    });
    await addDoc(collection(db, COLLECTION_CODES), {
      code: code.toUpperCase(),
      used: false,
      createdAt: new Date().toISOString(),
      assignedEmail: email.trim().toLowerCase(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_PURCHASE_REQUESTS}/${id}`);
  }
};
