export const SECTORS = [
  'Renewable Energy',
  'Electrical & Construction',
  'Manufacturing',
  'Automotive',
  'Textiles & Apparel',
  'Healthcare',
  'Tourism & Hospitality',
  'IT & BPM',
  'Logistics & Warehousing',
]

export const STATES = [
  {
    id: 'gj',
    name: 'Gujarat',
    districts: [
      { id: 'gj-ahmedabad', name: 'Ahmedabad', lon: 72.5714, lat: 23.0225, weight: 1.0 },
      { id: 'gj-surat', name: 'Surat', lon: 72.8311, lat: 21.1702, weight: 0.86 },
      { id: 'gj-vadodara', name: 'Vadodara', lon: 73.1812, lat: 22.3072, weight: 0.7 },
      { id: 'gj-rajkot', name: 'Rajkot', lon: 70.8022, lat: 22.3039, weight: 0.62 },
      { id: 'gj-gandhinagar', name: 'Gandhinagar', lon: 72.6369, lat: 23.2156, weight: 0.45 },
      { id: 'gj-bhavnagar', name: 'Bhavnagar', lon: 72.1519, lat: 21.7645, weight: 0.4 },
    ],
  },
  {
    id: 'mh',
    name: 'Maharashtra',
    districts: [
      { id: 'mh-pune', name: 'Pune', lon: 73.8567, lat: 18.5204, weight: 0.95 },
      { id: 'mh-mumbai', name: 'Mumbai Suburban', lon: 72.8777, lat: 19.076, weight: 1.0 },
      { id: 'mh-nagpur', name: 'Nagpur', lon: 79.0882, lat: 21.1458, weight: 0.66 },
      { id: 'mh-nashik', name: 'Nashik', lon: 73.7942, lat: 19.9975, weight: 0.54 },
      { id: 'mh-aurangabad', name: 'Chh. Sambhajinagar', lon: 75.3433, lat: 19.8762, weight: 0.58 },
    ],
  },
  {
    id: 'ka',
    name: 'Karnataka',
    districts: [
      { id: 'ka-bengaluru', name: 'Bengaluru Urban', lon: 77.5946, lat: 12.9716, weight: 1.0 },
      { id: 'ka-mysuru', name: 'Mysuru', lon: 76.6394, lat: 12.2958, weight: 0.52 },
      { id: 'ka-dakshina-kannada', name: 'Dakshina Kannada', lon: 74.856, lat: 12.87, weight: 0.44 },
      { id: 'ka-belagavi', name: 'Belagavi', lon: 74.5, lat: 15.85, weight: 0.47 },
    ],
  },
  {
    id: 'tn',
    name: 'Tamil Nadu',
    districts: [
      { id: 'tn-chennai', name: 'Chennai', lon: 80.2707, lat: 13.0827, weight: 1.0 },
      { id: 'tn-coimbatore', name: 'Coimbatore', lon: 76.9558, lat: 11.0168, weight: 0.72 },
      { id: 'tn-tiruppur', name: 'Tiruppur', lon: 77.3411, lat: 11.1085, weight: 0.6 },
    ],
  },
  {
    id: 'ap',
    name: 'Andhra Pradesh',
    districts: [
      { id: 'ap-visakhapatnam', name: 'Visakhapatnam', lon: 83.2989, lat: 17.6868, weight: 0.92 },
      { id: 'ap-vijayawada', name: 'Vijayawada', lon: 80.648, lat: 16.5062, weight: 0.78 },
      { id: 'ap-tirupati', name: 'Tirupati', lon: 79.4192, lat: 13.6288, weight: 0.6 },
      { id: 'ap-kurnool', name: 'Kurnool', lon: 78.0322, lat: 15.8281, weight: 0.5 },
    ],
  },
  {
    id: 'up',
    name: 'Uttar Pradesh',
    districts: [
      { id: 'up-lucknow', name: 'Lucknow', lon: 80.9462, lat: 26.8467, weight: 0.84 },
      { id: 'up-kanpur', name: 'Kanpur Nagar', lon: 80.3319, lat: 26.4499, weight: 0.7 },
      { id: 'up-varanasi', name: 'Varanasi', lon: 82.9739, lat: 25.3176, weight: 0.56 },
    ],
  },
  {
    id: 'rj',
    name: 'Rajasthan',
    districts: [
      { id: 'rj-jaipur', name: 'Jaipur', lon: 75.7873, lat: 26.9124, weight: 0.88 },
      { id: 'rj-jodhpur', name: 'Jodhpur', lon: 73.0243, lat: 26.2389, weight: 0.5 },
    ],
  },
]

export const OCCUPATIONS = [
  {
    id: 'solar-pv-technician', salaryBand: [18000, 32000],
    title: 'Solar PV Technician',
    nco: '3111.07',
    sector: 'Renewable Energy',
    baseDemand: 5200,
    qp: 'Q060101 — Solar PV Module & Array Installation',
    nos: ['NOS/Q06010101', 'NOS/Q06010102', 'NOS/Q06010107'],
    nsqf: 4,
    qualifications: ['Certificate in Solar PV Technology (NSQF L4)', 'Diploma in Electrical Engineering'],
    skills: [
      { name: 'Solar panel installation', weight: 96 },
      { name: 'Electrical safety & LOTO', weight: 88 },
      { name: 'PV system maintenance', weight: 81 },
      { name: 'Inverter & array testing', weight: 74 },
      { name: 'Equipment handling', weight: 63 },
    ],
    summary:
      'Rooftop and utility-scale solar rollout across Gujarat and western India is pulling demand well ahead of the certified technician base.',
  },
  {
    id: 'electrician', salaryBand: [20000, 34000],
    title: 'Electrician (General)',
    nco: '7241.01',
    sector: 'Electrical & Construction',
    baseDemand: 6400,
    qp: 'Q070101 — Electrical Installation & Maintenance',
    nos: ['NOS/Q07010101', 'NOS/Q07010103', 'NOS/Q07010111'],
    nsqf: 4,
    qualifications: ['NCVT Diploma in Electrician', 'ITI Electrician'],
    skills: [
      { name: 'Wiring & circuit testing', weight: 94 },
      { name: 'Electrical safety standards', weight: 89 },
      { name: 'Load calculation', weight: 76 },
      { name: 'Fault diagnosis', weight: 72 },
      { name: 'Blueprint reading', weight: 58 },
    ],
    summary:
      'Construction and industrial retrofit activity keeps electrician demand elevated across all surveyed districts.',
  },
  {
    id: 'welder', salaryBand: [16000, 27000],
    title: 'Welder (Arc & Gas)',
    nco: '7131.01',
    sector: 'Manufacturing',
    baseDemand: 4700,
    qp: 'Q060103 — Welding & Cutting (SMAW/GTAW)',
    nos: ['NOS/Q06010301', 'NOS/Q06010304'],
    nsqf: 3,
    qualifications: ['NCVT Welder', 'ITI Welder (Gas & Electric)'],
    skills: [
      { name: 'Arc welding (SMAW)', weight: 95 },
      { name: 'Blueprint reading', weight: 78 },
      { name: 'Metallurgy basics', weight: 71 },
      { name: 'Workpiece measurement', weight: 69 },
      { name: 'PPE & fume safety', weight: 66 },
    ],
    summary:
      'Fabrication, pressure-vessel and shipbuilding orders keep welder demand firm while certified supply stays thin.',
  },
  {
    id: 'cnc-machinist', salaryBand: [22000, 38000],
    title: 'CNC Machinist',
    nco: '7311.01',
    sector: 'Manufacturing',
    baseDemand: 3600,
    qp: 'Q060112 — CNC Machining Centre Operation',
    nos: ['NOS/Q06011201', 'NOS/Q06011205'],
    nsqf: 5,
    qualifications: ['Diploma in Mechanical Engineering', 'Advance NCVT Machinist'],
    skills: [
      { name: 'G-code / M-code programming', weight: 92 },
      { name: 'Precision measurement', weight: 85 },
      { name: 'Tool & fixture setting', weight: 80 },
      { name: 'CAD/CAM interpretation', weight: 70 },
      { name: 'Preventive maintenance', weight: 61 },
    ],
    summary:
      'Precision component clusters are adding CNC capacity faster than operators with verified programming competency.',
  },
  {
    id: 'motor-vehicle-mechanic', salaryBand: [14000, 24000],
    title: 'Motor Vehicle Mechanic',
    nco: '7137.01',
    sector: 'Automotive',
    baseDemand: 4100,
    qp: 'Q070108 — Two & Four Wheeler Service',
    nos: ['NOS/Q07010801', 'NOS/Q07010806'],
    nsqf: 4,
    qualifications: ['Certificate in Automobile Engineering', 'ITI Motor Vehicle Mechanic'],
    skills: [
      { name: 'Engine diagnostics', weight: 91 },
      { name: 'Two-wheeler repair', weight: 84 },
      { name: 'Electrical systems', weight: 77 },
      { name: 'Customer handover', weight: 60 },
      { name: 'Workshop safety', weight: 73 },
    ],
    summary:
      'Two-wheeler and EV service networks are expanding, but workshop-trained mechanics remain concentrated in metros.',
  },
  {
    id: 'sewing-machine-operator', salaryBand: [11000, 19000],
    title: 'Sewing Machine Operator',
    nco: '7435.01',
    sector: 'Textiles & Apparel',
    baseDemand: 7200,
    qp: 'Q060121 — Industrial Sewing & Garment Assembly',
    nos: ['NOS/Q06012101', 'NOS/Q06012103'],
    nsqf: 3,
    qualifications: ['Certificate in Garment Making', 'ITI Sewing Technology'],
    skills: [
      { name: 'Industrial stitching', weight: 97 },
      { name: 'Pattern reading', weight: 82 },
      { name: 'Quality inspection', weight: 79 },
      { name: 'Machine maintenance', weight: 64 },
      { name: 'Production discipline', weight: 71 },
    ],
    summary:
      'Apparel export clusters generate high volume demand; supply is large but only partly competency-matched.',
  },
  {
    id: 'nursing-assistant', salaryBand: [15000, 26000],
    title: 'Certified Nursing Assistant',
    nco: '3221.01',
    sector: 'Healthcare',
    baseDemand: 3900,
    qp: 'Q080102 — Patient Care & Assistance',
    nos: ['NOS/Q08010201', 'NOS/Q08010204'],
    nsqf: 4,
    qualifications: ['Certificate in Patient Care (NSQF L4)', 'GNM (lateral)'],
    skills: [
      { name: 'Patient hygiene & care', weight: 93 },
      { name: 'Vital sign monitoring', weight: 86 },
      { name: 'Infection control', weight: 88 },
      { name: 'Emergency response', weight: 69 },
      { name: 'Medical record keeping', weight: 57 },
    ],
    summary:
      'Hospital and long-term care expansion is outpacing certified assistant output in tier-1 and tier-2 districts.',
  },
  {
    id: 'food-beverage-server', salaryBand: [12000, 21000],
    title: 'Food & Beverage Service Staff',
    nco: '5132.01',
    sector: 'Tourism & Hospitality',
    baseDemand: 4400,
    qp: 'Q090104 — Food & Beverage Service',
    nos: ['NOS/Q09010401', 'NOS/Q09010403'],
    nsqf: 3,
    qualifications: ['Certificate in Food & Beverage Service', 'Hospitality foundation courses'],
    skills: [
      { name: 'Service etiquette', weight: 90 },
      { name: 'Order & POS handling', weight: 83 },
      { name: 'Food safety & hygiene', weight: 87 },
      { name: 'Beverage knowledge', weight: 66 },
      { name: 'Guest complaint handling', weight: 59 },
    ],
    summary:
      'Tourism and QSR growth keeps service staffing demand strong, with seasonal swings around festival and holiday quarters.',
  },
  {
    id: 'data-entry-operator', salaryBand: [13000, 23000],
    title: 'Data Entry Operator',
    nco: '4110.03',
    sector: 'IT & BPM',
    baseDemand: 3300,
    qp: 'Q050106 — Data Entry & Office Applications',
    nos: ['NOS/Q05010601', 'NOS/Q05010602'],
    nsqf: 3,
    qualifications: ['Certificate in Computer Applications', 'O Level'],
    skills: [
      { name: 'Typing speed & accuracy', weight: 95 },
      { name: 'Spreadsheet handling', weight: 79 },
      { name: 'Data validation', weight: 74 },
      { name: 'Confidentiality practice', weight: 68 },
      { name: 'Basic troubleshooting', weight: 52 },
    ],
    summary:
      'BPO and back-office demand is stable but flattening as automation absorbs routine keying work.',
  },
  {
    id: 'forklift-operator', salaryBand: [15000, 25000],
    title: 'Warehouse Forklift Operator',
    nco: '8322.01',
    sector: 'Logistics & Warehousing',
    baseDemand: 3100,
    qp: 'Q100102 — Powered Industrial Truck Operation',
    nos: ['NOS/Q10010201', 'NOS/Q10010202'],
    nsqf: 4,
    qualifications: ['Certificate in Material Handling', 'Rack & Forklift endorsement'],
    skills: [
      { name: 'Forklift handling', weight: 94 },
      { name: 'Load stability', weight: 85 },
      { name: 'Warehouse safety', weight: 90 },
      { name: 'Inventory scanning', weight: 67 },
      { name: 'Dock coordination', weight: 61 },
    ],
    summary:
      'E-commerce fulfilment parks are adding material-handling roles faster than licensed operators are certified.',
  },
]

export const findState = (id) => STATES.find((s) => s.id === id)
export const findDistrict = (id) => {
  for (const s of STATES) {
    const d = s.districts.find((x) => x.id === id)
    if (d) return { state: s, district: d }
  }
  return null
}
export const findOccupation = (id) => OCCUPATIONS.find((o) => o.id === id)
export const allDistricts = () => STATES.flatMap((s) => s.districts.map((d) => ({ ...d, stateId: s.id, stateName: s.name })))
