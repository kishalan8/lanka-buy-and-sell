import { useState } from "react";
import { motion } from "framer-motion";

const ViewBikeModel = ({ isOpen, onClose, bike }) => {
  const [activeTab, setActiveTab] = useState("info");

  if (!isOpen || !bike) return null;

  const renderDocumentPreview = (doc) => {
    if (!doc.fileUrl) return null;
    const ext = doc.fileUrl.split(".").pop().toLowerCase();
    return ext === "pdf" ? (
      <a
        href={doc.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="text-blue-500 underline"
      >
        {doc.type} (PDF)
      </a>
    ) : (
      <img
        src={doc.fileUrl}
        alt={doc.type}
        className="w-32 h-32 object-cover rounded border"
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <motion.div
        className="bg-white rounded-xl max-w-4xl w-full p-6 relative overflow-auto max-h-[90vh]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Tabs */}
        <div className="flex border-b mb-4">
          {["info", "documents", "images"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <strong>Model:</strong> {bike.model}
            </div>
            <div>
              <strong>Year:</strong> {bike.year}
            </div>
            <div>
              <strong>Brand:</strong> {bike.brand}
            </div>
            <div>
              <strong>Condition:</strong> {bike.condition}
            </div>
            <div>
              <strong>Price:</strong> ${bike.price}
            </div>
            <div>
              <strong>Stock:</strong> {bike.stock}
            </div>
            <div>
              <strong>Mileage:</strong> {bike.mileage}
            </div>
            <div>
              <strong>Engine Capacity:</strong> {bike.engineCapacity} cc
            </div>
            <div>
              <strong>Owner Name:</strong> {bike.ownerName}
            </div>
            <div>
              <strong>Owner Contact:</strong> {bike.ownerContact}
            </div>
            <div className="col-span-full">
              <strong>Description:</strong> {bike.description}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="flex flex-wrap gap-4 mb-6">
            {bike.documents?.length ? (
              bike.documents.map((doc, index) => (
                <div key={index} className="flex flex-col items-center">
                  {renderDocumentPreview(doc)}
                  <span className="mt-1 text-sm">{doc.type}</span>
                </div>
              ))
            ) : (
              <p>No documents uploaded.</p>
            )}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="flex flex-wrap gap-4">
            {bike.images?.length ? (
              bike.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`bike-${index}`}
                  className="w-32 h-32 object-cover rounded border"
                />
              ))
            ) : (
              <p>No images uploaded.</p>
            )}
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewBikeModel;
