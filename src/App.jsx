import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import { PaystackButton } from 'paystack-react-lite'
import { Eye, EyeOff } from 'lucide-react'
import AdminDashboard from './AdminDashboard'

// --- BIBLE PROMISES LIST (ALL 55) ---

const PROMISE_VERSES = [
  {
    ref: "Jeremiah 29:11",
    text: "For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end."
  },
  {
    ref: "Deuteronomy 28:1-6",
    text: "1. And it shall come to pass, if thou shalt hearken diligently unto the voice of the LORD thy God, to observe and to do all his commandments which I command thee this day, that the LORD thy God will set thee on high above all nations of the earth:\n2. And all these blessings shall come on thee, and overtake thee, if thou shalt hearken unto the voice of the LORD thy God.\n3. Blessed shalt thou be in the city, and blessed shalt thou be in the field.\n4. Blessed shall be the fruit of thy body, and the fruit of thy ground, and the fruit of thy cattle, the increase of thy kine, and the flocks of thy sheep.\n5. Blessed shall be thy basket and thy store.\n6. Blessed shalt thou be when thou comest in, and blessed shalt thou be when thou goest out."
  },
  {
    ref: "Psalm 23:1-6",
    text: "1. The LORD is my shepherd; I shall not want.\n2. He maketh me to lie down in green pastures: he leadeth me beside the still waters.\n3. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.\n4. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.\n5. Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.\n6. Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever."
  },
  {
    ref: "Psalm 1:1-3",
    text: "1. Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.\n2. But his delight is in the law of the LORD; and in his law doth he meditate day and night.\n3. And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper."
  },
  {
    ref: "Isaiah 54:10",
    text: "For the mountains shall depart, and the hills be removed; but my kindness shall not depart from thee, neither shall the covenant of my peace be removed, saith the LORD that hath mercy on thee."
  },
  {
    ref: "Proverbs 3:5-6",
    text: "5. Trust in the LORD with all thine heart; and lean not unto thine own understanding.\n6. In all thy ways acknowledge him, and he shall direct thy paths."
  },
  {
    ref: "Psalm 84:11",
    text: "For the LORD God is a sun and shield: the LORD will give grace and glory: no good thing will he withhold from them that walk uprightly."
  },
  {
    ref: "Joel 2:25-27",
    text: "25. And I will restore to you the years that the locust hath eaten, the cankerworm, and the caterpiller, and the palmerworm, my great army which I sent among you.\n26. And ye shall eat in plenty, and be satisfied, and praise the name of the LORD your God, that hath dealt wondrously with you: and my people shall never be ashamed.\n27. And ye shall know that I am in the midst of Israel, and that I am the LORD your God, and none else: and my people shall never be ashamed."
  },
  {
    ref: "Isaiah 60:1-5",
    text: "1. Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.\n2. For, behold, the darkness shall cover the earth, and gross darkness the people: but the LORD shall arise upon thee, and his glory shall be seen upon thee.\n3. And the Gentiles shall come to thy light, and kings to the brightness of thy rising.\n4. Lift up thine eyes round about, and see: all they gather themselves together, they come to thee: thy sons shall come from far, and thy daughters shall be nursed at thy side.\n5. Then thou shalt see, and flow together, and thine heart shall fear, and be enlarged; because the abundance of the sea shall be converted unto thee, the forces of the Gentiles shall come unto thee."
  },
  {
    ref: "Psalm 65:11",
    text: "Thou crownest the year with thy goodness; and thy paths drop fatness."
  },
  {
    ref: "Philippians 4:19",
    text: "But my God shall supply all your need according to his riches in glory by Christ Jesus."
  },
  {
    ref: "2 Corinthians 9:8",
    text: "And God is able to make all grace abound toward you; that ye, always having all sufficiency in all things, may abound to every good work:"
  },
  {
    ref: "Deuteronomy 8:18",
    text: "But thou shalt remember the LORD thy God: for it is he that giveth thee power to get wealth, that he may establish his covenant which he sware unto thy fathers, as it is this day."
  },
  {
    ref: "Malachi 3:10-12",
    text: "10. Bring ye all the tithes into the storehouse, that there may be meat in mine house, and prove me now herewith, saith the LORD of hosts, if I will not open you the windows of heaven, and pour you out a blessing, that there shall not be room enough to receive it.\n11. And I will rebuke the devourer for your sakes, and he shall not destroy the fruits of your ground; neither shall your vine cast her fruit before the time in the field, saith the LORD of hosts.\n12. And all nations shall call you blessed: for ye shall be a delightsome land, saith the LORD of hosts."
  },
  {
    ref: "Psalm 34:10",
    text: "The young lions do lack, and suffer hunger: but they that seek the LORD shall not want any good thing."
  },
  {
    ref: "Proverbs 10:22",
    text: "The blessing of the LORD, it maketh rich, and he addeth no sorrow with it."
  },
  {
    ref: "Matthew 6:31-33",
    text: "31. Therefore take no thought, saying, What shall we eat? or, What shall we drink? or, Wherewithal shall we be clothed?\n32. (For after all these things do the Gentiles seek:) for your heavenly Father knoweth that ye have need of all these things.\n33. But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you."
  },
  {
    ref: "Luke 6:38",
    text: "Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over, shall men give into your bosom. For with the same measure that ye mete withal it shall be measured to you again."
  },
  {
    ref: "Psalm 112:1-3",
    text: "1. Praise ye the LORD. Blessed is the man that feareth the LORD, that delighteth greatly in his commandments.\n2. His seed shall be mighty upon earth: the generation of the upright shall be blessed.\n3. Wealth and riches shall be in his house: and his righteousness endureth for ever."
  },
  {
    ref: "3 John 1:2",
    text: "Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth."
  },
  {
    ref: "Isaiah 41:10",
    text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness."
  },
  {
    ref: "Psalm 91:1-16",
    text: "1. He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.\n2. I will say of the LORD, He is my refuge and my fortress: my God; in him will I trust.\n3. Surely he shall deliver thee from the snare of the fowler, and from the noisome pestilence.\n4. He shall cover thee with his feathers, and under his wings shalt thou trust: his truth shall be thy shield and buckler.\n5. Thou shalt not be afraid for the terror by night; nor for the arrow that flieth by day;\n6. Nor for the pestilence that walketh in darkness; nor for the destruction that wasteth at noonday.\n7. A thousand shall fall at thy side, and ten thousand at thy right hand; but it shall not come nigh thee.\n8. Only with thine eyes shalt thou behold and see the reward of the wicked.\n9. Because thou hast made the LORD, which is my refuge, even the most High, thy habitation;\n10. There shall no evil befall thee, neither shall any plague come nigh thy dwelling.\n11. For he shall give his angels charge over thee, to keep thee in all thy ways.\n12. They shall bear thee up in their hands, lest thou dash thy foot against a stone.\n13. Thou shalt tread upon the lion and adder: the young lion and the dragon shalt thou trample under feet.\n14. Because he hath set his love upon me, therefore will I deliver him: I will set him on high, because he hath known my name.\n15. He shall call upon me, and I will answer him: I will be with him in trouble; I will deliver him, and honour him.\n16. With long life will I satisfy him, and shew him my salvation."
  },
  {
    ref: "Isaiah 54:17",
    text: "No weapon that is formed against thee shall prosper; and every tongue that shall rise against thee in judgment thou shalt condemn. This is the heritage of the servants of the LORD, and their righteousness is of me, saith the LORD."
  },
  {
    ref: "Romans 8:31-39",
    text: "31. What shall we then say to these things? If God be for us, who can be against us?\n32. He that spared not his own Son, but delivered him up for us all, how shall he not with him also freely give us all things?\n33. Who shall lay any thing to the charge of God's elect? It is God that justifieth.\n34. Who is he that condemneth? It is Christ that died, yea rather, that is risen again, who is even at the right hand of God, who also maketh intercession for us.\n35. Who shall separate us from the love of Christ? shall tribulation, or distress, or persecution, or famine, or nakedness, or peril, or sword?\n36. As it is written, For thy sake we are killed all the day long; we are accounted as sheep for the slaughter.\n37. Nay, in all these things we are more than conquerors through him that loved us.\n38. For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,\n39. Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord."
  },
  {
    ref: "Deuteronomy 31:8",
    text: "And the LORD, he it is that doth go before thee; he will be with thee, he will not fail thee, neither forsake thee: fear not, neither be dismayed."
  },
  {
    ref: "Exodus 14:13-14",
    text: "13. And Moses said unto the people, Fear ye not, stand still, and see the salvation of the LORD, which he will shew to you to day: for the Egyptians whom ye have seen to day, ye shall see them again no more for ever.\n14. The LORD shall fight for you, and ye shall hold your peace."
  },
  {
    ref: "2 Thessalonians 3:3",
    text: "But the Lord is faithful, who shall stablish you, and keep you from evil."
  },
  {
    ref: "Psalm 121:1-8",
    text: "1. I will lift up mine eyes unto the hills, from whence cometh my help.\n2. My help cometh from the LORD, which made heaven and earth.\n3. He will not suffer thy foot to be moved: he that keepeth thee will not slumber.\n4. Behold, he that keepeth Israel shall neither slumber nor sleep.\n5. The LORD is thy keeper: the LORD is thy shade upon thy right hand.\n6. The sun shall not smite thee by day, nor the moon by night.\n7. The LORD shall preserve thee from all evil: he shall preserve thy soul.\n8. The LORD shall preserve thy going out and thy coming in from this time forth, and even for evermore."
  },
  {
    ref: "1 John 5:4-5",
    text: "4. For whatsoever is born of God overcometh the world: and this is the victory that overcometh the world, even our faith.\n5. Who is he that overcometh the world, but he that believeth that Jesus is the Son of God?"
  },
  {
    ref: "Romans 16:20",
    text: "And the God of peace shall bruise Satan under your feet shortly. The grace of our Lord Jesus Christ be with you. Amen."
  },
  {
    ref: "Jeremiah 30:17",
    text: "For I will restore health unto thee, and I will heal thee of thy wounds, saith the LORD; because they called thee an Outcast, saying, This is Zion, whom no man seeketh after."
  },
  {
    ref: "Isaiah 53:4-5",
    text: "4. Surely he hath borne our griefs, and carried our sorrows: yet we did esteem him stricken, smitten of God, and afflicted.\n5. But he was wounded for our transgressions, he was bruised for our iniquities: the chastisement of our peace was upon him; and with his stripes we are healed."
  },
  {
    ref: "Exodus 15:26",
    text: "And said, If thou wilt diligently hearken to the voice of the LORD thy God, and wilt do that which is right in his sight, and wilt give ear to his commandments, and keep all his statutes, I will put none of these diseases upon thee, which I have brought upon the Egyptians: for I am the LORD that healeth thee."
  },
  {
    ref: "Psalm 103:1-5",
    text: "1. Bless the LORD, O my soul: and all that is within me, bless his holy name.\n2. Bless the LORD, O my soul, and forget not all his benefits:\n3. Who forgiveth all thine iniquities; who healeth all thy diseases;\n4. Who redeemeth thy life from destruction; who crowneth thee with lovingkindness and tender mercies;\n5. Who satisfieth thy mouth with good things; so that thy youth is renewed like the eagle's."
  },
  {
    ref: "Isaiah 40:29-31",
    text: "29. He giveth power to the faint; and to them that have no might he increaseth strength.\n30. Even the youths shall faint and be weary, and the young men shall utterly fall:\n31. But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint."
  },
  {
    ref: "Proverbs 4:20-22",
    text: "20. My son, attend to my words; incline thine ear unto my sayings.\n21. Let them not depart from thine eyes; keep them in the midst of thine heart.\n22. For they are life unto those that find them, and health to all their flesh."
  },
  {
    ref: "Psalm 91:16",
    text: "With long life will I satisfy him, and shew him my salvation."
  },
  {
    ref: "Isaiah 46:4",
    text: "And even to your old age I am he; and even to hoar hairs will I carry you: I have made, and I will bear; even I will carry, and will deliver you."
  },
  {
    ref: "Jeremiah 33:6",
    text: "Behold, I will bring it health and cure, and I will cure them, and will reveal unto them the abundance of peace and truth."
  },
  {
    ref: "1 Peter 5:10",
    text: "But the God of all grace, who hath called us unto his eternal glory by Christ Jesus, after that ye have suffered a while, make you perfect, stablish, strengthen, settle you."
  },
  {
    ref: "Psalm 5:12",
    text: "For thou, LORD, wilt bless the righteous; with favour wilt thou compass him as with a shield."
  },
  {
    ref: "Isaiah 43:18-19",
    text: "18. Remember ye not the former things, neither consider the things of old.\n19. Behold, I will do a new thing; now it shall spring forth; shall ye not know it? I will even make a way in the wilderness, and rivers in the desert."
  },
  {
    ref: "Deuteronomy 28:13",
    text: "And the LORD shall make thee the head, and not the tail; and thou shalt be above only, and thou shalt not be beneath; if that thou hearken unto the commandments of the LORD thy God, which I command thee this day, to observe and to do them:"
  },
  {
    ref: "Psalm 75:6-7",
    text: "6. For promotion cometh neither from the east, nor from the west, nor from the south.\n7. But God is the judge: he putteth down one, and setteth up another."
  },
  {
    ref: "Proverbs 4:18",
    text: "But the path of the just is as the shining light, that shineth more and more unto the perfect day."
  },
  {
    ref: "Isaiah 61:7",
    text: "For your shame ye shall have double; and for confusion they shall rejoice in their portion: therefore in their land they shall possess the double: everlasting joy shall be unto them."
  },
  {
    ref: "John 14:27",
    text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid."
  },
  {
    ref: "Ephesians 3:20",
    text: "Now unto him that is able to do exceeding abundantly above all that we ask or think, according to the power that worketh in us,"
  },
  {
    ref: "Zechariah 9:12",
    text: "Turn you to the strong hold, ye prisoners of hope: even to day do I declare that I will render double unto thee;"
  },
  {
    ref: "Romans 8:28",
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose."
  },
  {
    ref: "Genesis 12:1-3",
    text: "1. Now the LORD had said unto Abram, Get thee out of thy country, and from thy kindred, and from thy father's house, unto a land that I will shew thee:\n2. And I will make of thee a great nation, and I will bless thee, and make thy name great; and thou shalt be a blessing:\n3. And I will bless them that bless thee, and curse him that curseth thee: and in thee shall all families of the earth be blessed."
  },
  {
    ref: "Isaiah 58:11",
    text: "And the LORD shall guide thee continually, and satisfy thy soul in drought, and make fat thy bones: and thou shalt be like a watered garden, and like a spring of water, whose waters fail not."
  },
  {
    ref: "Psalm 37:4-5",
    text: "4. Delight thyself also in the LORD; and he shall give thee the desires of thine heart.\n5. Commit thy way unto the LORD; trust also in him; and he shall bring it to pass."
  },
  {
    ref: "Matthew 11:28-30",
    text: "28. Come unto me, all ye that labour and are heavy laden, and I will give you rest.\n29. Take my yoke upon you, and learn of me; for I am meek and lowly in heart: and ye shall find rest unto your souls.\n30. For my yoke is easy, and my burden is light."
  },
  {
    ref: "Revelation 21:3-7",
    text: "3. And I heard a great voice out of heaven saying, Behold, the tabernacle of God is with men, and he will dwell with them, and they shall be his people, and God himself shall be with them, and be their God.\n4. And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.\n5. And he that sat upon the throne said, Behold, I make all things new. And he said unto me, Write: for these words are true and faithful.\n6. And he said unto me, It is done. I am Alpha and Omega, the beginning and the end. I will give unto him that is athirst of the fountain of the water of life freely.\n7. He that overcometh shall inherit all things; and I will be his God, and he shall be my son."
  }
];

const MINIMUM_PAYMENT = 2000
const PAYSTACK_PUBLIC_KEY = "pk_test_bde5a22d65ccb49fa64a2ba08ef180273eafe866" 

// ==========================================
// --- ADMIN LOGIN & ROUTE ---
// ==========================================
function AdminRoute() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('ctca_admin') === 'true'
  })
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  // Admin password visibility
  const [showAdminPassword, setShowAdminPassword] = useState(false)

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (password === "CTCA2025!") {
      setIsAdminAuthenticated(true)
      localStorage.setItem('ctca_admin', 'true')
    } else {
      setError("Invalid Admin Password")
    }
  }

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false)
    localStorage.removeItem('ctca_admin')
  }

  if (isAdminAuthenticated) {
    return <AdminDashboard onLogout={handleAdminLogout} />
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
            <div style={{ position: 'relative' }}>
              <input 
                type={showAdminPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoFocus
                style={{ paddingRight: '40px' }}
              />
              <button 
                type="button"
                onClick={() => setShowAdminPassword(!showAdminPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
  
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ctca_user')
    return saved ? JSON.parse(saved) : null
  })

  const [loginCode, setLoginCode] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  
  // State for password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)

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
      if (error.code === '23505') {
        setErrorMsg("An account with this exact name already exists. Please add a middle name or initial.")
      } else {
        setErrorMsg("Error creating account. Please try again.")
      }
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
      localStorage.setItem('ctca_user', JSON.stringify(data)) 
      setLoginCode(''); setLoginPassword('')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('ctca_user') 
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
    if (monthlyPledge === 0) {
      alert("Please set your monthly pledge before selecting months to pay.");
      return;
    }
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
          <h1>Charity Tabernacle Christian Assembly</h1>
          <h1><span>Fund App</span> Project</h1>
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
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      required 
                      style={{ paddingRight: '40px' }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Checking...' : 'Log In'}
                </button>
              </form>
              
              <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center', marginTop: '1rem' }}>
                Forgot your code? Please contact the church administrator to recover it.
              </p>

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
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showSignupPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={signupPassword} 
                      onChange={(e) => setSignupPassword(e.target.value)} 
                      required 
                      minLength={6} 
                      title="Password must be at least 6 characters"
                      style={{ paddingRight: '40px' }}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                      {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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