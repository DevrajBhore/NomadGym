// admin/AddGym.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axiosConfig";
import "../../styles/AddGym.css";

const AddGym = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    description: "",
    amenities: "",
    pricePerHour: "",
    capacity: "",
    contactNumber: "",
    email: "",
    latitude: "",
    longitude: "",
    images: [], // files
    previewUrls: [], // preview image URLs
    ownerEmail: "",
    ownerPhoneNumber: "",
    razorpayAccountId: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const {
      name,
      city,
      state,
      pincode,
      address,
      description,
      amenities,
      pricePerHour,
      capacity,
      contactNumber,
      email,
      latitude,
      longitude,
      images, // files
      previewUrls, // preview image URLs
      ownerEmail,
      ownerPhoneNumber,
      razorpayAccountId,
    } = formData;

    if (
      !name ||
      !city ||
      !state ||
      !pincode ||
      !address ||
      !pricePerHour ||
      !capacity ||
      !contactNumber ||
      !email ||
      !latitude ||
      !longitude ||
      !ownerEmail ||
      !ownerPhoneNumber ||
      !razorpayAccountId
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^[0-9]{10}$/.test(ownerPhoneNumber)) {
      setError("Owner Phone Number must be a 10-digit number.");
      return;
    }

    try {
      const gymForm = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "images" || key === "previewUrls") return; // skip previews

        if (key === "amenities") {
          value
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean)
            .forEach((amenity) => gymForm.append("amenities", amenity));
        } else {
          gymForm.append(key, value);
        }
      });

      // append images
      formData.images.forEach((file) => {
        gymForm.append("images", file);
      });

      const response = await API.post("/gyms/add", gymForm, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setSuccessMessage("Gym added successfully!");
        setFormData({
          name: "",
          city: "",
          state: "",
          pincode: "",
          address: "",
          description: "",
          amenities: "",
          pricePerHour: "",
          capacity: "",
          contactNumber: "",
          email: "",
          latitude: "",
          longitude: "",
          images: [],
          previewUrls: [],
          ownerEmail: "",
          ownerPhoneNumber: "",
          razorpayAccountId: "",
        });

        setTimeout(() => navigate("/admin/dashboard"), 2000);
      }
    } catch (err) {
      console.error("Add Gym error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Failed to add gym. Please try again."
      );
    }
  };

  return (
    <div className="add-gym-container">
      <form className="add-gym-form card-base" onSubmit={handleSubmit}>
        <h2>Add New Gym (Admin)</h2>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="form-group">
          <label htmlFor="ownerEmail">Gym Owner's Email:</label>
          <input
            type="email"
            id="ownerEmail"
            name="ownerEmail"
            value={formData.ownerEmail}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="ownerPhoneNumber">Owner Phone Number:</label>
          <input
            type="text"
            id="ownerPhoneNumber"
            name="ownerPhoneNumber"
            value={formData.ownerPhoneNumber}
            onChange={handleChange}
            required
            pattern="[0-9]{10}"
            placeholder="10-digit phone number"
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Gym Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="state">State:</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pincode">Pincode:</label>
          <input
            type="text"
            id="pincode"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contactNumber">Gym Contact Number:</label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Gym Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity (people):</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="latitude">Latitude:</label>
          <input
            type="text"
            id="latitude"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="longitude">Longitude:</label>
          <input
            type="text"
            id="longitude"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="input-base textarea-resize"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="amenities">Amenities (comma-separated):</label>
          <input
            type="text"
            id="amenities"
            name="amenities"
            value={formData.amenities}
            onChange={handleChange}
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="pricePerHour">Price Per Hour (₹):</label>
          <input
            type="number"
            id="pricePerHour"
            name="pricePerHour"
            value={formData.pricePerHour}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        <div className="form-group">
          <label htmlFor="images">Upload Gym Images (max 8):</label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);
              const previews = files.map((file) => URL.createObjectURL(file));

              setFormData((prev) => ({
                ...prev,
                images: files,
                previewUrls: previews,
              }));
            }}
            className="input-base"
          />
        </div>

        {formData.previewUrls.length > 0 && (
          <div
            className="image-previews"
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              flexWrap: "wrap",
            }}
          >
            {formData.previewUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`preview-${idx}`}
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            ))}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="razorpayAccountId">Razorpay Account ID:</label>
          <input
            type="text"
            id="razorpayAccountId"
            name="razorpayAccountId"
            value={formData.razorpayAccountId}
            onChange={handleChange}
            required
            placeholder="e.g., acc_xxxxxxxxxxxx"
            className="input-base"
          />
        </div>

        <button type="submit" className="add-gym-button button-primary">
          Add Gym
        </button>
      </form>
    </div>
  );
};

export default AddGym;
