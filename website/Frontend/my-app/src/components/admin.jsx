import React, { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils/utils";

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/userDetails`);
                setUsers(res.data);
            } catch (err) {
                setError("Failed to fetch user details");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div style={{ background: "#f2f6fa", minHeight: "100vh", padding: "40px 0" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 24px rgba(60,72,88,0.12)", padding: "32px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "32px", color: "#2563eb", fontWeight: 700, fontSize: "2.2rem" }}>User Requests</h2>
                {loading ? (
                    <p style={{ textAlign: "center" }}>Loading...</p>
                ) : error ? (
                    <p style={{ color: "red", textAlign: "center" }}>{error}</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1rem" }}>
                            <thead>
                                <tr style={{ background: "#e0e7ff" }}>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Phone</th>
                                    <th style={thStyle}>Address</th>
                                    <th style={thStyle}>Scrap Items</th>
                                    <th style={thStyle}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr><td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>No requests found.</td></tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user._id} style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                                            <td style={tdStyle}>{user.name}</td>
                                            <td style={tdStyle}>{user.email}</td>
                                            <td style={tdStyle}>{user.phone}</td>
                                            <td style={tdStyle}>{user.address}</td>
                                            <td style={tdStyle}>
                                                {user.requestedScrap && user.requestedScrap.length > 0 ? (
                                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem", background: "#eef2ff" }}>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ padding: "6px", fontWeight: 600 }}>Category</th>
                                                                <th style={{ padding: "6px", fontWeight: 600 }}>Type</th>
                                                                <th style={{ padding: "6px", fontWeight: 600 }}>Price(per KG)</th>
                                                                <th style={{ padding: "6px", fontWeight: 600 }}>Quantity</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {user.requestedScrap.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    <td style={{ padding: "6px" }}>{item.category}</td>
                                                                    <td style={{ padding: "6px" }}>{item.type}</td>
                                                                    <td style={{ padding: "6px" }}>₹{item.price}</td>
                                                                    <td style={{ padding: "6px" }}>{item.quantity}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : "-"}
                                            </td>
                                            <td style={tdStyle}>{user.date ? new Date(user.date).toLocaleString() : "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const thStyle = {
    padding: "14px 10px",
    fontWeight: 600,
    color: "#374151",
    borderBottom: "2px solid #c7d2fe",
    textAlign: "left"
};

const tdStyle = {
    padding: "12px 10px",
    color: "#374151",
    textAlign: "left"
};

export default Admin;
