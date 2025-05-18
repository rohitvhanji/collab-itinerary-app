import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

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

  // Chart Data Generators
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
        <input type="text" placeholder="Expense Type" value={utilityType} onChange={(e) => setUtilityType(e.target.value)} style={inputStyle} />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={inputStyle} />
        <input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} style={inputStyle} />
        <input type="text" placeholder="Paid By" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} style={inputStyle} />
        <button onClick={addOrUpdateBill} style={buttonStylePrimary}>{editingBillId ? "Update" : "Add"} Bill</button>
        {editingBillId && <button onClick={cancelEdit} style={buttonStyleSecondary}>Cancel</button>}
      </div>

      {/* Table */}
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 140px", fontWeight: "bold", padding: "0.5rem", background: "#e8f0fe" }}>
          <div>Type</div><div>Amount</div><div>Date</div><div>Paid By</div><div>Actions</div>
        </div>
        {bills.map(bill => (
          <div key={bill.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 140px", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
            <div>{bill.utility_type}</div>
            <div>₹{bill.amount.toFixed(2)}</div>
            <div>{new Date(bill.bill_date).toLocaleDateString()}</div>
            <div>{bill.added_by}</div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => startEditBill(bill)} style={buttonStylePrimary}>Edit</button>
              <button onClick={() => deleteBill(bill.id)} style={buttonStyleSecondary}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <h2 style={{ marginTop: "3rem", color: "#0070d2" }}>Reports</h2>

      <div style={{ display: "grid", gap: "2rem", marginTop: "1rem" }}>
        <div>
          <h3>Expense by Person</h3>
          <div style={{ width: "100%", height: "400px" }}>
            <Pie
              data={{
                labels: Object.keys(expenseByPerson),
                datasets: [{
                  data: Object.values(expenseByPerson),
                  backgroundColor: ["#0070d2", "#00a1e0", "#f4c430", "#ff6384", "#36a2eb"],
                }],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        </div>

        <div>
          <h3>Expense by Type</h3>
          <div style={{ width: "100%", height: "400px" }}>
            <Bar
              data={{
                labels: Object.keys(expenseByType),
                datasets: [{
                  label: "Amount (₹)",
                  data: Object.values(expenseByType),
                  backgroundColor: "#00a1e0",
                }],
              }}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        <div>
          <h3>Expense by Month</h3>
          <div style={{ width: "100%", height: "400px" }}>
            <Bar
              data={{
                labels: Object.keys(expenseByMonth),
                datasets: [{
                  label: "Amount (₹)",
                  data: Object.values(expenseByMonth),
                  backgroundColor: "#f4c430",
                }],
              }}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
