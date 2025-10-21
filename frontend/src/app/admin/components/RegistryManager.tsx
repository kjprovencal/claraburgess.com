"use client";

import React, { useState, useEffect } from "react";
import { formatPrice } from "@utils/priceFormat";
import { authenticatedFetch } from "@utils/auth";
import { RegistryItem } from "@types";
import { FaEdit, FaTrash, FaMagic, FaSpinner } from "react-icons/fa";
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

// Helper function to safely update form fields with scraped data
const updateFieldIfValid = (
  scrapedValue: string | undefined,
  currentValue: string
): string => {
  return scrapedValue && scrapedValue.trim() ? scrapedValue : currentValue;
};

// Helper function for price field (number type)
const updatePriceIfValid = (
  scrapedValue: number | undefined,
  currentValue: number | undefined
): number | undefined => {
  return scrapedValue !== undefined && scrapedValue !== null
    ? scrapedValue
    : currentValue;
};

// Comprehensive helper function for updating form fields with scraped data
const updateFormWithScrapedData = (
  scrapedData: RegistryItem,
  prevForm: RegistryForm,
  url: string
): RegistryForm => ({
  ...prevForm,
  url: url,
  name: updateFieldIfValid(scrapedData.name, prevForm.name || ""),
  description: updateFieldIfValid(
    scrapedData.description,
    prevForm.description || ""
  ),
  imageUrl: updateFieldIfValid(scrapedData.imageUrl, prevForm.imageUrl || ""),
  siteName: updateFieldIfValid(scrapedData.siteName, prevForm.siteName || ""),
  price: updatePriceIfValid(scrapedData.price, prevForm.price),
  availability: updateFieldIfValid(
    scrapedData.availability,
    prevForm.availability || ""
  ),
});

export default function RegistryManager() {
  const [registryForm, setRegistryForm] = useState<RegistryForm>({
    name: "",
    quantity: 1,
    category: "General",
    order: 0,
    url: "",
    purchased: false,
    purchasedQuantity: 0,
  });
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrapingUrl, setScrapingUrl] = useState(false);

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

  const scrapeUrl = async (url: string) => {
    if (!url) return;

    setScrapingUrl(true);
    try {
      const response = await fetch("/api/admin/registry/scrape-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          name: registryForm.name,
          imageUrl: registryForm.imageUrl,
          description: registryForm.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to scrape URL");
      }

      const scrapedData = await response.json();

      // Update form with scraped data, preserving existing values where appropriate
      setRegistryForm((prev) =>
        updateFormWithScrapedData(scrapedData, prev, url)
      );
    } catch (error) {
      console.error("Error scraping URL:", error);
      alert(error instanceof Error ? error.message : "Failed to scrape URL");
    } finally {
      setScrapingUrl(false);
    }
  };

  // Always sort by order
  const sortedItems = [...registryItems].sort((a, b) => a.order - b.order);

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authenticatedFetch(
        isEditing
          ? `/api/admin/registry/${registryForm.id}`
          : "/api/admin/registry",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registryForm),
        }
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
        quantity: 1,
        category: "General",
        order: 0,
        url: "",
        imageUrl: "",
        title: "",
        description: "",
        siteName: "",
        price: undefined,
        availability: "",
        purchased: false,
        purchasedQuantity: 0,
      });
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
      quantity: item.quantity,
      category: item.category,
      order: item.order,
      url: item.url || "",
      imageUrl: item.imageUrl || "",
      title: item.title || "",
      description: item.description || "",
      siteName: item.siteName || "",
      price: item.price,
      availability: item.availability || "",
      purchased: item.purchased,
      purchasedQuantity: item.purchasedQuantity,
    });
    setIsEditing(true);
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

  const handleDragStart = (e: React.DragEvent, item: RegistryItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetItem: RegistryItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;

    try {
      // Get current order of items
      const sortedItems = [...registryItems].sort((a, b) => a.order - b.order);
      const draggedIndex = sortedItems.findIndex(
        (item) => item.id === draggedItem.id
      );
      const targetIndex = sortedItems.findIndex(
        (item) => item.id === targetItem.id
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
        }
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

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <>
      {/* Add/Edit Registry Item Form */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 dark:text-gray-900">
          {isEditing ? "Edit Registry Item" : "Add New Registry Item"}
        </h2>

        <form onSubmit={handleSubmitItem} className="space-y-4">
          {/* URL Input with Scraping */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={registryForm.url}
                onChange={(e) =>
                  setRegistryForm({ ...registryForm, url: e.target.value })
                }
                onBlur={(e) => {
                  if (e.target.value && e.target.value !== registryForm.url) {
                    scrapeUrl(e.target.value);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                placeholder="https://amazon.com/product..."
              />
              <button
                type="button"
                onClick={() => registryForm.url && scrapeUrl(registryForm.url)}
                disabled={!registryForm.url || scrapingUrl}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[42px]"
              >
                {scrapingUrl ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaMagic />
                )}
                <span className="hidden sm:inline">
                  {scrapingUrl ? "Scraping..." : "Scrape"}
                </span>
                <span className="sm:hidden">{scrapingUrl ? "..." : "Go"}</span>
              </button>
            </div>
          </div>

          {/* Scraped Data Preview */}
          {(registryForm.title ||
            registryForm.description ||
            registryForm.imageUrl) && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Scraped Data Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registryForm.imageUrl && (
                  <div className="md:col-span-2">
                    <img
                      src={registryForm.imageUrl}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                {registryForm.title && (
                  <div>
                    <span className="text-xs text-gray-500">Title:</span>
                    <p className="text-sm font-medium">{registryForm.title}</p>
                  </div>
                )}
                {registryForm.siteName && (
                  <div>
                    <span className="text-xs text-gray-500">Site:</span>
                    <p className="text-sm">{registryForm.siteName}</p>
                  </div>
                )}
                {registryForm.price && (
                  <div>
                    <span className="text-xs text-gray-500">Price:</span>
                    <p className="text-sm font-medium text-green-600">
                      {formatPrice(registryForm.price)}
                    </p>
                  </div>
                )}
                {registryForm.availability && (
                  <div>
                    <span className="text-xs text-gray-500">Availability:</span>
                    <p className="text-sm">{registryForm.availability}</p>
                  </div>
                )}
              </div>
              {registryForm.description && (
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Description:</span>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {registryForm.description}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
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
                Price
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={registryForm.price || ""}
                onChange={(e) =>
                  setRegistryForm({
                    ...registryForm,
                    price: parseFloat(e.target.value) || undefined,
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

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                value={registryForm.imageUrl || ""}
                onChange={(e) =>
                  setRegistryForm({ ...registryForm, imageUrl: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                placeholder="https://..."
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={registryForm.description || ""}
                onChange={(e) =>
                  setRegistryForm({
                    ...registryForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                placeholder="Product description"
                rows={3}
              />
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

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setRegistryForm({
                    name: "",
                    quantity: 1,
                    category: "General",
                    order: 0,
                    url: "",
                    imageUrl: "",
                    title: "",
                    description: "",
                    siteName: "",
                    price: undefined,
                    availability: "",
                    purchased: false,
                    purchasedQuantity: 0,
                  });
                }}
                className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 hover:cursor-pointer min-h-[48px]"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 disabled:opacity-50 min-h-[48px]${
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
        <h2 className="text-lg sm:text-xl font-semibold p-4 sm:p-6 border-b dark:text-gray-900">
          Current Registry Items
        </h2>

        {/* Mobile Card Layout */}
        <div className="block sm:hidden">
          <div className="divide-y divide-gray-200">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item)}
                onDragEnd={handleDragEnd}
                className={`p-4 hover:cursor-grab ${
                  draggedItem?.id === item.id ? "opacity-50" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.url ? (
                        <Link
                          href={item.url}
                          target="_blank"
                          className="hover:text-blue-600"
                        >
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.category}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Qty:</span>
                    <span className="ml-1 font-medium">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Price:</span>
                    <span className="ml-1 font-medium">
                      {item.price ? formatPrice(item.price) : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.purchased
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.purchased ? "Purchased" : "Available"}
                  </span>
                  {item.url && (
                    <Link
                      href={item.url}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 text-xs underline truncate max-w-[120px]"
                    >
                      View Product
                    </Link>
                  )}
                </div>

                {/* Purchaser Information */}
                {item.purchases && item.purchases.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="font-medium mb-1">Purchased by:</div>
                    {item.purchases.slice(0, 2).map((purchase) => (
                      <div key={purchase.id} className="mb-1">
                        {purchase.buyerName ? (
                          <span className="font-medium">
                            {purchase.buyerName}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">Anonymous</span>
                        )}
                        {purchase.quantity > 1 && (
                          <span className="text-gray-500"> (×{purchase.quantity})</span>
                        )}
                      </div>
                    ))}
                    {item.purchases.length > 2 && (
                      <div className="text-gray-500">
                        +{item.purchases.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden sm:block overflow-x-auto">
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
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchased By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
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
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.price ? formatPrice(item.price) : "—"}
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
                    {item.purchases && item.purchases.length > 0 ? (
                      <div className="space-y-1">
                        {item.purchases.slice(0, 2).map((purchase, index) => (
                          <div key={purchase.id} className="text-xs">
                            {purchase.buyerName ? (
                              <span className="font-medium">
                                {purchase.buyerName}
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">Anonymous</span>
                            )}
                            {purchase.quantity > 1 && (
                              <span className="text-gray-500"> (×{purchase.quantity})</span>
                            )}
                          </div>
                        ))}
                        {item.purchases.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{item.purchases.length - 2} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.url ? (
                      <Link
                        href={item.url}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800 underline truncate block max-w-xs"
                      >
                        {item.url}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">No URL</span>
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
