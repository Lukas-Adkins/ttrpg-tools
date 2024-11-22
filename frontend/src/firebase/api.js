import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export const fetchInventory = async (userId, characterId) => {
  try {
    const inventoryRef = collection(db, `users/${userId}/characters/${characterId}/inventory`);
    const snapshot = await getDocs(inventoryRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
};

export const addInventoryItem = async (userId, characterId, itemName, quantity) => {
  try {
    const inventoryRef = collection(db, `users/${userId}/characters/${characterId}/inventory`);
    await addDoc(inventoryRef, {
      itemName,
      quantity,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding inventory item:", error);
  }
};

export const deleteInventoryItem = async (userId, characterId, itemId) => {
  try {
    const itemRef = doc(db, `users/${userId}/characters/${characterId}/inventory/${itemId}`);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error deleting inventory item:", error);
  }
};

// Fetch all characters for a specific user
export const fetchCharacters = async (userId) => {
  try {
    const charactersRef = collection(db, `users/${userId}/characters`);
    const snapshot = await getDocs(charactersRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching characters:", error);
    return [];
  }
};

// Add a new character for a specific user
export const addCharacter = async (userId, characterName, imageUrl = "") => {
  try {
    const charactersRef = collection(db, `users/${userId}/characters`);
    const newCharacter = {
      name: characterName,
      imageUrl: imageUrl || "/images/default-user.png", // Placeholder image if no URL provided
      createdAt: serverTimestamp(),
      inventory: [], // Initialize with an empty inventory
    };
    const docRef = await addDoc(charactersRef, newCharacter);
    return { id: docRef.id, ...newCharacter };
  } catch (error) {
    console.error("Error adding character:", error);
    return null;
  }
};

// Update an existing character's name or image
export const updateCharacter = async (userId, characterId, updatedData) => {
  try {
    const characterRef = doc(db, `users/${userId}/characters/${characterId}`);
    await updateDoc(characterRef, {
      ...updatedData,
      updatedAt: serverTimestamp(), // Optional: track when the character was last updated
    });
  } catch (error) {
    console.error("Error updating character:", error);
  }
};

// Delete a specific character
export const deleteCharacter = async (userId, characterId) => {
  try {
    const characterRef = doc(db, `users/${userId}/characters/${characterId}`);
    await deleteDoc(characterRef);
  } catch (error) {
    console.error("Error deleting character:", error);
  }
};
