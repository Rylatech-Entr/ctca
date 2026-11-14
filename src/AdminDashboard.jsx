import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Papa from 'papaparse'
import { Search, Printer, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react'

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

  // Grouped Arrays
  const consistentPayers = filteredData.filter(m => m.monthsPaidForYear >= 6)
  const needsFollowUp = filteredData.filter(m => m.monthsPaidForYear > 0 && m.monthsPaidForYear < 6)
  const noPayments = filteredData.filter(m => m.monthsPaidForYear === 0)
  
  // Alphabetical list of all members
  const allMembersAlphabetical = [...filteredData].sort((a, b) => 
    a.full_name.localeCompare(b.full_name)
  )

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

        setUploadStatus(`Successfully imported ${successCount} members!`)
        setIsUploading(false)
        fetchAdminData() 
      }
    })
  }

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1000')
    printWindow.document.write('<html><head><title>CTCA Report</title>')
    printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background: #0a192f; color: white; }</style></head><body>')
    printWindow.document.write(`<h2>Building Fund Report - ${viewYear}</h2>`)
    printWindow.document.write(`<p><strong>Total Collected:</strong> ₦${totalCollectedForYear.toLocaleString()}</p>`)
    printWindow.document.write('<table><thead><tr><th>Name</th><th>Code</th><th>Pledge</th><th>Months Paid</th><th>Total Paid</th></tr></thead><tbody>')
    allMembersAlphabetical.forEach(m => {
      printWindow.document.write(`<tr><td>${m.full_name}</td><td>${m.member_code}</td><td>₦${m.pledge.toLocaleString()}</td><td>${m.monthsPaidForYear}/12</td><td>₦${m.totalPaidForYear.toLocaleString()}</td></tr>`)
    })
    printWindow.document.write('</tbody></table></body></html>')
    printWindow.document.close()
    printWindow.print()
  }

  // Reusable Column Component
  const MemberColumn = ({ title, members, icon, colorClass, description }) => (
    <div className={`admin-column ${colorClass}`}>
      <div className="column-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          <h3>{title}</h3>
        </div>
        <span className="count-badge">{members.length}</span>
      </div>
      <p className="column-desc">{description}</p>
      
      <div className="column-list">
        {members.length === 0 ? (
          <p className="empty-text">No members here.</p>
        ) : (
          members.map((member, idx) => (
            <div key={member.member_code} className="mini-member-card" style={{ animationDelay: `${idx * 0.03}s` }}>
              <div className="member-info-left">
                <p className="member-name">{member.full_name}</p>
                <p className="member-code">{member.member_code} • ₦{member.pledge.toLocaleString()}/mo</p>
              </div>
              <div className="member-info-right">
                <p className="member-months">{member.monthsPaidForYear}/12</p>
                <p className="member-total">₦{member.totalPaidForYear.toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="dashboard-container">
      <header className="dashboard-header" style={{ borderBottom: '4px solid #0a192f' }}>
        <h2 style={{ color: '#d4af37' }}>Admin Control Panel</h2>
        <div className="header-actions">
          <span className="member-code">Admin: <strong>Active</strong></span>
          <button onClick={onLogout} className="logout-btn">Log Out</button>
        </div>
      </header>

      <main className="dashboard-content">
        {/* TOP BAR */}
        <div className="compact-top-bar" style={{ marginBottom: '1.5rem' }}>
          <div className="welcome-text">
            <h1>Church Overview</h1>
          </div>
          <div className="compact-scripture" style={{ borderLeft: '2px solid #d4af37' }}>
            <span className="scripture-label" style={{ color: '#0a192f' }}>TOTAL COLLECTED ({viewYear})</span>
            <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#d4af37' }}>₦{totalCollectedForYear.toLocaleString()}</p>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="admin-stats-grid">
          <div className="bright-panel stat-card animate-pop">
            <h3>Total Members</h3>
            <p className="stat-number">{adminData.length}</p>
          </div>
          <div className="bright-panel stat-card animate-pop" style={{ animationDelay: '0.1s' }}>
            <h3>Total Pledged ({viewYear})</h3>
            <p className="stat-number">₦{totalPledgedForYear.toLocaleString()}</p>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="bright-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search members..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', width: '250px' }}
              />
            </div>
            <select className="year-selector" value={viewYear} onChange={(e) => setViewYear(e.target.value)}>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
             <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isUploading} style={{ fontSize: '0.8rem' }} />
             <button onClick={handlePrint} className="btn-primary" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* DASHBOARD LAYOUT */}
        {adminLoading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading...</p>
        ) : (
          <div className="admin-dashboard-layout">
            
            {/* Top Grid: 2 Columns */}
            <div className="admin-top-grid">
              {/* Left Side - Consistent */}
              <MemberColumn 
                title="Consistent Payers" 
                members={consistentPayers} 
                icon={<CheckCircle size={20} color="#22c55e" />}
                colorClass="col-green"
                description="Paid 6 or more months. Great job!"
              />
              
              {/* Right Side - Stacked Follow-up and No Payments */}
              <div className="admin-right-stack">
                <MemberColumn 
                  title="Needs Follow-up" 
                  members={needsFollowUp} 
                  icon={<Clock size={20} color="#d4af37" />}
                  colorClass="col-gold"
                  description="Paid 1-5 months."
                />
                <MemberColumn 
                  title="No Payments" 
                  members={noPayments} 
                  icon={<AlertCircle size={20} color="#ef4444" />}
                  colorClass="col-red"
                  description="Haven't paid this year. Needs attention."
                />
              </div>
            </div>

            {/* Bottom Row - All Members */}
            <MemberColumn 
              title="All Registered Members (A-Z)" 
              members={allMembersAlphabetical} 
              icon={<Users size={20} color="#0a192f" />}
              colorClass="col-all"
              description="Complete list of everyone."
            />

          </div>
        )}
      </main>
    </div>
  )
}