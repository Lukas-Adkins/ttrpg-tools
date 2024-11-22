import React, { useState } from "react";
import {
  useFetchInventory,
  useAddInventoryItem,
  useDeleteInventoryItem,
} from "../firebase/api";

const Inventory = ({ userId, characterId }) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Use updated React Query hooks
  const { data: inventory = [], isLoading } = useFetchInventory({ userId, characterId });
  const addItemMutation = useAddInventoryItem({ userId, characterId });
  const deleteItemMutation = useDeleteInventoryItem({ userId, characterId });

  const handleAddItem = () => {
    if (!itemName.trim()) return;
    addItemMutation.mutate({ itemName, quantity });
    setItemName("");
    setQuantity(1);
  };

  const handleDeleteItem = (itemId) => {
    deleteItemMutation.mutate({ itemId });
  };

  return (
    <div>
      <h1>Inventory</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {inventory.map((item) => (
            <li key={item.id}>
              {item.itemName} (x{item.quantity})
              <button
                onClick={() => handleDeleteItem(item.id)}
                disabled={deleteItemMutation.isLoading && deleteItemMutation.variables?.itemId === item.id}
              >
                {deleteItemMutation.isLoading && deleteItemMutation.variables?.itemId === item.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
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
        <button onClick={handleAddItem} disabled={addItemMutation.isLoading}>
          {addItemMutation.isLoading ? "Adding..." : "Add Item"}
        </button>
      </div>
    </div>
  );
};

export default Inventory;
