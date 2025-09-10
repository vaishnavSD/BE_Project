import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils/utils";

const initialState = {
    name: "",
    email: "",
    phone: "",
    address: "",
    quantity: 1,
    selectedScrapTypes: [],
};

const Request = () => {
    const [form, setForm] = useState(initialState);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrapDetails, setScrapDetails] = useState([]);
    const [scrapLoading, setScrapLoading] = useState(true);
    const [scrapError, setScrapError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/userDetails`);
                setRequests(res.data);
            } catch (err) {
                setError("Failed to load requests");
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
        const fetchScrapDetails = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/scrapDetails/get`);
                setScrapDetails(response.data);
            } catch (error) {
                setScrapError("Failed to load scrap details");
            } finally {
                setScrapLoading(false);
            }
        };
        fetchScrapDetails();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === "selectedScrapTypes") {
            let updatedTypes = [...form.selectedScrapTypes];
            if (checked) {
                updatedTypes.push(value);
            } else {
                updatedTypes = updatedTypes.filter(t => t !== value);
            }
            setForm({ ...form, selectedScrapTypes: updatedTypes });
        } else if (name === "quantity") {
            setForm({ ...form, quantity: Number(value) });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Build requestedScrap array from selected types and quantities
        const requestedScrap = scrapDetails
            .filter(detail => form.selectedScrapTypes.includes(detail.type))
            .map(detail => ({
                category: detail.category,
                type: detail.type,
                price: detail.price,
                quantity: form[`quantity_${detail.type}`] || 1
            }));

        const payload = {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            requestedScrap
        };

        try {
            const res = await axios.post(`${BACKEND_URL}/userDetails/add`, payload);
            console.log("Server Response:", res.data);
            alert("Request submitted successfully!");
            setForm(initialState);
        } catch (error) {
            console.error("Error submitting request:", error);
            alert("Failed to submit request");
        }
    };

    return (
        <div style={{ backgroundColor: "#f2f2f2", minHeight: "100vh", padding: "40px 0" }}>
            <div style={{ width: '80%', maxWidth: '1200px', margin: '0 auto', padding: '32px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', animation: 'fadeIn 0.4s ease-in-out' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px', color: '#333', fontWeight: '600' }}>Request Form</h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>{renderInput('Name', 'text', 'name', form.name, handleChange)}</div>
                        <div style={{ flex: 1 }}>{renderInput('Email', 'email', 'email', form.email, handleChange)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                        <div style={{ flex: 1 }}>{renderInput('Phone', 'number', 'phone', form.phone, handleChange)}</div>
                        <div style={{ flex: 1 }}>{renderInput('Address', 'text', 'address', form.address, handleChange)}</div>
                    </div>

                    <h2 style={{ textAlign: 'center', margin: '32px 0 16px', color: '#2563eb', fontWeight: 700, fontSize: '1.5rem' }}>Scrap Details</h2>
                    <div style={{ width: '50%', minWidth: '320px', maxWidth: '700px', overflowX: 'auto', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', padding: '16px', margin: '0 auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem', margin: '0 auto' }}>
                            <thead>
                                <tr style={{ background: '#e0e7ff' }}>
                                    <th style={thStyle}>Category</th>
                                    <th style={thStyle}>Type</th>
                                    <th style={thStyle}>Price(per KG)</th>
                                    <th style={thStyle}>Request</th>
                                    <th style={thStyle}>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scrapLoading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading...</td></tr>
                                ) : scrapError ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'red', padding: '24px' }}>{scrapError}</td></tr>
                                ) : scrapDetails.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No scrap details found.</td></tr>
                                ) : (
                                    scrapDetails.map(detail => (
                                        <tr key={detail._id} style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                            <td style={tdStyle}>{detail.category}</td>
                                            <td style={tdStyle}>{detail.type}</td>
                                            <td style={tdStyle}>₹{detail.price}</td>
                                            <td style={tdStyle}>
                                                <input
                                                    type="checkbox"
                                                    name="selectedScrapTypes"
                                                    value={detail.type}
                                                    checked={form.selectedScrapTypes.includes(detail.type)}
                                                    onChange={handleChange}
                                                />
                                            </td>
                                            <td style={tdStyle}>
                                                <input
                                                    type="number"
                                                    name={`quantity_${detail.type}`}
                                                    min="1"
                                                    value={form[`quantity_${detail.type}`] || 1}
                                                    onChange={e => setForm({
                                                        ...form,
                                                        [`quantity_${detail.type}`]: Number(e.target.value)
                                                    })}
                                                    style={{ ...inputStyle, width: '70px' }}
                                                    disabled={!form.selectedScrapTypes.includes(detail.type)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            marginTop: '16px',
                            transition: 'background 0.3s ease'
                        }}
                        onMouseOver={e => e.target.style.background = '#0056b3'}
                        onMouseOut={e => e.target.style.background = '#007bff'}
                    >
                        Submit
                    </button>
                </form>

            </div>
        </div>
    )
}

// Table header and cell styles
const thStyle = {
    padding: '12px 8px',
    fontWeight: 600,
    color: '#374151',
    borderBottom: '2px solid #c7d2fe',
    textAlign: 'left',
};

const tdStyle = {
    padding: '10px 8px',
    color: '#374151',
    textAlign: 'left',
};

const renderInput = (label, type, name, value, onChange, extraProps = {}) => (
    <label style={{ display: "block", marginBottom: "8px", color: "#555" }}>
        {label}
        <input
            type={type}
            name={name}
            required
            value={value}
            onChange={onChange}
            style={inputStyle}
            {...extraProps}
        />
    </label>
);

const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "4px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border 0.2s ease, box-shadow 0.2s ease",
};

export default Request;
