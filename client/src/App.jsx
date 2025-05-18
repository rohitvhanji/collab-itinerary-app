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
    if (!utilityType || !amount || !billDate || !paidBy) {
      alert("All fields are required");
      return;
    }

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
      alert("Failed to save bill. See console for details.");
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
      alert("Failed to delete bill. See console for details.");
    }
  };

  const startEditBill = (bill) => {
    setEditingBillId(bill.id);
    setUtilityType(bill.utility_type);
    setAmount(bill.amount.toString());
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

  // New: Expense by person for CURRENT MONTH sorted descending
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11
  const currentYear = currentDate.getFullYear();

  const expenseCurrentMonthByPerson = bills
    .filter(bill => {
      const d = new Date(bill.bill_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, bill) => {
      acc[bill.added_by] = (acc[bill.added_by] || 0) + bill.amount;
      return acc;
    }, {});

  // Sort by descending amount
  const sortedExpenseCurrentMonthByPerson = Object.entries(expenseCurrentMonthByPerson)
    .sort(([, amtA], [, amtB]) => amtB - amtA);

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
        {bills.length === 0 && (
          <div style={{ padding: "1rem", textAlign: "center", color: "#777" }}>
            No bills to show
          </div>
        )}
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
        <div style={{ flex: "1 1 300px", background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3>Expense by Person</h3>
          {Object.keys(expenseByPerson).length === 0 ? (
            <p>No data</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(expenseByPerson).map(([person, amount]) => (
                  <tr key={person}>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.25rem 0" }}>{person}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.25rem 0", textAlign: "right" }}>
                      ₹{amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Expense by Type */}
        <div style={{ flex: "1 1 300px", background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3>Expense by Type</h3>
          {Object.keys(expenseByType).length === 0 ? (
            <p>No data</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(expenseByType).map(([type, amount]) => (
                  <tr key={type}>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.25rem 0" }}>{type}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.25rem 0", textAlign: "right" }}>
                      ₹{amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Expense by Month */}
        <div style={{ flex: "1 1 300px", background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3>Expense by Month</h3>
          {Object.keys(expenseByMonth).length === 0 ? (
            <p>No data</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {Object.entries(expenseByMonth).map(([month, amount]) => (
                  <tr key={month}>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.25rem 0" }}>{month}</td>
                    <td style={{ borderBottom: "1px solid #eee", padding: "0.25rem 0", textAlign: "right" }}>
                      ₹{amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* NEW Analytics: Expense by Person for Current Month */}
      <div
        style={{
          marginTop: "3rem",
          background: "white",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h3>Expense by Person — Current Month ({currentDate.toLocaleString("default", { month: "long", year: "numeric" })})</h3>
        {sortedExpenseCurrentMonthByPerson.length === 0 ? (
          <p>No expenses recorded for the current month.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #0070d2" }}>
                <th style={{ textAlign: "left", padding: "0.5rem 0" }}>Person</th>
                <th style={{ textAlign: "right", padding: "0.5rem 0" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenseCurrentMonthByPerson.map(([person, amount]) => (
                <tr key={person}>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.25rem 0" }}>{person}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: "0.25rem 0", textAlign: "right" }}>
                    ₹{amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
