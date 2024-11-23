import React, { useState, useReducer, useEffect } from "react";
import {
  useFetchInventory,
  useAddInventoryItem,
  useDeleteInventoryItem,
  useUpdateInventoryItem,
} from "../firebase/api";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEdit, FaTrash, FaCubes, FaBox } from "react-icons/fa";

const categories = ["Weapons", "Armor", "Magic Items", "Treasure", "Consumables", "Clothes", "Miscellaneous"];
const defaultCurrencies = ["Gold", "Silver", "Copper"];

// Helper Modal Reducer
const initialModalState = { isOpen: false, mode: null, item: null };
const modalReducer = (state, action) => {
  switch (action.type) {
    case "OPEN_ADD":
      return { isOpen: true, mode: "add", item: null };
    case "OPEN_EDIT":
      return { isOpen: true, mode: "edit", item: action.payload };
    case "CLOSE":
      return initialModalState;
    default:
      return state;
  }
};

// Currency Input Component
const CurrencyInput = ({ currency, value, onChange }) => (
  <div className="flex flex-col items-center space-y-2">
    <label className="block text-sm text-gray-300">{currency}</label>
    <input
      type="text"
      pattern="[0-9]*"
      inputMode="numeric"
      value={value}
      onChange={onChange}
      className="bg-gray-700 px-3 py-2 w-24 rounded-md text-white text-center border border-gray-600 focus:ring-2 focus:ring-blue-600 focus:outline-none"
    />
  </div>
);

const InventoryItem = ({ item, onEdit, onDelete }) => (
  <motion.div
    className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 relative group"
    layout
  >
    {/* Item Name */}
    <div>
      <h2 className="text-lg font-medium text-white">{item.itemName}</h2>
    </div>

    {/* Quantity Badge */}
    <div className="absolute top-4 right-4 bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm flex items-center">
      <FaBox className="mr-1 text-gray-400" />
      <span>{item.quantity}</span>
    </div>

    {/* Edit & Delete Buttons */}
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-gray-900 bg-opacity-50 rounded-lg">
      <button
        onClick={() => onEdit(item)}
        className="text-blue-500 hover:text-blue-400 transition-colors duration-200 mx-2"
        title="Edit"
      >
        <FaEdit size={24} />
      </button>
      <button
        onClick={() => onDelete(item.id)}
        className="text-red-500 hover:text-red-400 transition-colors duration-200 mx-2"
        title="Delete"
      >
        <FaTrash size={24} />
      </button>
    </div>
  </motion.div>
);
const Modal = ({ isOpen, mode, item, onClose, onSave }) => {
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (mode === "add") {
        setItemName("");
        setQuantity(1);
        setCategory(""); // Reset to empty for "add" mode
      } else if (mode === "edit" && item) {
        setItemName(item?.itemName ?? ""); // Load existing itemName
        setQuantity(item?.quantity ?? 1); // Load existing quantity
        setCategory(item?.category ?? ""); // Load existing category
      }
    }
  }, [isOpen, mode, item]);

  const handleSave = () => {
    console.log("Saving Item:", { itemName, quantity, category }); // Debugging
    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (itemName.trim() && quantity > 0) {
      onSave({ itemName, quantity, category, id: item?.id });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4">
              {mode === "add" ? "Add New Item" : "Edit Item"}
            </h2>
            <input
              type="text"
              placeholder="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-md"
            />
            <input
              type="number"
              placeholder="Quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-md"
            />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                console.log("Selected Category:", e.target.value); // Debugging
              }}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded-md"
            >
              <option value="" disabled>
                Select a Category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleSave}
                className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 text-white"
              >
                Save
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500 text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};



const Inventory = () => {
  const { characterId } = useParams();
  const { user } = useAuth();
  const userId = user?.uid;

  const [modalState, dispatchModal] = useReducer(modalReducer, initialModalState);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currencies, setCurrencies] = useState(
    defaultCurrencies.map((currency) => ({ name: currency, value: 0 }))
  );

  const { data: inventory = [], isLoading } = useFetchInventory({ userId, characterId });
  const addItemMutation = useAddInventoryItem({ userId, characterId });
  const deleteItemMutation = useDeleteInventoryItem({ userId, characterId });
  const updateItemMutation = useUpdateInventoryItem({ userId, characterId });

  const handleSaveItem = (itemData) => {
    console.log("Item Data Sent to API:", itemData); // Debugging
    if (modalState.mode === "add") {
      addItemMutation.mutate(itemData);
    } else if (modalState.mode === "edit") {
      updateItemMutation.mutate({ itemId: itemData.id, updatedData: itemData });
    }
    dispatchModal({ type: "CLOSE" });
  };
  

  const handleDeleteItem = (id) => {
    deleteItemMutation.mutate({ itemId: id });
  };

  const updateCurrency = (index, value) => {
    setCurrencies((prev) =>
      prev.map((curr, i) => (i === index ? { ...curr, value: Number(value) } : curr))
    );
  };

  const filteredInventory =
    activeCategory === "All"
      ? inventory
      : inventory.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold mb-8">Inventory</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="w-full max-w-6xl">
          {/* Currency Section */}
          <div className="flex flex-wrap items-center bg-gray-800 p-4 rounded-lg mb-6 space-y-4">
            <h2 className="text-2xl font-semibold flex-shrink-0">Currency</h2>
            <div className="flex flex-wrap ml-auto space-x-4">
              {currencies.map((currency, index) => (
                <CurrencyInput
                  key={currency.name}
                  currency={currency.name}
                  value={currency.value}
                  onChange={(e) => updateCurrency(index, e.target.value.replace(/\D/, ""))}
                />
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-4 mb-6 overflow-x-auto">
            {["All", ...categories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md ${
                  activeCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Section */}
          {filteredInventory.length === 0 ? (
            <p className="text-gray-400 text-center">No items found in this category.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInventory.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onEdit={(item) => dispatchModal({ type: "OPEN_EDIT", payload: item })}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Item Button */}
      <button
        onClick={() => dispatchModal({ type: "OPEN_ADD" })}
        className="fixed bottom-8 right-8 bg-blue-600 px-6 py-3 rounded-full shadow-lg hover:bg-blue-500 text-white"
      >
        + Add Item
      </button>

      {/* Modals */}
      <Modal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        item={modalState.item}
        onClose={() => dispatchModal({ type: "CLOSE" })}
        onSave={handleSaveItem}
      />
    </div>
  );
};

export default Inventory;
