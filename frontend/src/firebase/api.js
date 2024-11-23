import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CACHE_TIME = 60000; // Cache data for 60 seconds

// === Firebase Helpers ===

// Inventory Helpers
const fetchInventoryData = async ({ userId, characterId }) => {
  console.log("Fetching inventory for:", { userId, characterId });
  const inventoryRef = collection(db, `users/${userId}/characters/${characterId}/inventory`);
  const q = query(inventoryRef, orderBy("createdAt", "asc"));

  try {
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Fetched inventory data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    throw error;
  }
};


const addInventoryItemData = async ({ userId, characterId, itemName, quantity, category }) => {
  console.log("Adding item:", { userId, characterId, itemName, quantity, category }); // Debugging
  const inventoryRef = collection(db, `users/${userId}/characters/${characterId}/inventory`);
  const newItem = {
    itemName,
    quantity,
    category, // Add the category to the Firestore document
    createdAt: serverTimestamp(), // Ensure the createdAt timestamp is stored
  };

  // Add the document to Firestore and retrieve its ID
  const docRef = await addDoc(inventoryRef, newItem);

  // Add the document ID as the `itemId` field
  await updateDoc(docRef, { itemId: docRef.id });
};


const deleteInventoryItemData = async ({ userId, characterId, itemId }) => {
  const itemRef = doc(db, `users/${userId}/characters/${characterId}/inventory/${itemId}`);
  await deleteDoc(itemRef);
};

const updateInventoryItemData = async ({ userId, characterId, itemId, updatedData }) => {
  const itemRef = doc(db, `users/${userId}/characters/${characterId}/inventory/${itemId}`);
  await updateDoc(itemRef, { ...updatedData, updatedAt: serverTimestamp() });
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
    onSuccess: (data) => console.log("Fetched inventory data:", data),
    onError: (error) => console.error("Error fetching inventory:", error),
  });
};

export const useAddInventoryItem = ({ userId, characterId }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemName, quantity, category }) => 
      addInventoryItemData({ userId, characterId, itemName, quantity, category }), // Pass category
    onSuccess: () => {
      console.log("Item added successfully, invalidating inventory query...");
      queryClient.invalidateQueries(["inventory", userId, characterId]); // Refresh inventory data
    },
    onError: (error) => {
      console.error("Error adding item:", error);
    },
  });
};

export const useDeleteInventoryItem = ({ userId, characterId }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId }) => deleteInventoryItemData({ userId, characterId, itemId }),
    onSuccess: () => {
      console.log("Item deleted successfully, invalidating inventory query...");
      queryClient.invalidateQueries(["inventory", userId, characterId]); // Refresh inventory data
    },
    onError: (error) => {
      console.error("Error deleting item:", error);
    },
  });
};

export const useUpdateInventoryItem = ({ userId, characterId }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, updatedData }) =>
      updateInventoryItemData({ userId, characterId, itemId, updatedData }),
    onSuccess: () => {
      console.log("Item updated successfully, invalidating inventory query...");
      queryClient.invalidateQueries(["inventory", userId, characterId]); // Refresh inventory data
    },
    onError: (error) => {
      console.error("Error updating item:", error);
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
