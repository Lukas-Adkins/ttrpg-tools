import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
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
