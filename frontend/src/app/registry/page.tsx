"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import ProtectedRoute from "@components/ProtectedRoute";
import { RegistryItem } from "@types";
import { formatPrice } from "@utils/priceFormat";
import { FaTimes, FaSearch } from "react-icons/fa";

type PurchaseModalData = {
  hasPurchased: boolean;
  giftType: "purchased" | "similar" | "none";
  isAnonymous: boolean;
  purchaseLocation: string;
  orderNumber: string;
  thankYouAddress: string;
  similarItemDescription: string;
};

const categories = [
  "All",
  "Clothing",
  "Diapering",
  "Feeding",
  "Bathing",
  "Sleeping",
  "Playing",
  "Traveling",
  "General",
];

export default function RegistryPage() {
  return (
    <ProtectedRoute>
      <RegistryContent />
    </ProtectedRoute>
  );
}

function RegistryContent() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPurchased, setShowPurchased] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);
  const [purchaseModalData, setPurchaseModalData] = useState<PurchaseModalData>(
    {
      hasPurchased: false,
      giftType: "none",
      isAnonymous: false,
      purchaseLocation: "",
      orderNumber: "",
      thankYouAddress: "",
      similarItemDescription: "",
    },
  );
  const [modalStep, setModalStep] = useState<
    "purchase-question" | "additional-info"
  >("purchase-question");

  const fetchRegistryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/registry");
      if (!response.ok) {
        throw new Error("Failed to fetch registry items");
      }
      const data = await response.json();
      setRegistryItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const togglePurchased = async (id: string) => {
    try {
      const response = await fetch(`/api/registry/${id}/toggle-purchased`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to update item");
      }
      // Refresh the data
      await fetchRegistryItems();
    } catch (err) {
      console.error("Error toggling purchased status:", err);
    }
  };

  const handleViewItem = (item: RegistryItem, openUrl: boolean = true) => {
    // Open the item URL immediately in a new tab
    if (item.url && openUrl) {
      window.open(item.url, "_blank");
    }

    // Show the purchase question modal
    setSelectedItem(item);
    setShowModal(true);
    setModalStep("purchase-question");
    setPurchaseModalData({
      hasPurchased: false,
      giftType: "none",
      isAnonymous: false,
      purchaseLocation: "",
      orderNumber: "",
      thankYouAddress: "",
      similarItemDescription: "",
    });
  };

  const handlePurchaseQuestion = (
    giftType: "purchased" | "similar" | "none",
  ) => {
    setPurchaseModalData((prev) => ({
      ...prev,
      hasPurchased: giftType !== "none",
      giftType: giftType,
    }));

    if (giftType !== "none") {
      setModalStep("additional-info");
    } else {
      // If not gifting, just close modal
      setShowModal(false);
      setSelectedItem(null);
    }
  };

  const handleSubmitPurchaseInfo = async () => {
    try {
      // Here you would typically send the purchase information to your backend
      console.log("Purchase info submitted:", {
        itemId: selectedItem?.id,
        itemName: selectedItem?.name,
        ...purchaseModalData,
      });

      // Mark item as purchased if it (or a similar item) was gifted
      if (selectedItem && purchaseModalData.giftType !== "none") {
        await togglePurchased(selectedItem.id);
      }

      // Close modal
      setShowModal(false);
      setSelectedItem(null);

      // Show success message or redirect to thank you page
      alert("Thank you for your gift! We'll send you a thank you card.");
    } catch (err) {
      console.error("Error submitting purchase info:", err);
      alert(
        "There was an error submitting your information. Please try again.",
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalStep("purchase-question");
  };

  // Search and filter items
  const searchAndFilterItems = (items: RegistryItem[]): RegistryItem[] => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      // Purchased filter
      if (!showPurchased && item.purchased) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);

        if (!matchesName && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  };

  // Sort items by order (ascending)
  const sortItems = (items: RegistryItem[]): RegistryItem[] => {
    return [...items].sort((a, b) => a.order - b.order);
  };

  const filteredItems = sortItems(searchAndFilterItems(registryItems));

  const totalItems = registryItems.length;
  const purchasedItems = registryItems.filter((item) => item.purchased).length;
  const remainingItems = totalItems - purchasedItems;

  useEffect(() => {
    fetchRegistryItems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registry items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-2">
          Oops! Something went wrong
        </div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={fetchRegistryItems}
          className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-16">
        {/* Main Card Surface */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
          {/* Subtle Background Pattern - Full Height */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-blue-50/30 pointer-events-none"></div>

          <div className="relative">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 dark:text-gray-800">
                Clara&apos;s Registry
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Thank you for helping us prepare for our little one&apos;s
                arrival!
              </p>

              {/* Registry Stats */}
              <div className="grid grid-cols-3 gap-4 md:gap-8 mb-8 max-w-2xl mx-auto">
                <div className="bg-blue-50 p-3 md:p-4 rounded-lg text-center">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">
                    {totalItems}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Total Items
                  </div>
                </div>
                <div className="bg-green-50 p-3 md:p-4 rounded-lg text-center">
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    {purchasedItems}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Purchased
                  </div>
                </div>
                <div className="bg-orange-50 p-3 md:p-4 rounded-lg text-center">
                  <div className="text-xl md:text-2xl font-bold text-orange-600">
                    {remainingItems}
                  </div>
                  <div className="text-xs md:text-sm text-gray-600">
                    Remaining
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="max-w-md mx-auto mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:text-gray-900 text-sm sm:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FaTimes className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </button>
                  )}
                </div>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Category Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none pr-10 cursor-pointer"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Show Purchased Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPurchased}
                      onChange={(e) => setShowPurchased(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm dark:text-gray-800">
                      Show purchased items
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Registry Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleViewItem(item)}
                  className={`border rounded-lg md:p-6 transition-all hover:shadow-lg cursor-pointer h-24 md:h-auto ${
                    item.purchased
                      ? "bg-gray-50 border-gray-200 opacity-75"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Landscape Layout: Image Left, Content Right */}
                  <div className="flex gap-4">
                    {/* Image - Left 1/3 */}
                    {item.imageUrl ? (
                      <div className="flex-shrink-0 w-1/3 relative">
                        <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            unoptimized={false}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          />
                        </div>
                        {/* Purchased Badge - Overlay on image */}
                        {item.purchased && (
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-lg">
                              Purchased
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-1/3 relative">
                        <div className="w-full aspect-square rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            No image
                          </span>
                        </div>
                        {/* Purchased Badge - Overlay on placeholder */}
                        {item.purchased && (
                          <div className="absolute top-2 right-2">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-lg">
                              Purchased
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content - Right 2/3 */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {/* Top Right: Title */}
                      <div className="mb-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-800 flex-1 line-clamp-1">
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      {/* Bottom Right: Price, Category */}
                      <div className="space-y-1">
                        {/* Price and Quantity */}
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-pink-600">
                            {formatPrice(item.price)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-xs text-gray-500">
                              × {item.quantity}
                            </span>
                          )}
                        </div>

                        {/* Category */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery
                    ? `No items found matching "${searchQuery}"`
                    : "No items found matching your criteria."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 text-sm text-pink-600 hover:text-pink-700 underline"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && selectedItem && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-20 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedItem.name}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-xl hover:cursor-pointer"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              {modalStep === "purchase-question" && (
                <div>
                  <p className="text-gray-600 mb-6">
                    What would you like to do with this item?
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePurchaseQuestion("purchased")}
                      className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors text-left"
                    >
                      <div className="font-medium">
                        I purchased this exact item
                      </div>
                      <div className="text-sm opacity-90">
                        New from the registry
                      </div>
                    </button>
                    <button
                      onClick={() => handlePurchaseQuestion("similar")}
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors text-left"
                    >
                      <div className="font-medium">
                        I&apos;m gifting something similar/pre-owned
                      </div>
                      <div className="text-sm opacity-90">
                        Different item or used version
                      </div>
                    </button>
                    <button
                      onClick={() => handlePurchaseQuestion("none")}
                      className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors text-left"
                    >
                      <div className="font-medium">
                        Just viewing, not gifting
                      </div>
                      <div className="text-sm opacity-90">Close this modal</div>
                    </button>
                  </div>
                </div>
              )}

              {modalStep === "additional-info" && (
                <div>
                  <p className="text-gray-600 mb-6">
                    Great! Please provide some additional information about your
                    purchase.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={purchaseModalData.isAnonymous}
                          onChange={(e) =>
                            setPurchaseModalData({
                              ...purchaseModalData,
                              isAnonymous: e.target.checked,
                            })
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">
                          Do you want this to be an anonymous gift?
                        </span>
                      </label>
                    </div>

                    {purchaseModalData.giftType === "similar" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Please describe the item you&apos;re gifting
                        </label>
                        <textarea
                          value={purchaseModalData.similarItemDescription}
                          onChange={(e) =>
                            setPurchaseModalData({
                              ...purchaseModalData,
                              similarItemDescription: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                          placeholder="Describe the item, brand, condition, etc."
                          rows={3}
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Where did you purchase this item?
                      </label>
                      <input
                        type="text"
                        value={purchaseModalData.purchaseLocation}
                        onChange={(e) =>
                          setPurchaseModalData({
                            ...purchaseModalData,
                            purchaseLocation: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                        placeholder="e.g., Amazon, Target, Local Store"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order number or receipt (optional)
                      </label>
                      <input
                        type="text"
                        value={purchaseModalData.orderNumber}
                        onChange={(e) =>
                          setPurchaseModalData({
                            ...purchaseModalData,
                            orderNumber: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                        placeholder="Order number, receipt number, or N/A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address for &ldquo;Thank You&rdquo; card (optional)
                      </label>
                      <textarea
                        value={purchaseModalData.thankYouAddress}
                        onChange={(e) =>
                          setPurchaseModalData({
                            ...purchaseModalData,
                            thankYouAddress: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 dark:text-gray-900"
                        placeholder="Your full address"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setModalStep("purchase-question")}
                      className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitPurchaseInfo}
                      className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
