import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const BRANDS = ["Yamaha", "Suzuki", "KTM", "Bajaj", "HeroHonda", "Honda"];
const DOCUMENT_TYPES = ["Bike Book", "Revenue License", "Insurance", "Emmision Test"];

const AddBikeModel = ({ isOpen, onClose, refreshBikes }) => {
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("info");
  const [form, setForm] = useState({
    model: "",
    year: "",
    price: "",
    stock: "",
    mileage: "",
    engineCapacity: "",
    brand: "",
    condition: "new",
    description: "",
    ownerName: "",
    ownerContact: "",
  });
  const [documents, setDocuments] = useState([]);
  const [bikeImages, setBikeImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const renderPreview = (doc) => {
    if (!doc.file) return null;
    const url = URL.createObjectURL(doc.file);
    const ext = url.split(".").pop().toLowerCase();
    return ext === "pdf" ? (
      <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 underline">
        View PDF
      </a>
    ) : (
      <img src={url} alt={doc.type} className="w-20 h-20 object-cover rounded" />
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(form).forEach((key) => data.append(key, form[key]));

      // Add bike images
      bikeImages.forEach((img) => data.append("images", img));

      // Add documents
      documents.forEach((doc) => doc.file && data.append(doc.type, doc.file));

      await axios.post("http://localhost:5000/api/bikes", data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      refreshBikes();
      onClose();

      // Reset form
      setForm({
        model: "",
        year: "",
        price: "",
        stock: "",
        mileage: "",
        engineCapacity: "",
        brand: "",
        condition: "new",
        description: "",
        ownerName: "",
        ownerContact: "",
      });
      setBikeImages([]);
      setDocuments([]);
    } catch (err) {
      console.error(err);
      alert("Failed to add bike");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-xl max-w-3xl w-full p-6 relative overflow-auto max-h-[90vh]"
      >
        {/* Tabs */}
        <div className="flex border-b mb-4">
          {["info", "documents", "images"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium ${activeTab === tab ? "border-b-2 border-blue-500" : "text-gray-500"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="model" placeholder="Model" value={form.model} onChange={handleInputChange} className="p-2 border rounded"/>
            <input name="year" type="number" placeholder="Year" value={form.year} onChange={handleInputChange} className="p-2 border rounded"/>
            <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleInputChange} className="p-2 border rounded"/>
            <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleInputChange} className="p-2 border rounded"/>
            <input name="mileage" type="number" placeholder="Mileage" value={form.mileage} onChange={handleInputChange} className="p-2 border rounded"/>
            <input name="engineCapacity" type="number" placeholder="Engine Capacity" value={form.engineCapacity} onChange={handleInputChange} className="p-2 border rounded"/>
            <select name="brand" value={form.brand} onChange={handleInputChange} className="p-2 border rounded">
              <option value="">Select Brand</option>
              {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            <select name="condition" value={form.condition} onChange={handleInputChange} className="p-2 border rounded">
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
            <input name="ownerName" placeholder="Owner Name" value={form.ownerName} onChange={handleInputChange} className="p-2 border rounded"/>
            <input name="ownerContact" type="number" placeholder="Owner Contact" value={form.ownerContact} onChange={handleInputChange} className="p-2 border rounded"/>
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleInputChange} className="p-2 border rounded col-span-full"/>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            {DOCUMENT_TYPES.map((docType) => {
              const existingDoc = documents.find((d) => d.type === docType);
              return (
                <div key={docType} className="flex items-center gap-4">
                  <label className="w-40">{docType}</label>
                  <input type="file" onChange={(e) => {
                    if(e.target.files.length > 0){
                      const file = e.target.files[0];
                      setDocuments(prev => {
                        const others = prev.filter(d => d.type !== docType);
                        return [...others, { type: docType, file, fileName: file.name }];
                      });
                    }
                  }} className="flex-1 p-2 border rounded"/>
                  <div>{existingDoc && renderPreview(existingDoc)}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="space-y-4">
            <input type="file" multiple accept=".jpg,.jpeg,.png" onChange={(e)=> {
              const files = Array.from(e.target.files);
              setBikeImages(prev => [...prev, ...files]);
            }} className="p-2 border rounded"/>
            <div className="flex flex-wrap gap-2 mt-2">
              {bikeImages.map((file, index)=>(
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden border">
                  <img src={URL.createObjectURL(file)} alt={`bike-${index}`} className="w-full h-full object-cover"/>
                  <button type="button" onClick={()=> setBikeImages(prev => prev.filter((_, i)=> i!==index))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded" disabled={loading}>
            {loading ? "Saving..." : "Add Bike"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AddBikeModel;
