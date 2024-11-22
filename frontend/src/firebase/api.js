import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CACHE_TIME = 60000; // Cache data for 60 seconds

// === Firebase Helpers ===

// Inventory Helpers
const fetchInventoryData = async ({ userId, characterId }) => {
  const inventoryRef = collection(db, `users/${userId}/characters/${characterId}/inventory`);
  const snapshot = await getDocs(inventoryRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const addInventoryItemData = async ({ userId, characterId, itemName, quantity }) => {
  const inventoryRef = collection(db, `users/${userId}/characters/${characterId}/inventory`);
  await addDoc(inventoryRef, { itemName, quantity, createdAt: serverTimestamp() });
};

const deleteInventoryItemData = async ({ userId, characterId, itemId }) => {
  const itemRef = doc(db, `users/${userId}/characters/${characterId}/inventory/${itemId}`);
  await deleteDoc(itemRef);
};

// Character Helpers
const fetchCharactersData = async ({ userId }) => {
  const charactersRef = collection(db, `users/${userId}/characters`);
  // Firestore query with sorting by `createdAt`
  const q = query(charactersRef, orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

const addCharacterData = async ({ userId, characterName, imageUrl }) => {
  const charactersRef = collection(db, `users/${userId}/characters`);
  const newCharacter = {
    name: characterName,
    imageUrl: imageUrl || "/images/default-user.png",
    createdAt: serverTimestamp(),
    inventory: [],
  };
  const docRef = await addDoc(charactersRef, newCharacter);
  return { id: docRef.id, ...newCharacter };
};

const updateCharacterData = async ({ userId, characterId, updatedData }) => {
  const characterRef = doc(db, `users/${userId}/characters/${characterId}`);
  await updateDoc(characterRef, { ...updatedData, updatedAt: serverTimestamp() });
};

const deleteCharacterData = async ({ userId, characterId }) => {
  const characterRef = doc(db, `users/${userId}/characters/${characterId}`);
  await deleteDoc(characterRef);
};

// === React Query Hooks ===

// Inventory Hooks
export const useFetchInventory = ({ userId, characterId }) => {
  return useQuery({
    queryKey: ["inventory", userId, characterId],
    queryFn: () => fetchInventoryData({ userId, characterId }),
    enabled: !!userId && !!characterId,
    staleTime: CACHE_TIME,
  });
};

export const useAddInventoryItem = ({ userId, characterId }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemName, quantity }) =>
      addInventoryItemData({ userId, characterId, itemName, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory", userId, characterId]); // Refresh cache
    },
  });
};

export const useDeleteInventoryItem = ({ userId, characterId }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId }) => deleteInventoryItemData({ userId, characterId, itemId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory", userId, characterId]); // Refresh cache
    },
  });
};

// Character Hooks
export const useFetchCharacters = ({ userId }) => {
  return useQuery({
    queryKey: ["characters", userId],
    queryFn: () => fetchCharactersData({ userId }),
    enabled: !!userId,
    staleTime: CACHE_TIME,
  });
};

export const useAddCharacter = ({ userId }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ characterName, imageUrl }) =>
      addCharacterData({ userId, characterName, imageUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries(["characters", userId]); // Refresh cache
    },
  });
};

export const useUpdateCharacter = ({ userId }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ characterId, updatedData }) =>
      updateCharacterData({ userId, characterId, updatedData }),
    onSuccess: () => {
      queryClient.invalidateQueries(["characters", userId]); // Refresh cache
    },
  });
};

export const useDeleteCharacter = ({ userId }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ characterId }) => deleteCharacterData({ userId, characterId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["characters", userId]); // Refresh cache
    },
  });
};
