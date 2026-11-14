import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Papa from 'papaparse'

export default function AdminDashboard({ onLogout }) {
  const [adminData, setAdminData] = useState([])
  const [adminLoading, setAdminLoading] = useState(true)
  const [viewYear, setViewYear] = useState('2025')
  
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
        const totalPaidForYear = yearPayments.reduce((sum, p) => sum + p.amount, 0)
        const monthsPaidForYear = yearPayments.filter(p => p.fund_type === 'Building Fund').length

        return {
          ...member,
          pledge: memberPledge,
          totalPaidForYear,
          monthsPaidForYear
        }
      })
      processed.sort((a, b) => b.totalPaidForYear - a.totalPaidForYear)
      setAdminData(processed)
    }
    setAdminLoading(false)
  }

  useEffect(() => {
    fetchAdminData()
  }, [viewYear])

  // Filter based on search
  const filteredData = adminData.filter(m => 
    m.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.member_code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // GROUPING LOGIC
  const consistentPayers = filteredData.filter(m => m.monthsPaidForYear >= 6)
  const needsFollowUp = filteredData.filter(m => m.monthsPaidForYear > 0 && m.monthsPaidForYear < 6)
  const noPayments = filteredData.filter(m => m.monthsPaidForYear === 0)

  const totalCollectedForYear = adminData.reduce((sum, m) => sum + m.totalPaidForYear, 0)
  const totalPledgedForYear = adminData.reduce((sum, m) => sum + (m.pledge * 12), 0)

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    setUploadStatus('Parsing file...')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data
        setUploadStatus(`Found ${rows.length} records. Processing...`)

        const membersMap = {}
        rows.forEach(row => {
          if (!row.full_name) return 
          const code = row.member_code || `TCA-${Math.floor(1000 + Math.random() * 9000)}`
          
          if (!membersMap[code]) {
            membersMap[code] = {
              full_name: row.full_name,
              member_code: code,
              password: 'Password123', 
              pledge: Number(row.monthly_pledge) || 0,
              payments: []
            }
          }
          if (row.month_paid_for && row.amount) {
            membersMap[code].payments.push({
              month_paid_for: row.month_paid_for,
              amount: Number(row.amount)
            })
          }
        })

        const memberCodes = Object.keys(membersMap)
        let successCount = 0

        for (const code of memberCodes) {
          const m = membersMap[code]
          
          await supabase.from('members').insert([{
            full_name: m.full_name, member_code: m.member_code, password: m.password, phone_number: ''
          }])

          if (m.pledge > 0) {
            await supabase.from('pledges').upsert([{ member_code: m.member_code, amount: m.pledge }], { onConflict: 'member_code' })
          }

          if (m.payments.length > 0) {
            const paymentInserts = m.payments.map(p => ({
              member_code: m.member_code, amount: p.amount, fund_type: 'Building Fund',
              month_paid_for: p.month_paid_for, paystack_reference: `LEGACY-${Date.now()}-${Math.random()}`, status: 'success'
            }))
            await supabase.from('payments').insert(paymentInserts)
          }
          successCount++
        }

        setUploadStatus(`Successfully imported ${successCount} members and their history!`)
        setIsUploading(false)
        fetchAdminData() 
      },
      error: (error) => {
        setUploadStatus('Error parsing file: ' + error.message)
        setIsUploading(false)
      }
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1000')
    printWindow.document.write('<html><head><title>CTCA Building Fund Report - ' + viewYear + '</title>')
    printWindow.document.write('<style>')
    printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }')
    printWindow.document.write('h1 { color: #0a192f; text-align: center; }')
    printWindow.document.write('h2 { color: #d4af37; text-align: center; font-size: 1.2rem; margin-bottom: 30px; }')
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }')
    printWindow.document.write('th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px; }')
    printWindow.document.write('th { background-color: #0a192f; color: white; }')
    printWindow.document.write('tr:nth-child(even) { background-color: #f9f9f9; }')
    printWindow.document.write('.summary { display: flex; justify-content: space-between; margin-bottom: 20px; font-weight: bold; }')
    printWindow.document.write('</style></head><body>')
    printWindow.document.write(`<h1>Charity Terbanacle Christian Assembly</h1>`)
    printWindow.document.write(`<h2>Building Fund Report - ${viewYear}</h2>`)
    printWindow.document.write(`<div class="summary">`)
    printWindow.document.write(`<span>Total Collected: ₦${totalCollectedForYear.toLocaleString()}</span>`)
    printWindow.document.write('</div>')
    printWindow.document.write('<table><thead><tr>')
    printWindow.document.write('<th>Member Name</th><th>Member Code</th><th>Monthly Pledge</th><th>Months Paid</th><th>Total Contributed</th>')
    printWindow.document.write('</tr></thead><tbody>')
    
    filteredData.forEach(member => {
      printWindow.document.write('<tr>')
      printWindow.document.write(`<td>${member.full_name}</td>`)
      printWindow.document.write(`<td>${member.member_code}</td>`)
      printWindow.document.write(`<td>₦${member.pledge.toLocaleString()}</td>`)
      printWindow.document.write(`<td>${member.monthsPaidForYear} / 12</td>`)
      printWindow.document.write(`<td>₦${member.totalPaidForYear.toLocaleString()}</td>`)
      printWindow.document.write('</tr>')
    })
    printWindow.document.write('</tbody></table></body></html>')
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print() }, 500)
  }

  // Reusable Table Component for the Groups
  const MemberTable = ({ members, title, type, emptyText }) => {
    if (members.length === 0) {
      return (
        <div className="bright-panel admin-group-panel" style={{ marginTop: '1.5rem' }}>
          <h3>{title} (0)</h3>
          <p style={{ color: '#64748b', fontStyle: 'italic', marginTop: '1rem' }}>{emptyText}</p>
        </div>
      )
    }

    return (
      <div className={`bright-panel admin-group-panel ${type}`} style={{ marginTop: '1.5rem' }}>
        <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
          {title}
          <span className="badge" style={{ fontSize: '0.9rem', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>{members.length}</span>
        </h3>
        <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Member Code</th>
                <th>Monthly Pledge</th>
                <th>Months Paid ({viewYear})</th>
                <th>Total Contributed ({viewYear})</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr 
                  key={member.member_code} 
                  className="animated-row" 
                  style={{ animationDelay: `${index * 0.05}s` }} // Staggered animation
                >
                  <td style={{ fontWeight: '600', color: '#0a192f' }}>{member.full_name}</td>
                  <td>{member.member_code}</td>
                  <td>₦{member.pledge.toLocaleString()}</td>
                  <td>{member.monthsPaidForYear} / 12</td>
                  <td style={{ fontWeight: '800', color: '#0a192f' }}>₦{member.totalPaidForYear.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ borderBottom: '4px solid #0a192f' }}>
        <h2 style={{ color: '#d4af37' }}>Admin Control Panel</h2>
        <div className="header-actions">
          <span className="member-code">Logged in as: <strong>Administrator</strong></span>
          <button onClick={onLogout} className="logout-btn">Log Out</button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="compact-top-bar">
          <div className="welcome-text">
            <h1>Church Building Fund Overview</h1>
          </div>
          <div className="compact-scripture" style={{ borderLeft: '2px solid #d4af37' }}>
            <span className="scripture-label" style={{ color: '#0a192f' }}>TOTAL COLLECTED ({viewYear})</span>
            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#d4af37' }}>
              ₦{totalCollectedForYear.toLocaleString()}
            </p>
          </div>
        </div>

        {/* STATS ROW - Only Total Members & Total Pledged */}
        <div className="admin-stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="bright-panel stat-card animate-pop">
            <h3>Total Members</h3>
            <p className="stat-number">{adminData.length}</p>
          </div>
          <div className="bright-panel stat-card animate-pop" style={{ animationDelay: '0.1s' }}>
            <h3>Total Pledged ({viewYear})</h3>
            <p className="stat-number">₦{totalPledgedForYear.toLocaleString()}</p>
          </div>
        </div>

        {/* UPLOAD PANEL */}
        <div className="bright-panel" style={{ marginTop: '1.5rem', borderLeft: '4px solid #0a192f' }}>
          <h3 style={{ marginBottom: '1rem', color: '#0a192f' }}>Import Legacy Data (CSV)</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Upload your Excel sheet saved as a CSV file. Ensure columns are: <strong>full_name, member_code, monthly_pledge, month_paid_for, amount</strong>.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              disabled={isUploading}
              style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}
            />
            {isUploading && <span style={{ color: '#d4af37', fontWeight: 'bold' }}>Processing...</span>}
          </div>
          {uploadStatus && <p style={{ marginTop: '1rem', color: '#0a192f', fontWeight: '600' }}>{uploadStatus}</p>}
        </div>

        {/* TOOLBAR */}
        <div className="bright-panel" style={{ marginTop: '1.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Member Directory</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', minWidth: '250px' }}
            />
            <select className="year-selector" value={viewYear} onChange={(e) => setViewYear(e.target.value)}>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
            <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.6rem 1rem', width: 'auto', fontSize: '0.85rem' }}>
              🖨️ Print Report
            </button>
          </div>
        </div>

        {/* GROUPED TABLES */}
        {adminLoading ? (
          <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading member data...</p>
        ) : (
          <div className="admin-groups-container">
            <MemberTable 
              members={consistentPayers} 
              title="Consistent Payers (6+ Months)" 
              type="group-consistent" 
              emptyText="No members in this category yet." 
            />
            
            <MemberTable 
              members={needsFollowUp} 
              title="Needs Follow-up (1-5 Months)" 
              type="group-followup" 
              emptyText="No members in this category yet." 
            />

            <MemberTable 
              members={noPayments} 
              title="No Payments (0 Months)" 
              type="group-nopay" 
              emptyText="All members have made payments! Praise God." 
            />
          </div>
        )}
      </main>
    </div>
  )
}