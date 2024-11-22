import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { fetchCharacters, deleteCharacter, addCharacter, updateCharacter } from "../firebase/api";

const CharacterSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCharacterId, setDeleteCharacterId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [characterImageUrl, setCharacterImageUrl] = useState("");
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const characterList = await fetchCharacters(user.uid);
      setCharacters(characterList);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const handleDeleteCharacter = async () => {
    if (!user || !deleteCharacterId) return;

    setDeleteLoading(true);

    try {
      await deleteCharacter(user.uid, deleteCharacterId);
      setCharacters((prev) => prev.filter((c) => c.id !== deleteCharacterId));
      setDeleteCharacterId(null);
    } catch (error) {
      console.error("Error deleting character:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateCharacter = async () => {
    if (!user || !characterName.trim()) return;

    try {
      const newCharacter = await addCharacter(
        user.uid,
        characterName,
        characterImageUrl.trim() || "/images/default-user.png"
      );
      if (newCharacter) {
        setCharacters((prev) => [...prev, newCharacter]);
        setShowModal(false);
        setCharacterName("");
        setCharacterImageUrl("");
      }
    } catch (error) {
      console.error("Error creating character:", error);
    }
  };

  const handleEditCharacter = async () => {
    if (!user || !editingCharacter || !characterName.trim()) return;

    try {
      await updateCharacter(user.uid, editingCharacter.id, {
        name: characterName,
        imageUrl: characterImageUrl || "/images/default-user.png",
      });
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === editingCharacter.id
            ? { ...c, name: characterName, imageUrl: characterImageUrl || "/images/default-user.png" }
            : c
        )
      );
      setEditingCharacter(null);
      setShowModal(false);
      setCharacterName("");
      setCharacterImageUrl("");
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  const openEditModal = (character) => {
    setEditingCharacter(character);
    setCharacterName(character.name);
    setCharacterImageUrl(character.imageUrl === "/images/default-user.png" ? "" : character.imageUrl);
    setShowModal(true);
  };

  // Modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Characters</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          {/* Loading Spinner */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : characters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg relative flex flex-col items-center group"
            >
              {/* Character Info */}
              <div
                onClick={() => navigate(`/inventory/${character.id}`)}
                className="cursor-pointer flex flex-col items-center w-full"
              >
                <div className="h-24 w-24 mb-4">
                  <motion.img
                    src={character.imageUrl || "/images/default-user.png"}
                    alt={character.name || "Default User"}
                    className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                    onError={(e) => {
                      e.target.src = "/images/default-user.png";
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <h2 className="text-xl font-semibold text-center">{character.name || "Unnamed Character"}</h2>
              </div>

              {/* Action Buttons (Visible on Hover) */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(character);
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-500 transition"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteCharacterId(character.id);
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow h-64">
          <p className="text-lg font-medium text-gray-400 mb-4 text-center">
            No characters found. Create a new character to get started!
          </p>
        </div>
      )}

      {/* Floating Create Character Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 px-6 py-3 rounded-full shadow-lg hover:bg-blue-500 transition text-white"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        + Create Character
      </motion.button>

      {/* Create/Edit Character Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-75"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={backdropVariants}
              transition={{ duration: 0.3 }}
            ></motion.div>
            <motion.div
              className="fixed inset-0 flex items-center justify-center"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {editingCharacter ? "Edit Character" : "Create New Character"}
                </h2>
                <input
                  type="text"
                  placeholder="Character Name"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  value={characterImageUrl}
                  onChange={(e) => setCharacterImageUrl(e.target.value)}
                  className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white focus:outline-none"
                />
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={editingCharacter ? handleEditCharacter : handleCreateCharacter}
                    className="bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition text-white"
                  >
                    {editingCharacter ? "Save Changes" : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingCharacter(null);
                      setCharacterImageUrl("");
                    }}
                    className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500 transition text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteCharacterId && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-75"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={backdropVariants}
              transition={{ duration: 0.3 }}
            ></motion.div>
            <motion.div
              className="fixed inset-0 flex items-center justify-center"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Are you sure you want to delete this character?
                </h2>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleDeleteCharacter}
                    disabled={deleteLoading}
                    className={`bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 transition text-white ${
                      deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {deleteLoading ? "Deleting..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setDeleteCharacterId(null)}
                    className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500 transition text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterSelection;
