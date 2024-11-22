import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchCharacters, deleteCharacter, addCharacter, updateCharacter } from "../firebase/api";

const CharacterSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCharacterId, setDeleteCharacterId] = useState(null); // Track character for deletion
  const [showModal, setShowModal] = useState(false); // Track modal visibility
  const [characterName, setCharacterName] = useState(""); // Character name input
  const [characterImageUrl, setCharacterImageUrl] = useState(""); // Character image URL input
  const [editingCharacter, setEditingCharacter] = useState(null); // Track character being edited
  const [deleteLoading, setDeleteLoading] = useState(false); // Track deletion state

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

    setDeleteLoading(true); // Show loading state for deletion

    try {
      await deleteCharacter(user.uid, deleteCharacterId);
      setCharacters((prev) => prev.filter((c) => c.id !== deleteCharacterId)); // Remove from UI
      setDeleteCharacterId(null); // Reset modal state
    } catch (error) {
      console.error("Error deleting character:", error);
    } finally {
      setDeleteLoading(false); // Remove loading state
    }
  };

  const handleCreateCharacter = async () => {
    if (!user || !characterName.trim()) return;
  
    try {
      const newCharacter = await addCharacter(
        user.uid,
        characterName,
        characterImageUrl.trim() || "/images/default-user.png" // Default to fallback image
      );
      if (newCharacter) {
        setCharacters((prev) => [...prev, newCharacter]); // Add new character to the list
        setShowModal(false); // Close the modal
        setCharacterName(""); // Reset name input
        setCharacterImageUrl(""); // Reset image URL input
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
        imageUrl: characterImageUrl || "/images/default-user.png", // Default image if input is blank
      });
      setCharacters((prev) =>
        prev.map((c) =>
          c.id === editingCharacter.id
            ? { ...c, name: characterName, imageUrl: characterImageUrl || "/images/default-user.png" }
            : c
        )
      ); // Update the UI
      setEditingCharacter(null); // Reset editing state
      setShowModal(false); // Close the modal
      setCharacterName(""); // Reset name input
      setCharacterImageUrl(""); // Reset image URL input
    } catch (error) {
      console.error("Error updating character:", error);
    }
  };

  const openEditModal = (character) => {
    setEditingCharacter(character);
    setCharacterName(character.name);
    setCharacterImageUrl(character.imageUrl === "/images/default-user.png" ? "" : character.imageUrl); // Avoid auto-populating with default image
    setShowModal(true);
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
              className="bg-gray-800 p-6 rounded-lg shadow-lg relative flex flex-col items-center"
            >
              {/* Character Info */}
              <div
                onClick={() => navigate(`/inventory/${character.id}`)}
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="h-24 w-24 mb-4">
                  <img
                    src={character.imageUrl || "/images/default-user.png"}
                    alt={character.name || "Default User"}
                    className="w-full h-full object-cover rounded-full border-2 border-gray-600"
                    onError={(e) => {
                      e.target.src = "/images/default-user.png"; // Fallback to default image
                    }}
                  />
                </div>
                <h2 className="text-xl font-semibold text-center">
                  {character.name || "Unnamed Character"}
                </h2>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => openEditModal(character)}
                className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-500 transition"
              >
                Edit
              </button>

              {/* Delete Button */}
              <button
                onClick={() => setDeleteCharacterId(character.id)} // Set character for deletion
                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-500 transition"
              >
                Delete
              </button>
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
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 bg-blue-600 px-6 py-3 rounded-full shadow-lg hover:bg-blue-500 transition text-white"
      >
        + Create Character
      </button>

      {/* Create/Edit Character Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
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
                  setEditingCharacter(null); // Reset editing state
                  setCharacterImageUrl(""); // Clear the image URL input
                }}
                className="bg-gray-600 px-4 py-2 rounded-md hover:bg-gray-500 transition text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCharacterId && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
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
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;
