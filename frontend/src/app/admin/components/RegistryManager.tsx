"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { formatPrice } from "@utils/priceFormat";
import { authenticatedFetch } from "@utils/auth";
import { RegistryItem } from "@types";
import { FaEdit, FaImage, FaTrash } from "react-icons/fa";
import Link from "next/link";

type RegistryForm = Omit<RegistryItem, "id"> & { id?: string };

const categories = [
  "Clothing",
  "Diapering",
  "Feeding",
  "Bathing",
  "Sleeping",
  "Playing",
  "Traveling",
  "General",
];

export default function RegistryManager() {
  const [registryForm, setRegistryForm] = useState<RegistryForm>({
    name: "",
    price: 0,
    quantity: 1,
    category: "General",
    order: 0,
    url: "",
    purchased: false,
    imageUrl: "",
  });
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedRegistryImage, setSelectedRegistryImage] =
    useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedItem, setDraggedItem] = useState<RegistryItem | null>(null);

  useEffect(() => {
    fetchRegistryItems();
  }, []);

  const fetchRegistryItems = async () => {
    try {
      const response = await fetch("/api/registry");
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setRegistryItems(data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  // Always sort by order
  const sortedItems = [...registryItems].sort((a, b) => a.order - b.order);

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = "";

      // If a local image is selected, upload it to Cloudinary first
      if (selectedRegistryImage) {
        try {
          finalImageUrl = await uploadImageToCloudinary(selectedRegistryImage);
        } catch (uploadErr) {
          throw new Error(
            `Failed to upload image: ${
              uploadErr instanceof Error ? uploadErr.message : "Unknown error"
            }`,
          );
        }
      } else if (registryForm.imageUrl) {
        // Use the existing imageUrl if no file is selected
        finalImageUrl = registryForm.imageUrl;
      }

      const response = await authenticatedFetch(
        isEditing
          ? `/api/admin/registry/${registryForm.id}`
          : "/api/admin/registry",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...registryForm,
            imageUrl: finalImageUrl,
          }),
        },
      );

      console.log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save item");
      }

      const savedItem = await response.json();
      console.log("✅ Item saved successfully:", savedItem);

      // Reset form
      setRegistryForm({
        name: "",
        price: 0,
        quantity: 1,
        category: "General",
        order: 0,
        url: "",
        purchased: false,
        imageUrl: "",
      });
      setSelectedRegistryImage(null);
      setIsEditing(false);

      // Refresh the list
      await fetchRegistryItems();
    } catch (error) {
      console.error("❌ Error saving item:", error);
      alert(error instanceof Error ? error.message : "Failed to save item");
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item: RegistryItem) => {
    setRegistryForm({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      order: item.order,
      url: item.url,
      purchased: item.purchased,
      imageUrl: item.imageUrl,
    });
    setIsEditing(true);
    setSelectedRegistryImage(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await authenticatedFetch(`/api/admin/registry/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      // Refresh the list
      await fetchRegistryItems();
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedRegistryImage(file);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: RegistryItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDrop = async (e: React.DragEvent, targetItem: RegistryItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    try {
      // Get current order of items
      const sortedItems = [...registryItems].sort((a, b) => a.order - b.order);
      const draggedIndex = sortedItems.findIndex(
        (item) => item.id === draggedItem.id,
      );
      const targetIndex = sortedItems.findIndex(
        (item) => item.id === targetItem.id,
      );

      // Calculate new order values
      let newOrder: number;
      if (draggedIndex < targetIndex) {
        // Moving down: order between target and next item
        const nextItem = sortedItems[targetIndex + 1];
        newOrder = nextItem
          ? (targetItem.order + nextItem.order) / 2
          : targetItem.order + 1;
      } else {
        // Moving up: order between previous and target item
        const prevItem = sortedItems[targetIndex - 1];
        newOrder = prevItem
          ? (prevItem.order + targetItem.order) / 2
          : targetItem.order - 1;
      }

      // Update the dragged item's order
      const response = await authenticatedFetch(
        `/api/admin/registry/${draggedItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newOrder }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update item order");
      }

      // Refresh the list to show new order
      await fetchRegistryItems();
    } catch (error) {
      console.error("Failed to reorder item:", error);
      alert("Failed to reorder item");
    } finally {
      setDraggedItem(null);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedRegistryImage(files[0]);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "claraburgess");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dxqjyqz8f/image/upload",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.secure_url;
  };

  return (
    <>
      {/* Add/Edit Registry Item Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6 dark:text-gray-900">
          {isEditing ? "Edit Registry Item" : "Add New Registry Item"}
        </h2>

        <form onSubmit={handleSubmitItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={registryForm.name}
                onChange={(e) =>
                  setRegistryForm({ ...registryForm, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                placeholder="Item name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={registryForm.category}
                onChange={(e) =>
                  setRegistryForm({ ...registryForm, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={registryForm.price}
                onChange={(e) =>
                  setRegistryForm({
                    ...registryForm,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={registryForm.quantity}
                onChange={(e) =>
                  setRegistryForm({
                    ...registryForm,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="url"
                value={registryForm.url}
                onChange={(e) =>
                  setRegistryForm({ ...registryForm, url: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                placeholder="https://..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragOver ? "border-pink-500 bg-pink-50" : "border-gray-300"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleImageDrop}
            >
              {selectedRegistryImage ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Selected: {selectedRegistryImage.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedRegistryImage(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop an image here, or click to select
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-pink-600 hover:text-pink-800 font-medium"
                  >
                    Choose file
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={registryForm.purchased}
                onChange={(e) =>
                  setRegistryForm({
                    ...registryForm,
                    purchased: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                Mark as purchased
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setRegistryForm({
                    name: "",
                    price: 0,
                    quantity: 1,
                    category: "General",
                    order: 0,
                    url: "",
                    purchased: false,
                    imageUrl: "",
                  });
                  setSelectedRegistryImage(null);
                }}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 hover:cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 disabled:opacity-50${
                !loading ? " hover:cursor-pointer" : ""
              }`}
            >
              {loading
                ? isEditing
                  ? "Updating..."
                  : "Adding..."
                : isEditing
                  ? "Update Item"
                  : "Add Item"}
            </button>
          </div>
        </form>
      </div>

      {/* Registry Items List */}
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold p-6 border-b dark:text-gray-900">
          Current Registry Items
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedItems.map((item) => (
                <tr
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item)}
                  onDragEnd={handleDragEnd}
                  className={`hover:cursor-grab ${
                    draggedItem?.id === item.id ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {item.url ? (
                          <Link href={item.url} target="_blank">
                            {item.name}
                          </Link>
                        ) : (
                          item.name
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.purchased
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.purchased ? "Purchased" : "Available"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={32}
                        height={32}
                        className="rounded object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-xs text-gray-400">No image</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-900 hover:cursor-pointer"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900 hover:cursor-pointer"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
