import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({ id, item, handleEditItem, setConfirmDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative bg-gray-800 p-4 rounded-lg shadow-lg group"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{item.itemName}</h2>
        <span className="text-sm text-gray-400">x{item.quantity}</span>
      </div>
      {/* Hover-based buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => handleEditItem(item)}
          className="mr-2 text-blue-500 hover:text-blue-400"
        >
          Edit
        </button>
        <button
          onClick={() => setConfirmDelete(item.id)}
          className="text-red-500 hover:text-red-400"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default SortableItem;
