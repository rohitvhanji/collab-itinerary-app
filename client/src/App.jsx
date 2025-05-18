import { useEffect, useState } from "react";
import axios from "axios";

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

  // Analytics calculations
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

  // New analytics: current month expense by person
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const expenseCurrentMonthByPerson = bills
    .filter(bill => {
      const d = new Date(bill.bill_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, bill) => {
      acc[bill.added_by] = (acc[bill.added_by] || 0) + bill.amount;
      return acc;
    }, {});

  const sortedCurrentMonthByPerson = Object.entries(expenseCurrentMonthByPerson).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ maxWidth: 960, margin: "2rem auto", padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ color: "#0070d2", textAlign: "center" }}>Spendly — Expense Tracker</h1>

      {/* Form */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <input
          placeholder="Expense Type"
          value={utilityType}
          onChange={e => setUtilityType(e.target.value)}
          style={{ padding: "0.5rem", flex: "1 1 150px" }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{ padding: "0.5rem", width: "120px" }}
        />
        <input
          type="date"
          value={billDate}
          onChange={e => setBillDate(e.target.value)}
          style={{ padding: "0.5rem", width: "160px" }}
        />
        <input
          placeholder="Paid By"
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)}
          style={{ padding: "0.5rem", flex: "1 1 150px" }}
        />
        <button
          onClick={addOrUpdateBill}
          style={{ backgroundColor: "#0070d2", color: "white", padding: "0.5rem 1rem", border: "none", cursor: "pointer" }}
        >
          {editingBillId ? "Update" : "Add"} Bill
        </button>
        {editingBillId && (
          <button
            onClick={cancelEdit}
            style={{ backgroundColor: "#eee", padding: "0.5rem 1rem", border: "none", cursor: "pointer" }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Bills Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
        <thead style={{ backgroundColor: "#e8f0fe" }}>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Type</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Amount (₹)</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Date</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Paid By</th>
            <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 ? (
            <tr><td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>No bills to show</td></tr>
          ) : (
            bills.map(bill => (
              <tr key={bill.id}>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{bill.utility_type}</td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "right" }}>{bill.amount.toFixed(2)}</td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{new Date(bill.bill_date).toLocaleDateString()}</td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>{bill.added_by}</td>
                <td style={{ border: "1px solid #ccc", padding: "0.5rem", textAlign: "center" }}>
                  <button
                    onClick={() => startEditBill(bill)}
                    style={{ marginRight: "0.5rem", cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteBill(bill.id)} style={{ cursor: "pointer" }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Analytics Section */}
      <h2 style={{ color: "#0070d2" }}>Analytics</h2>

      {/* Expense by Person */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Expense by Person</h3>
        {Object.keys(expenseByPerson).length === 0 ? (
          <p>No data</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(expenseByPerson).map(([person, amt]) => (
                <tr key={person}>
                  <td style={{ borderBottom: "1px solid #ccc", padding: "0.3rem" }}>{person}</td>
                  <td style={{ borderBottom: "1px solid #ccc", padding: "0.3rem", textAlign: "right" }}>
                    ₹{amt.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Expense by Type */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Expense by Type</h3>
        {Object.keys(expenseByType).length === 0 ? (
          <p>No data</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(expenseByType).map(([type, amt]) => (
                <tr key={type}>
                  <td style={{ borderBottom: "1px solid #ccc", padding: "0.3rem" }}>{type}</td>
                  <td style={{ borderBottom: "1px solid #ccc", padding: "0.3rem", textAlign: "right" }}>
                    ₹{amt.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Expense by Month */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3>Expense by Month</h3>
        {Object.keys(expenseByMonth).length === 0 ? (
          <p>No data</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {Object.entries(expenseByMonth).map(([month, amt]) => (
                <tr key={month}>
                  <td style={{ borderBottom: "1px solid #ccc", padding: "0.3rem" }}>{month}</td>
                  <td style={{ borderBottom: "1px solid #ccc", padding: "0.3rem", textAlign: "right" }}>
                    ₹{amt.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New: Current Month Expense by Person */}
      <div>
        <h3>Expense by Person — Current Month ({now.toLocaleString("default", { month: "long", year: "numeric" })})</h3>
        {sortedCurrentMonthByPerson.length === 0 ? (
          <p>No expenses recorded for this month.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#0070d2", color: "white" }}>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Person</th>
                <th style={{ padding: "0.5rem", textAlign: "right" }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {sortedCurrentMonthByPerson.map(([person, amt]) => (
                <tr key={person}>
                  <td style={{ borderBottom: "1px solid #ccc", padding: "0.3rem" }}>{person}</td>
                  <td style={{ borderBottom: "1px solid #ccc", padding: "0.3rem", textAlign: "right" }}>
                    ₹{amt.toFixed(2)}
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
