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

  const resetInputs = () => {
    setUtilityType("");
    setAmount("");
    setBillDate("");
    setPaidBy("");
    setEditingBillId(null);
  };

  const addOrUpdateBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy) return alert("All fields are required");

    try {
      if (editingBillId) {
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

  const startEditBill = (bill) => {
    setEditingBillId(bill.id);
    setUtilityType(bill.utility_type);
    setAmount(bill.amount);
    setBillDate(bill.bill_date);
    setPaidBy(bill.added_by);
  };

  const cancelEdit = () => {
    resetInputs();
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "2rem auto",
        padding: "2rem",
        backgroundColor: "#f0f8ff",
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

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 180px",
            gap: "0.5rem",
            padding: "0.5rem 0",
            fontWeight: "bold",
            borderBottom: "2px solid #ccc",
            backgroundColor: "#f7f9fb",
            textAlign: "left",
          }}
        >
          <div>Utility Type</div>
          <div>Amount</div>
          <div>Bill Date</div>
          <div>Paid By</div>
          <div>Actions</div>
        </div>

        {bills.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "#666",
              fontStyle: "italic",
            }}
          >
            No bills found.
          </div>
        )}

        {bills.map((bill) => (
          <div
            key={bill.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 180px",
              gap: "0.5rem",
              alignItems: "center",
              padding: "0.5rem 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div>{bill.utility_type}</div>
            <div>₹{bill.amount.toFixed(2)}</div>
            <div>{new Date(bill.bill_date).toLocaleDateString()}</div>
            <div>{bill.added_by}</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                onClick={() => startEditBill(bill)}
                style={{ ...buttonStylePrimary, flex: "1 1 80px" }}
              >
                Edit
              </button>
              <button
                onClick={() => deleteBill(bill.id)}
                style={{ ...buttonStyleSecondary, flex: "1 1 80px" }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
