import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  useFetchCharacters,
  useAddCharacter,
  useDeleteCharacter,
  useUpdateCharacter,
} from "../firebase/api";

const CharacterSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [characterName, setCharacterName] = useState("");
  const [characterImageUrl, setCharacterImageUrl] = useState("");
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false); // Prevent duplicate submissions

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // Deletion confirmation modal
  const [characterToDelete, setCharacterToDelete] = useState(null); // Track character for deletion

  const userId = user?.uid;

  const MAX_CHARACTERS = 9;

  // React Query hooks
  const { data: characters = [], isLoading } = useFetchCharacters({ userId });
  const addCharacter = useAddCharacter({ userId });
  const deleteCharacter = useDeleteCharacter({ userId });
  const updateCharacter = useUpdateCharacter({ userId });

  const handleDeleteCharacter = async () => {
    if (!characterToDelete) return;

    await deleteCharacter.mutateAsync({ characterId: characterToDelete.id });
    setShowDeleteConfirm(false); // Close confirmation modal
    setCharacterToDelete(null); // Reset characterToDelete state
  };

  const handleCreateCharacter = async () => {
    if (!characterName.trim()) return;

    // Prevent creating more than MAX_CHARACTERS
    if (characters.length >= MAX_CHARACTERS) {
      alert("You can only have a maximum of 9 characters.");
      return;
    }

    if (isCreatingCharacter) return; // Prevent duplicate submissions

    setIsCreatingCharacter(true); // Lock further submissions
    try {
      await addCharacter.mutateAsync({
        characterName,
        imageUrl: characterImageUrl.trim() || "/images/default-user.png",
        createdAt: new Date().toISOString(), // Add timestamp here
      });

      setShowModal(false);
      setCharacterName("");
      setCharacterImageUrl("");
    } catch (error) {
      console.error("Failed to create character:", error);
    } finally {
      setIsCreatingCharacter(false); // Unlock submissions
    }
  };

  const handleEditCharacter = async () => {
    if (!editingCharacter || !characterName.trim()) return;

    await updateCharacter.mutateAsync({
      characterId: editingCharacter.id,
      updatedData: {
        name: characterName,
        imageUrl: characterImageUrl.trim() || "/images/default-user.png",
      },
    });

    setShowModal(false);
    setEditingCharacter(null);
    setCharacterName("");
    setCharacterImageUrl("");
  };

  const openDeleteConfirmModal = (character) => {
    setCharacterToDelete(character);
    setShowDeleteConfirm(true);
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

  // Sort characters by creation date
  const sortedCharacters = characters
  .slice()
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Your Characters</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : sortedCharacters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {sortedCharacters.map((character) => (
            <div
              key={character.id}
              className="bg-gray-800 p-6 rounded-lg shadow-lg relative flex flex-col items-center group"
            >
              <div
                onClick={() =>
                  navigate(`/inventory/${character.id}`, {
                    state: { name: character.name }, // Pass the character name
                  })
                }
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
                    openDeleteConfirmModal(character);
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

      <motion.button
        onClick={() => {
          if (characters.length >= MAX_CHARACTERS) {
            alert("You can only have a maximum of 9 characters.");
            return;
          }
          setShowModal(true);
        }}
        className={`fixed bottom-8 right-8 px-6 py-3 rounded-full shadow-lg transition text-white ${
          characters.length >= MAX_CHARACTERS ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
        }`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.3 }}
        disabled={characters.length >= MAX_CHARACTERS}
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
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="bg-gray-800 p-6 rounded-lg text-center shadow-lg"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-4">
                Are you sure you want to delete {characterToDelete?.name}?
              </h2>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDeleteCharacter}
                  className="bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 transition text-white"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500 transition text-white"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterSelection;
