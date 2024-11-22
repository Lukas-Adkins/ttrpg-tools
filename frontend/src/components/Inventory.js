import React, { useState, useEffect } from "react";
import { fetchInventory, addInventoryItem, deleteInventoryItem } from "../firebase/api";

const Inventory = ({ userId, characterId }) => {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const loadInventory = async () => {
      const items = await fetchInventory(userId, characterId);
      setInventory(items);
    };
    loadInventory();
  }, [userId, characterId]);

  const handleAddItem = async () => {
    if (!itemName) return;
    await addInventoryItem(userId, characterId, itemName, quantity);
    setItemName("");
    setQuantity(1);
    const items = await fetchInventory(userId, characterId);
    setInventory(items);
  };

  const handleDeleteItem = async (itemId) => {
    await deleteInventoryItem(userId, characterId, itemId);
    const items = await fetchInventory(userId, characterId);
    setInventory(items);
  };

  return (
    <div>
      <h1>Inventory</h1>
      <ul>
        {inventory.map((item) => (
          <li key={item.id}>
            {item.itemName} (x{item.quantity})
            <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          placeholder="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button onClick={handleAddItem}>Add Item</button>
      </div>
    </div>
  );
};

export default Inventory;
