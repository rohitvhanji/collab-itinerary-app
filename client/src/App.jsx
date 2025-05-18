import { useEffect, useState } from "react";
import axios from "axios";

const inputStyle = {
  padding: "0.5rem 0.75rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "1rem",
};

const buttonStylePrimary = {
  backgroundColor: "#0070d2", // Salesforce Blue
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: "600",
  whiteSpace: "nowrap",
};

const buttonStyleSecondary = {
  backgroundColor: "#e0e6ed",
  color: "#333",
  border: "none",
  borderRadius: "4px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: "600",
  whiteSpace: "nowrap",
};

export default function App() {
  const [bills, setBills] = useState([]);
  const [homeId] = useState("home_001");
  const [utilityType, setUtilityType] = useState("");
  const [amount, setAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [editingBillId, setEditingBillId] = useState(null);

  // Fetch bills function
  async function fetchBills() {
    try {
      const res = await axios.get(
        `https://collab-itinerary-app.onrender.com/api/bills/${homeId}`
      );
      setBills(res.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  }

  useEffect(() => {
    fetchBills();
  }, [homeId]);

  // Reset inputs
  const resetInputs = () => {
    setUtilityType("");
    setAmount("");
    setBillDate("");
    setPaidBy("");
    setEditingBillId(null);
  };

  // Add or Update bill
  const addOrUpdateBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) return alert("All fields are required");

    try {
      if (editingBillId) {
        // update bill
        await axios.put(
          `https://collab-itinerary-app.onrender.com/api/bills/${editingBillId}`,
          {
            utility_type: utilityType,
            amount: parseFloat(amount),
            bill_date: billDate,
            added_by: paidBy,
          }
        );
      } else {
        // add new bill
        await axios.post("https://collab-itinerary-app.onrender.com/api/bills", {
          home_id: homeId,
          utility_type: utilityType,
          amount: parseFloat(amount),
          bill_date: billDate,
          added_by: paidBy,
        });
      }
      await fetchBills();
      resetInputs();
    } catch (error) {
      console.error("Error adding/updating bill:", error);
    }
  };

  // Delete bill
  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      if (editingBillId === id) resetInputs();
      await fetchBills();
    } catch (error) {
      console.error("Error deleting bill:", error);
    }
  };

  // Start editing a bill
  const startEditBill = (bill) => {
    setEditingBillId(bill.id);
    setUtilityType(bill.utility_type);
    setAmount(bill.amount);
    setBillDate(bill.bill_date);
    setPaidBy(bill.added_by);
  };

  // Cancel edit
  const cancelEdit = () => {
    resetInputs();
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "2rem auto",
        padding: "2rem",
        backgroundColor: "#f0f8ff", // Salesforce light blue
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgb(0 0 0 / 0.1)",
        minHeight: "600px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          color: "#0070d2",
          marginBottom: "2rem",
          fontWeight: "700",
        }}
      >
        Spendly — Utility Bill Tracker
      </h1>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "2rem",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="Utility Type"
          value={utilityType}
          onChange={(e) => setUtilityType(e.target.value)}
          style={{ ...inputStyle, flex: "1 1 150px", minWidth: "140px" }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ ...inputStyle, flex: "1 1 100px", minWidth: "90px" }}
        />
        <input
          type="date"
          placeholder="Bill Date"
          value={billDate}
          onChange={(e) => setBillDate(e.target.value)}
          style={{ ...inputStyle, flex: "1 1 140px", minWidth: "130px" }}
        />
        <input
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          style={{ ...inputStyle, flex: "1 1 140px", minWidth: "130px" }}
        />

        <button onClick={addOrUpdateBill} style={buttonStylePrimary}>
          {editingBillId ? "Update Bill" : "Add Bill"}
        </button>

        {editingBillId && (
          <button onClick={cancelEdit} style={buttonStyleSecondary}>
            Cancel
          </button>
        )}
      </div>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          maxHeight: "350px",
          overflowY: "auto",
        }}
      >
        {bills.length === 0 && (
          <li
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            No bills found.
          </li>
        )}

        {bills.map((bill) => (
          <li
            key={bill.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #ddd",
              padding: "0.5rem 0",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: "1 1 60%",
                minWidth: "220px",
                fontSize: "1rem",
                fontWeight: "600",
                color: "#333",
              }}
            >
              {bill.utility_type} - ₹{bill.amount.toFixed(2)} -{" "}
              {new Date(bill.bill_date).toLocaleDateString()} - Paid by: {bill.added_by}
            </div>
            <div
              style={{
                flex: "1 1 35%",
                minWidth: "200px",
                display: "flex",
                gap: "0.5rem",
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => startEditBill(bill)}
                style={{ ...buttonStylePrimary, flex: "1 1 90px" }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteBill(bill.id)}
                style={{ ...buttonStyleSecondary, flex: "1 1 90px" }}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
