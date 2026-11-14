import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Papa from 'papaparse'
import { Search, Printer, AlertCircle, CheckCircle, Clock, Users, History, LogOut, Bell, Upload, HeartHandshake, ShieldAlert, Church } from 'lucide-react'
import './AdminDashboard.css'

export default function AdminDashboard({ onLogout }) {
  const [adminData, setAdminData] = useState([])
  const [adminLoading, setAdminLoading] = useState(true)
  const [viewYear, setViewYear] = useState('2025')
  const [selectedFund, setSelectedFund] = useState('Building Fund')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAdminData = async () => {
    setAdminLoading(true)
    const { data: members } = await supabase.from('members').select('*')
    const { data: pledges } = await supabase.from('pledges').select('*')
    const { data: allPayments } = await supabase.from('payments').select('*').eq('status', 'success')

    if (members) {
      const processed = members.map(member => {
        const memberPledge = pledges?.find(p => p.member_code === member.member_code)?.amount || 0
        const yearPayments = allPayments?.filter(p => p.member_code === member.member_code && p.month_paid_for.startsWith(viewYear)) || []
        const fundPayments = yearPayments.filter(p => p.fund_type === selectedFund)
        
        const totalPaidForYear = fundPayments.reduce((sum, p) => sum + p.amount, 0)
        const monthsPaidForYear = fundPayments.length

        return { ...member, pledge: memberPledge, totalPaidForYear, monthsPaidForYear }
      })
      processed.sort((a, b) => b.totalPaidForYear - a.totalPaidForYear)
      setAdminData(processed)
    }
    setAdminLoading(false)
  }

  useEffect(() => { fetchAdminData() }, [viewYear, selectedFund])

  const filteredData = adminData.filter(m => 
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.member_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const consistentPayers = filteredData.filter(m => m.monthsPaidForYear >= 6)
  const needsFollowUp = filteredData.filter(m => m.monthsPaidForYear > 0 && m.monthsPaidForYear < 6)
  const noPayments = filteredData.filter(m => m.monthsPaidForYear === 0)
  const allMembersAlphabetical = [...filteredData].sort((a, b) => a.full_name.localeCompare(b.full_name))

  const totalCollectedForYear = adminData.reduce((sum, m) => sum + m.totalPaidForYear, 0)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsUploading(true)
    setUploadStatus('Parsing file...')
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data
        setUploadStatus(`Found ${rows.length} records. Processing...`)
        const membersMap = {}
        rows.forEach(row => {
          if (!row.full_name) return 
          const code = row.member_code || `TCA-${Math.floor(1000 + Math.random() * 9000)}`
          if (!membersMap[code]) membersMap[code] = { full_name: row.full_name, member_code: code, password: 'Password123', pledge: Number(row.monthly_pledge) || 0, payments: [] }
          if (row.month_paid_for && row.amount) membersMap[code].payments.push({ month_paid_for: row.month_paid_for, amount: Number(row.amount) })
        })
        let successCount = 0
        for (const code of Object.keys(membersMap)) {
          const m = membersMap[code]
          await supabase.from('members').insert([{ full_name: m.full_name, member_code: m.member_code, password: m.password, phone_number: '' }])
          if (m.pledge > 0) await supabase.from('pledges').upsert([{ member_code: m.member_code, amount: m.pledge }], { onConflict: 'member_code' })
          if (m.payments.length > 0) {
            const inserts = m.payments.map(p => ({ member_code: m.member_code, amount: p.amount, fund_type: 'Building Fund', month_paid_for: p.month_paid_for, paystack_reference: `LEGACY-${Date.now()}-${Math.random()}`, status: 'success' }))
            await supabase.from('payments').insert(inserts)
          }
          successCount++
        }
        setUploadStatus(`Successfully imported ${successCount} members!`)
        setIsUploading(false)
        fetchAdminData() 
      }
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1000')
    printWindow.document.write('<html><head><title>CTCA Report</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#0a192f;color:white}</style></head><body>')
    printWindow.document.write(`<h2>${selectedFund} Report - ${viewYear}</h2><p><strong>Total Collected:</strong> ₦${totalCollectedForYear.toLocaleString()}</p>`)
    printWindow.document.write('<table><thead><tr><th>Name</th><th>Code</th><th>Months Paid</th><th>Total Paid</th></tr></thead><tbody>')
    allMembersAlphabetical.forEach(m => printWindow.document.write(`<tr><td>${m.full_name}</td><td>${m.member_code}</td><td>${m.monthsPaidForYear}</td><td>₦${m.totalPaidForYear.toLocaleString()}</td></tr>`))
    printWindow.document.write('</tbody></table></body></html>')
    printWindow.document.close()
    printWindow.print()
  }

  const MemberColumn = ({ title, members, icon, description }) => {
    let panelClass = 'building-fund';
    let textClass = 'text-building';
    
    if (selectedFund === 'Emergency Fund') { panelClass = 'emergency-fund'; textClass = 'text-emergency'; }
    if (selectedFund === 'Welfare Fund') { panelClass = 'missionary-fund'; textClass = 'text-missionary'; }

    return (
      <div className={`admin-panel ${panelClass}`}>
        <div className="admin-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {icon}
            <h3>{title}</h3>
          </div>
          <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' }}>{members.length}</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>{description}</p>
        
        <div className="admin-list-container">
          {members.length === 0 ? (
            <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>No members here.</p>
          ) : (
            members.map((member, idx) => (
              <div 
                key={member.member_code} 
                className="admin-member-card" 
                style={{ animationDelay: `${idx * 0.05}s` }} // Staggered animation
              >
                <div className="info-left">
                  <p className="admin-member-name">{member.full_name}</p>
                  <p className="admin-member-code">{member.member_code}</p>
                </div>
                <div className="info-right">
                  <p className={`admin-member-total ${textClass}`}>₦{member.totalPaidForYear.toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h3>CTCA</h3>
          <p>Admin Portal</p>
        </div>
        
        <div className="sidebar-nav">
          <div className={`nav-item ${selectedFund === 'Building Fund' ? 'active' : ''}`} onClick={() => setSelectedFund('Building Fund')}>
            <Church size={18} /> Building Fund
          </div>
          <div className={`nav-item ${selectedFund === 'Emergency Fund' ? 'active' : ''}`} onClick={() => setSelectedFund('Emergency Fund')}>
            <ShieldAlert size={18} /> Emergency Fund
          </div>
          <div className={`nav-item ${selectedFund === 'Welfare Fund' ? 'active' : ''}`} onClick={() => setSelectedFund('Welfare Fund')}>
            <HeartHandshake size={18} /> Missionary Fund
          </div>
          <div className="nav-item" onClick={onLogout} style={{ marginTop: 'auto', color: '#ef4444' }}>
            <LogOut size={18} /> Log Out
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="welcome-text">
            <h2>{selectedFund} Control Panel</h2>
            <p>Overview of church-wide contributions for the {selectedFund.toLowerCase()}.</p>
          </div>
          <div className="header-user">
            <Bell size={20} color="#64748b" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="user-avatar">AD</div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0a192f', margin: 0 }}>Administrator</p>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>Master Access</p>
              </div>
            </div>
          </div>
        </header>

        <div className="content-scroll">
          
          <div className="toolbar-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div className="search-input-wrapper">
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" placeholder="Search members..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <select className="year-selector" value={viewYear} onChange={(e) => setViewYear(e.target.value)}>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#f1f5f9', padding: '0.7rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s' }}>
                <Upload size={16} /> Import CSV
                <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isUploading} style={{ display: 'none' }} />
              </label>
              <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.7rem 1.2rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}><Printer size={16} /> Print Report</button>
            </div>
          </div>

          {uploadStatus && <p style={{ marginBottom: '1rem', color: '#0a192f', fontWeight: 'bold' }}>{uploadStatus}</p>}

          {adminLoading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</p>
          ) : (
            <div className="admin-pro-layout">
              
              <div className="admin-stats-row">
                <div className="admin-stat-box">
                  <div className="admin-stat-icon green"><History size={24} /></div>
                  <div className="admin-stat-info"><p>Total Collected ({viewYear})</p><h4>₦{totalCollectedForYear.toLocaleString()}</h4></div>
                </div>
                <div className="admin-stat-box">
                  <div className="admin-stat-icon blue"><Users size={24} /></div>
                  <div className="admin-stat-info"><p>Total Members</p><h4>{adminData.length}</h4></div>
                </div>
                <div className="admin-stat-box">
                  <div className="admin-stat-icon gold"><CheckCircle size={24} /></div>
                  <div className="admin-stat-info"><p>Consistent Payers</p><h4>{consistentPayers.length}</h4></div>
                </div>
                <div className="admin-stat-box">
                  <div className="admin-stat-icon red"><AlertCircle size={24} /></div>
                  <div className="admin-stat-info"><p>No Payments</p><h4>{noPayments.length}</h4></div>
                </div>
              </div>

              <div className="admin-main-grid">
                <MemberColumn title="Consistent Payers" members={consistentPayers} icon={<CheckCircle size={20} color="#22c55e" />} description="Paid 6 or more months. Great job!" />
                <MemberColumn title="Needs Follow-up" members={needsFollowUp} icon={<Clock size={20} color="#d4af37" />} description="Paid 1-5 months. Give them a call." />
                <MemberColumn title="No Payments" members={noPayments} icon={<AlertCircle size={20} color="#ef4444" />} description={`No payments for this fund.`} />
              </div>

              <div style={{ marginTop: '2rem' }}>
                <div className="admin-panel">
                  <div className="admin-panel-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={20} color="#0a192f" />
                      <h3>All Registered Members (A-Z) — {selectedFund}</h3>
                    </div>
                    <span style={{ background: '#f1f5f9', color: '#475569', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' }}>{allMembersAlphabetical.length}</span>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="history-table">
                      <thead><tr><th>Member Name</th><th>Code</th><th>Months Paid ({viewYear})</th><th>Total Contributed</th></tr></thead>
                      <tbody>
                        {allMembersAlphabetical.map(m => (
                          <tr key={m.member_code}>
                            <td style={{ fontWeight: '700', color: '#0a192f' }}>{m.full_name}</td>
                            <td>{m.member_code}</td>
                            <td>{m.monthsPaidForYear}</td>
                            <td style={{ fontWeight: '800', color: '#22c55e' }}>₦{m.totalPaidForYear.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}