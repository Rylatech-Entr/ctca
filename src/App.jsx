import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import { PaystackButton } from 'paystack-react-lite'
import AdminDashboard from './AdminDashboard'

// --- BIBLE PROMISES LIST (ALL 55) ---
const PROMISE_VERSES = [
  { ref: "Jeremiah 29:11", summary: "God has plans of peace, hope and a good future for His people." },
  { ref: "Deuteronomy 28:1-6", summary: "Blessings upon obedience, in the city, in the field and in daily life." },
  { ref: "Psalm 23:1-6", summary: "The Lord is our Shepherd; He provides, guides and sustains us." },
  { ref: "Psalm 1:1-3", summary: "Those who delight in God's Word shall flourish like a tree planted by rivers of water." },
  { ref: "Isaiah 54:10", summary: "God's covenant of peace will not be removed." },
  { ref: "Proverbs 3:5-6", summary: "God promises to direct the paths of those who trust Him." },
  { ref: "Psalm 84:11", summary: "God gives grace and glory and withholds no good thing from those who walk uprightly." },
  { ref: "Joel 2:25-27", summary: "God promises restoration of the years that were lost." },
  { ref: "Isaiah 60:1-5", summary: "God's light will shine upon His people, and they will experience restoration and increase." },
  { ref: "Psalm 65:11", summary: "God crowns the year with His goodness." },
  { ref: "Philippians 4:19", summary: "God will supply all your needs according to His riches in glory." },
  { ref: "2 Corinthians 9:8", summary: "God is able to make all grace abound towards you, so you have sufficiency for every good work." },
  { ref: "Deuteronomy 8:18", summary: "God gives the ability to produce wealth." },
  { ref: "Malachi 3:10-12", summary: "God promises blessing and provision in connection with faithfulness in giving." },
  { ref: "Psalm 34:10", summary: "Those who seek the Lord will not lack any good thing." },
  { ref: "Proverbs 10:22", summary: "The blessing of the Lord makes rich without adding sorrow." },
  { ref: "Matthew 6:31-33", summary: "Seek God's kingdom first, and He will provide what you need." },
  { ref: "Luke 6:38", summary: "Give, and it will be given to you." },
  { ref: "Psalm 112:1-3", summary: "Those who fear the Lord and delight in His commandments are blessed." },
  { ref: "3 John 1:2", summary: "A prayer for prosperity and good health, even as the soul prospers." },
  { ref: "Isaiah 41:10", summary: "Do not fear; God will strengthen, help and uphold you." },
  { ref: "Psalm 91:1-16", summary: "God's protection, refuge and deliverance for those who dwell in Him." },
  { ref: "Isaiah 54:17", summary: "No weapon formed against God's servants will ultimately prosper." },
  { ref: "Romans 8:31-39", summary: "Nothing can separate believers from the love of God in Christ." },
  { ref: "Deuteronomy 31:8", summary: "God goes before you and will never forsake you." },
  { ref: "Exodus 14:13-14", summary: "The Lord fights for His people." },
  { ref: "2 Thessalonians 3:3", summary: "The Lord is faithful; He will strengthen and protect you from evil." },
  { ref: "Psalm 121:1-8", summary: "God watches over your going out and coming in." },
  { ref: "1 John 5:4-5", summary: "Faith in Christ gives believers victory over the world." },
  { ref: "Romans 16:20", summary: "God will crush Satan under the feet of His people." },
  { ref: "Jeremiah 30:17", summary: "God promises healing and restoration." },
  { ref: "Isaiah 53:4-5", summary: "The prophecy of the suffering Servant who bears our infirmities and brings healing through His wounds." },
  { ref: "Exodus 15:26", summary: "God reveals Himself as the Lord who heals." },
  { ref: "Psalm 103:1-5", summary: "God forgives, heals, redeems and satisfies His people with good things." },
  { ref: "Isaiah 40:29-31", summary: "Those who wait upon the Lord receive renewed strength." },
  { ref: "Proverbs 4:20-22", summary: "God's words bring life and health to those who receive them." },
  { ref: "Psalm 91:16", summary: "God promises satisfaction with long life and His salvation." },
  { ref: "Isaiah 46:4", summary: "God promises to sustain His people even in old age." },
  { ref: "Jeremiah 33:6", summary: "God promises health, healing, peace and truth." },
  { ref: "1 Peter 5:10", summary: "After suffering for a while, God promises to restore, establish, strengthen and settle His people." },
  { ref: "Psalm 5:12", summary: "God surrounds the righteous with favour as with a shield." },
  { ref: "Isaiah 43:18-19", summary: "God promises to do a new thing and make a way in the wilderness." },
  { ref: "Deuteronomy 28:13", summary: "God promises to make His obedient people the head and not the tail." },
  { ref: "Psalm 75:6-7", summary: "Promotion and exaltation ultimately come from God." },
  { ref: "Proverbs 4:18", summary: "The path of the righteous shines brighter and brighter unto the perfect day." },
  { ref: "Isaiah 61:7", summary: "God promises double honour instead of shame." },
  { ref: "John 14:27", summary: "Jesus gives His disciples His peace, not as the world gives." },
  { ref: "Ephesians 3:20", summary: "God is able to do exceedingly abundantly above all we ask or think." },
  { ref: "Zechariah 9:12", summary: "God promises a double restoration to prisoners of hope." },
  { ref: "Romans 8:28", summary: "God works all things together for good for those who love Him and are called according to His purpose." },
  { ref: "Genesis 12:1-3", summary: "The promise of blessing and becoming a blessing." },
  { ref: "Isaiah 58:11", summary: "God's promise of continual guidance and satisfaction." },
  { ref: "Psalm 37:4-5", summary: "Delight yourself in the Lord and commit your way to Him." },
  { ref: "Matthew 11:28-30", summary: "Rest for those who come to Christ." },
  { ref: "Revelation 21:3-7", summary: "The promise of eternal life and a future without sorrow, death or pain." }
]

const MINIMUM_PAYMENT = 2000
const PAYSTACK_PUBLIC_KEY = "pk_test_bde5a22d65ccb49fa64a2ba08ef180273eafe866" // <-- REPLACE THIS

// ==========================================
// --- ADMIN LOGIN & ROUTE ---
// ==========================================
function AdminRoute() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (password === "CTCA2025!") {
      setIsAdminAuthenticated(true)
    } else {
      setError("Invalid Admin Password")
    }
  }

  if (isAdminAuthenticated) {
    return <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />
  }

  return (
    <div className="auth-side" style={{ background: '#0a192f', minHeight: '100vh' }}>
      <div className="auth-card" style={{ borderTop: '6px solid #d4af37' }}>
        <h2 style={{ color: '#d4af37' }}>Admin Access Only</h2>
        <p className="subtitle" style={{ color: '#a8b2c1' }}>Enter the secure master password.</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleAdminLogin}>
          <div className="input-group">
            <label style={{ color: '#a8b2c1' }}>Admin Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary" style={{ background: '#d4af37', color: '#0a192f' }}>
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  )
}

// ==========================================
// --- MEMBER APP (LOGIN & DASHBOARD) ---
// ==========================================
function MemberApp() {
  const [authMode, setAuthMode] = useState('login')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  const [loginCode, setLoginCode] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const [payments, setPayments] = useState([])
  const [viewYear, setViewYear] = useState('2025')
  const [monthlyPledge, setMonthlyPledge] = useState(0)
  const [isEditingPledge, setIsEditingPledge] = useState(false)
  const [pledgeInput, setPledgeInput] = useState('')
  const [paymentFund, setPaymentFund] = useState('Building Fund')
  const [selectedMonths, setSelectedMonths] = useState([]) 
  const [paymentMonth, setPaymentMonth] = useState('2025-03')
  const [customAmount, setCustomAmount] = useState('')
  const [currentScripture, setCurrentScripture] = useState({ text: 'Loading scripture...', ref: '' })

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        const { data: pledgeData } = await supabase.from('pledges').select('amount').eq('member_code', currentUser.member_code).single()
        if (pledgeData) setMonthlyPledge(pledgeData.amount)

        const { data: paymentData } = await supabase.from('payments').select('*').eq('member_code', currentUser.member_code).eq('status', 'success')
        if (paymentData) setPayments(paymentData)
      }
      fetchUserData()
    }
  }, [currentUser])

  const fetchRandomScripture = async () => {
    try {
      const randomPromise = PROMISE_VERSES[Math.floor(Math.random() * PROMISE_VERSES.length)]
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(randomPromise.ref)}?translation=web`)
      const data = await response.json()
      let finalText = randomPromise.summary
      let finalRef = randomPromise.ref
      if (data && data.text) {
        finalText = data.text.trim()
        finalRef = data.reference
      }
      setCurrentScripture({ text: finalText, ref: finalRef })
      const wordCount = finalText.split(/\s+/).length
      const readingTimeMs = Math.max(6000, (wordCount / 3.5) * 1000 + 2000) 
      setTimeout(fetchRandomScripture, readingTimeMs)
    } catch (error) {
      setCurrentScripture({ text: 'God has plans of peace, hope and a good future for His people.', ref: 'Jeremiah 29:11' })
      setTimeout(fetchRandomScripture, 10000)
    }
  }

  useEffect(() => {
    if (currentUser) fetchRandomScripture()
  }, [currentUser])

  const generateMonths = () => {
    const months = []
    const years = [2025, 2026, 2027]
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    years.forEach(year => {
      monthNames.forEach((name, index) => {
        const monthStr = (index + 1).toString().padStart(2, '0')
        months.push({ value: `${year}-${monthStr}`, label: `${name} ${year}`, year: year })
      })
    })
    return months
  }
  const allMonths = generateMonths()

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const newCode = `TCA-${Math.floor(1000 + Math.random() * 9000)}`
    const { error } = await supabase.from('members').insert([{ full_name: signupName, phone_number: signupPhone, member_code: newCode, password: signupPassword }])
    if (error) {
      setErrorMsg("Error creating account.")
    } else {
      setGeneratedCode(newCode)
      setAuthMode('success')
      setSignupName(''); setSignupPhone(''); setSignupPassword('')
    }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    const { data, error } = await supabase.from('members').select('*').eq('member_code', loginCode).eq('password', loginPassword).single()
    if (error || !data) {
      setErrorMsg("Invalid Member Code or Password.")
    } else {
      setCurrentUser(data)
      setLoginCode(''); setLoginPassword('')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAuthMode('login')
    setPayments([])
    setMonthlyPledge(0)
    setSelectedMonths([])
  }

  const handleSavePledge = async (e) => {
    e.preventDefault()
    const amount = Number(pledgeInput)
    if (amount < MINIMUM_PAYMENT) {
      alert(`Minimum pledge is ₦${MINIMUM_PAYMENT.toLocaleString()}`)
      return
    }
    const { data: existing } = await supabase.from('pledges').select('id').eq('member_code', currentUser.member_code).single()
    let error;
    if (existing) {
      const { error: updateError } = await supabase.from('pledges').update({ amount, updated_at: new Date().toISOString() }).eq('member_code', currentUser.member_code)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from('pledges').insert([{ member_code: currentUser.member_code, amount }])
      error = insertError
    }
    if (error) {
      alert("Error saving pledge: " + error.message)
    } else {
      setMonthlyPledge(amount)
      setIsEditingPledge(false)
      setPledgeInput('')
      alert(`Your monthly pledge has been fixed at ₦${amount.toLocaleString()}`)
    }
  }

  const toggleMonthSelection = (monthValue) => {
    if (paymentFund !== 'Building Fund') return;
    const isPaid = payments.some(p => p.month_paid_for === monthValue && p.fund_type === 'Building Fund')
    if (isPaid) return; 
    setSelectedMonths(prev => {
      if (prev.includes(monthValue)) {
        return prev.filter(m => m !== monthValue)
      } else {
        return [...prev, monthValue]
      }
    })
  }

  const handlePaystackSuccess = async (reference) => {
    let totalAmount = 0;
    let monthsToRecord = [];
    if (paymentFund === 'Building Fund') {
      if (selectedMonths.length === 0) return alert("Please select at least one month.");
      totalAmount = monthlyPledge * selectedMonths.length;
      monthsToRecord = selectedMonths;
    } else {
      totalAmount = Number(customAmount);
      monthsToRecord = [paymentMonth]; 
    }

    const insertPromises = monthsToRecord.map(month => 
      supabase.from('payments').insert([{
        member_code: currentUser.member_code,
        amount: paymentFund === 'Building Fund' ? monthlyPledge : totalAmount, 
        fund_type: paymentFund,
        month_paid_for: month,
        paystack_reference: `${reference.reference}-${month}`, 
        status: 'success'
      }])
    );

    const results = await Promise.all(insertPromises);
    const hasError = results.some(r => r.error);

    if (hasError) {
      alert("Payment successful, but there was an error saving your records. Please contact the admin.");
    } else {
      alert(`Successfully recorded ₦${totalAmount.toLocaleString()} for ${paymentFund}!`);
      const { data: paymentData } = await supabase.from('payments').select('*').eq('member_code', currentUser.member_code).eq('status', 'success');
      if (paymentData) setPayments(paymentData);
      setCustomAmount('');
      setSelectedMonths([]);
    }
  }

  const getPaystackAmount = () => {
    if (paymentFund === 'Building Fund') {
      return (monthlyPledge * selectedMonths.length) * 100;
    }
    return Number(customAmount) * 100;
  }

  const paystackConfig = {
    reference: `TCA-${Date.now()}`,
    email: "payments@ctca.org",
    amount: getPaystackAmount(),
    publicKey: PAYSTACK_PUBLIC_KEY,
    text: 'Confirm Payment',
    onSuccess: (ref) => handlePaystackSuccess(ref),
    onClose: () => alert('Payment window closed.'),
  }

  if (currentUser) {
    const yearPayments = payments.filter(p => p.month_paid_for.startsWith(viewYear) && p.fund_type === 'Building Fund')
    const totalPaidThisYear = yearPayments.reduce((sum, p) => sum + p.amount, 0)
    const monthsPaidThisYear = yearPayments.length
    const targetForYear = monthlyPledge > 0 ? monthlyPledge * 12 : 0
    const progressPercentage = targetForYear > 0 ? Math.min((totalPaidThisYear / targetForYear) * 100, 100) : 0

    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h2>CTCA Building Fund</h2>
          <div className="header-actions">
            <span className="member-code">Code: <strong>{currentUser.member_code}</strong></span>
            <button onClick={handleLogout} className="logout-btn">Log Out</button>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="compact-top-bar">
            <div className="welcome-text">
              <h1>Welcome, {currentUser.full_name}</h1>
            </div>
            <div className="compact-scripture">
              <span className="scripture-label">PROMISE OF THE DAY</span>
              <p>"{currentScripture.text}" <strong>— {currentScripture.ref}</strong></p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="left-column">
              <div className="bright-panel">
                <div className="panel-header">
                  <h3>Contribution Progress</h3>
                  <select className="year-selector" value={viewYear} onChange={(e) => setViewYear(e.target.value)}>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
                <div className="progress-stats">
                  <span className="target-text">Target: {monthlyPledge > 0 ? `₦${targetForYear.toLocaleString()}` : 'Not set'}</span>
                  <span className="paid-text">₦{totalPaidThisYear.toLocaleString()} Paid</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
                <p className="months-fulfilled">
                  {monthsPaidThisYear} of 12 Months Fulfilled
                </p>
              </div>

              <div className="bright-panel tracker-panel">
                <h3>Monthly Tracker ({viewYear})</h3>
                <div className="month-grid">
                  {allMonths.filter(m => m.year.toString() === viewYear).map(month => {
                    const isPaid = payments.some(p => p.month_paid_for === month.value && p.fund_type === 'Building Fund')
                    return (
                      <div key={month.value} className={`month-box ${isPaid ? 'paid' : 'unpaid'}`}>
                        {month.label.split(' ')[0].substring(0, 3)}
                        <span>{isPaid ? '✓' : '✗'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="right-column">
              <div className="bright-panel pledge-panel">
                <h3>My Fixed Pledge</h3>
                {!isEditingPledge ? (
                  <div>
                    {monthlyPledge === 0 ? (
                      <p className="no-pledge-text">You have not set a fixed monthly pledge yet.</p>
                    ) : (
                      <div className="pledge-display">
                        <p className="pledge-label">Monthly Pledge</p>
                        <p className="pledge-amount">₦{monthlyPledge.toLocaleString()}</p>
                      </div>
                    )}
                    <button className="btn-secondary" onClick={() => { setIsEditingPledge(true); setPledgeInput(monthlyPledge || '') }}>
                      {monthlyPledge === 0 ? 'Set Pledge' : 'Change Pledge Amount'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSavePledge}>
                    <p className="form-instruction">Minimum is ₦{MINIMUM_PAYMENT.toLocaleString()}. This will be your fixed amount.</p>
                    <div className="dashboard-input-group">
                      <label>New Amount (₦)</label>
                      <input type="number" value={pledgeInput} onChange={(e) => setPledgeInput(e.target.value)} min={MINIMUM_PAYMENT} placeholder={`e.g. 5000`} required autoFocus />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">Save Pledge</button>
                      <button type="button" onClick={() => setIsEditingPledge(false)} className="btn-cancel">Cancel</button>
                    </div>
                  </form>
                )}
              </div>

              <div className="bright-panel payment-panel">
                <h3>Make a Payment</h3>
                <div className="dashboard-input-group">
                  <label>Select Fund</label>
                  <select className="styled-select" value={paymentFund} onChange={(e) => { setPaymentFund(e.target.value); setSelectedMonths([]); }}>
                    <option value="Building Fund">Building Fund (Pledge)</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Welfare Fund">Welfare Fund</option>
                  </select>
                </div>

                {paymentFund === 'Building Fund' ? (
                  <>
                    <label className="section-label">Select Month(s) to Pay</label>
                    <div className="month-selection-grid">
                      {allMonths.filter(m => m.year === 2025).map(month => {
                        const isPaid = payments.some(p => p.month_paid_for === month.value && p.fund_type === 'Building Fund')
                        const isSelected = selectedMonths.includes(month.value)
                        return (
                          <div key={month.value} className={`selection-box ${isPaid ? 'paid' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => toggleMonthSelection(month.value)}>
                            {month.label.split(' ')[0].substring(0, 3)}
                            {isPaid && <span className="check-mark">✓</span>}
                          </div>
                        )
                      })}
                    </div>
                    <div className="total-display">
                      <span>Total ({selectedMonths.length} months):</span>
                      <strong>₦{(monthlyPledge * selectedMonths.length).toLocaleString()}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dashboard-input-group">
                      <label>Select Month</label>
                      <select className="styled-select" value={paymentMonth} onChange={(e) => setPaymentMonth(e.target.value)}>
                        {allMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>
                    <div className="dashboard-input-group">
                      <label>Amount (₦)</label>
                      <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder="Enter amount" required />
                    </div>
                  </>
                )}

                {paymentFund === 'Building Fund' && monthlyPledge === 0 ? (
                  <button className="btn-primary" disabled style={{ marginTop: '1.5rem' }}>Set Pledge First</button>
                ) : (
                  <PaystackButton {...paystackConfig} className="btn-primary paystack-btn" style={{ marginTop: '1.5rem', width: '100%' }} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="split-screen">
      <div className="brand-side">
        <div className="temple-image-container">
          <img src="https://images.unsplash.com/photo-1438032005730-c779502df39b?q=80&w=2071&auto=format&fit=crop" alt="Church" />
        </div>
        <div className="brand-content">
          <h1>Charity Terbanacle Christian Assembly</h1>
          <h1><span>Building Fund</span> Project</h1>
          <p>"Haggai 1:8"</p>
        </div>
      </div>

      <div className="auth-side">
        <div className="auth-card">
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          {authMode === 'login' && (
            <>
              <h2>Welcome Back</h2>
              <p className="subtitle">Enter your Member Code to access your portal.</p>
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Member Code</label>
                  <input type="text" placeholder="e.g., TCA-1234" value={loginCode} onChange={(e) => setLoginCode(e.target.value.toUpperCase())} required />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Checking...' : 'Log In'}
                </button>
              </form>
              <div className="toggle-text">
                Don't have a code? 
                <button onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}>Register Here</button>
              </div>
            </>
          )}

          {authMode === 'signup' && (
            <>
              <h2>Create an Account</h2>
              <p className="subtitle">Register to get your unique Member Code.</p>
              <form onSubmit={handleRegister}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} required />
                </div>
                <div className="input-group">
                  <label>Phone Number (Optional)</label>
                  <input type="tel" placeholder="08012345678" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Create a Password</label>
                  <input type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Generate My Code'}
                </button>
              </form>
              <div className="toggle-text">
                Already have a code? 
                <button onClick={() => { setAuthMode('login'); setErrorMsg(''); }}>Log In</button>
              </div>
            </>
          )}

          {authMode === 'success' && (
            <div className="success-view">
              <h2>Registration Successful!</h2>
              <p className="subtitle">Please save this code. It is the only way you will log in.</p>
              <div className="code-display">{generatedCode}</div>
              <p className="warning-text">⚠️ Take a screenshot or write this down. Do not lose it.</p>
              <button className="btn-primary" onClick={() => setAuthMode('login')} style={{ marginTop: '2rem' }}>I have saved my code</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// --- MAIN APP ROUTER ---
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MemberApp />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}