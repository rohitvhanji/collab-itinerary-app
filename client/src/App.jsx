import { useEffect, useState } from "react";
import axios from "axios";

const inputStyle = {
  padding: "0.5rem 0.75rem",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "1rem",
};

const buttonStylePrimary = {
  backgroundColor: "#0070d2",
  color: "white",
  border: "none",
  borderRadius: "4px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: "600",
};

const buttonStyleSecondary = {
  backgroundColor: "#e0e6ed",
  color: "#333",
  border: "none",
  borderRadius: "4px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: "600",
};

export default function App() {
  const [bills, setBills] = useState([]);
  const [homeId] = useState("home_001");
  const [utilityType, setUtilityType] = useState("");
  const [amount, setAmount] = useState("");
  const [billDate, setBillDate] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [editingBillId, setEditingBillId] = useState(null);

  useEffect(() => {
    fetchBills();
  }, []);

  async function fetchBills() {
    try {
      const res = await axios.get(`https://collab-itinerary-app.onrender.com/api/bills/${homeId}`);
      setBills(res.data);
    } catch (error) {
      console.error("Error fetching bills:", error);
    }
  }

  const resetInputs = () => {
    setUtilityType("");
    setAmount("");
    setBillDate("");
    setPaidBy("");
    setEditingBillId(null);
  };

  const addOrUpdateBill = async () => {
    if (!utilityType || !amount || !billDate || !paidBy)
      return alert("All fields are required");

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
        await axios.post(`https://collab-itinerary-app.onrender.com/api/bills`, {
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
      console.error("Error saving bill:", error);
    }
  };

  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`https://collab-itinerary-app.onrender.com/api/bills/${id}`);
      if (editingBillId === id) resetInputs();
      await fetchBills();
    } catch (error) {
      console.error("Error deleting expense:", error);
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

  // Analytics data
  const expenseByPerson = bills.reduce((acc, bill) => {
    acc[bill.added_by] = (acc[bill.added_by] || 0) + bill.amount;
    return acc;
  }, {});

  const expenseByType = bills.reduce((acc, bill) => {
    acc[bill.utility_type] = (acc[bill.utility_type] || 0) + bill.amount;
    return acc;
  }, {});

  const expenseByMonth = bills.reduce((acc, bill) => {
    const date = new Date(bill.bill_date);
    const month = date.toLocaleString("default", { month: "short", year: "numeric" });
    acc[month] = (acc[month] || 0) + bill.amount;
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: "960px", margin: "2rem auto", padding: "2rem", background: "#f0f8ff", borderRadius: "12px" }}>
      <h1 style={{ textAlign: "center", color: "#0070d2" }}>Spendly — Expense Tracker</h1>

      {/* Form */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Expense Type"
          value={utilityType}
          onChange={(e) => setUtilityType(e.target.value)}
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={inputStyle}
        />
        <input
          type="date"
          value={billDate}
          onChange={(e) => setBillDate(e.target.value)}
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Paid By"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          style={inputStyle}
        />
        <button onClick={addOrUpdateBill} style={buttonStylePrimary}>
          {editingBillId ? "Update" : "Add"} Bill
        </button>
        {editingBillId && (
          <button onClick={cancelEdit} style={buttonStyleSecondary}>
            Cancel
          </button>
        )}
      </div>

      {/* Bills Table */}
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 140px",
            fontWeight: "bold",
            padding: "0.5rem",
            background: "#e8f0fe",
          }}
        >
          <div>Type</div>
          <div>Amount</div>
          <div>Date</div>
          <div>Paid By</div>
          <div>Actions</div>
        </div>
        {bills.map((bill) => (
          <div
            key={bill.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 140px",
              padding: "0.5rem",
              borderBottom: "1px solid #ccc",
            }}
          >
            <div>{bill.utility_type}</div>
            <div>₹{bill.amount.toFixed(2)}</div>
            <div>{new Date(bill.bill_date).toLocaleDateString()}</div>
            <div>{bill.added_by}</div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => startEditBill(bill)} style={buttonStylePrimary}>
                Edit
              </button>
              <button onClick={() => deleteBill(bill.id)} style={buttonStyleSecondary}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <h2 style={{ marginTop: "3rem", color: "#0070d2" }}>Analytics</h2>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {/* Expense by Person */}
        <div style={{ flex: "1 1 300px", background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 0 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#0070d2" }}>Expense by Person</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(expenseByPerson).map(([person, amt]) => (
                <tr key={person} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "0.5rem 0" }}>{person}</td>
                  <td style={{ padding: "0.5rem 0", textAlign: "right" }}>₹{amt.toFixed(2)}</td>
                </tr>
              ))}
              {!Object.keys(expenseByPerson).length && <tr><td colSpan={2} style={{textAlign:"center", padding:"1rem"}}>No data</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Expense by Type */}
        <div style={{ flex: "1 1 300px", background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 0 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#0070d2" }}>Expense by Type</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(expenseByType).map(([type, amt]) => (
                <tr key={type} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "0.5rem 0" }}>{type}</td>
                  <td style={{ padding: "0.5rem 0", textAlign: "right" }}>₹{amt.toFixed(2)}</td>
                </tr>
              ))}
              {!Object.keys(expenseByType).length && <tr><td colSpan={2} style={{textAlign:"center", padding:"1rem"}}>No data</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Expense by Month */}
        <div style={{ flex: "1 1 300px", background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 0 8px rgba(0,0,0,0.1)" }}>
          <h3 style={{ color: "#0070d2" }}>Expense by Month</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(expenseByMonth).map(([month, amt]) => (
                <tr key={month} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "0.5rem 0" }}>{month}</td>
                  <td style={{ padding: "0.5rem 0", textAlign: "right" }}>₹{amt.toFixed(2)}</td>
                </tr>
              ))}
              {!Object.keys(expenseByMonth).length && <tr><td colSpan={2} style={{textAlign:"center", padding:"1rem"}}>No data</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
