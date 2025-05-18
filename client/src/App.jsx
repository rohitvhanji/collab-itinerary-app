<div className="form" style={{
  display: 'flex',
  gap: '0.8rem',
  marginBottom: '1.5rem',
  flexWrap: 'nowrap',    // prevent wrapping, keep in one line
  justifyContent: 'center',
  alignItems: 'center'
}}>
  <input
    value={utilityType}
    onChange={e => setUtilityType(e.target.value)}
    placeholder="Utility Type"
    style={{ width: '130px', padding: '6px 8px', fontSize: '14px' }}
  />
  <input
    value={amount}
    onChange={e => setAmount(e.target.value)}
    placeholder="Amount"
    type="number"
    style={{ width: '90px', padding: '6px 8px', fontSize: '14px' }}
  />
  <input
    value={billDate}
    onChange={e => setBillDate(e.target.value)}
    placeholder="Bill Date"
    type="date"
    style={{ width: '140px', padding: '6px 8px', fontSize: '14px' }}
  />
  <input
    value={paidBy}
    onChange={e => setPaidBy(e.target.value)}
    placeholder="Paid By"
    style={{ width: '130px', padding: '6px 8px', fontSize: '14px' }}
  />
  <button
    onClick={addOrUpdateBill}
    style={{
      backgroundColor: '#27ae60',
      color: 'white',
      padding: '8px 14px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      minWidth: '110px',
      fontSize: '14px'
    }}
  >
    {editingBill ? 'Update Bill' : 'Add Bill'}
  </button>
  {editingBill && (
    <button
      onClick={cancelEdit}
      style={{
        backgroundColor: '#e74c3c',
        color: 'white',
        padding: '8px 14px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        minWidth: '110px',
        fontSize: '14px'
      }}
    >
      Cancel
    </button>
  )}
</div>
