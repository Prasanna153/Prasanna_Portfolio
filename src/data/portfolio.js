// ─────────────────────────────────────────────────────────────
//  ALL WEBSITE TEXT LIVES IN THIS ONE FILE.
//  To change your name, skills, projects, education, links…
//  just edit the text below and save. No other file needs touching.
// ─────────────────────────────────────────────────────────────

export const profile = {
  name: 'Prasanna T',
  roles: ['Data Analyst', 'Power BI Developer', 'SQL Developer', 'Python Developer'],
  headline: 'I turn raw data into dashboards people can act on.',
  intro:
    'B.Tech Information Technology graduate based in Bangalore. I build interactive dashboards, predictive models and analytics projects with Power BI, SQL, Python and Excel.',
  focus: ['Predictive Modeling', 'Customer Churn', 'Data Visualization', 'ML & NLP'],
  location: 'Bangalore, India',
  languages: 'Tamil, English',
  email: 'tprasannait@gmail.com',
  phone: '7305145006',
  showPhone: false, // change to true if you want your phone number visible on the site
  github: 'https://github.com/Prasanna153',
  linkedin: 'https://www.linkedin.com/in/prasanna-tamilselvan-95022827b/',
  resume: '/resume/resume.pdf', // served by the backend; update it from the admin page, not by replacing this file
  photo: '/profile.jpg',
}

export const about = {
  paragraphs: [
    'I am an Information Technology graduate who enjoys the full path from a messy spreadsheet to a clear decision: cleaning data, finding the pattern, and presenting it in a dashboard that a non-technical person can read in a minute.',
    'Through internships and self-driven projects I have worked across data analytics, AI/ML and data visualization, using Python, Power BI, PostgreSQL, Streamlit and Excel. I am looking for a Data Analyst role where I can keep turning data into business decisions.',
  ],
  facts: [
    { label: 'Based in', value: 'Bangalore, India' },
    { label: 'Degree', value: 'B.Tech Information Technology, 2026' },
    { label: 'Languages', value: 'Tamil, English' },
    { label: 'Looking for', value: 'Data Analyst roles' },
  ],
}

export const skillGroups = [
  {
    title: 'Analytics & BI',
    icon: 'chart',
    items: ['Power BI', 'Power Query', 'Microsoft Excel', 'Data Visualization', 'Streamlit'],
  },
  {
    title: 'Python & Data',
    icon: 'code',
    items: ['Python', 'Pandas', 'NumPy', 'Scikit-learn'],
  },
  {
    title: 'Databases',
    icon: 'database',
    items: ['SQL', 'PostgreSQL'],
  },
  {
    title: 'ML & Modeling',
    icon: 'brain',
    items: ['Predictive Modeling', 'Customer Churn Analysis', 'NLP', 'Machine Learning'],
  },
  {
    title: 'Web & Tools',
    icon: 'wrench',
    items: ['HTML', 'CSS', 'Git', 'VS Code'],
  },
]

export const marqueeTools = [
  'Power BI', 'SQL', 'Python', 'Pandas', 'Excel', 'Power Query', 'PostgreSQL', 'Streamlit',
  'NumPy', 'Scikit-learn', 'NLP', 'Predictive Modeling', 'Customer Churn', 'Data Visualization',
]

// Add a "repo" link when a project is on GitHub, and an "image" (put the file in public/assets/projects/)
export const projects = [
  {
    id: 'tn-job-market-analysis',
    title: 'TN Job Market Analysis',
    kind: 'line',
    summary:
      'An interactive Streamlit dashboard that shows Tamil Nadu job market trends, demand and employment opportunities.',
    stack: ['Python', 'Pandas', 'Scikit-learn', 'Streamlit'],
    highlights: [
      'Built an interactive Streamlit dashboard to analyze Tamil Nadu job market trends, demand and employment opportunities.',
      'Used Python, Pandas and data visualization techniques to turn the data into actionable insights.',
      'Added dynamic charts and filters so anyone can explore the data by themselves.',
    ],
    repo: '',
    demo: '',
    image: '',
  },
  {
    id: 'business-insights-sales-dashboard',
    title: 'Business Insights & Sales Performance Dashboard',
    kind: 'bars',
    summary:
      'A Power BI dashboard that tracks sales performance, profitability and key business metrics in one place.',
    stack: ['Excel', 'Power BI'],
    highlights: [
      'Developed a Power BI dashboard to analyze sales performance, profitability and key business metrics.',
      'Designed it to support data-driven decision-making, so managers can see what is selling and what is not.',
    ],
    repo: '',
    demo: '',
    image: '',
  },
  {
    id: 'pizza-sales-dashboard',
    title: 'Pizza Sales Dashboard',
    kind: 'donut',
    summary:
      'An Excel dashboard built on 48,620 pizza order rows, with pivot tables and slicers for interactive filtering.',
    stack: ['Excel', 'Pivot Tables', 'Slicers'],
    highlights: [
      'Worked with a raw order table of 48,620 rows and organized it into pivot sheets.',
      'Built a dashboard sheet with slicers so the numbers can be filtered with a click.',
    ],
    repo: '',
    demo: '',
    image: '',
  },
]

// Add more internships here: they appear automatically on the timeline.
export const experience = [
  {
    role: 'UI/UX Intern',
    company: 'Skill Intern (Vidhyapeet Skill Intern Pvt. Ltd.)',
    period: '4 Jul 2025 – 4 Aug 2025',
    points: [
      'Completed a one-month UI/UX internship and received an internship completion certificate.',
      'Practised user-focused design thinking, which now shapes how I lay out dashboards and reports.',
    ],
  },
]

export const education = [
  {
    title: 'B.Tech, Information Technology',
    place: 'Info Institute of Engineering, Coimbatore',
    period: '2022 – 2026',
    result: 'CGPA 7.5 / 10',
  },
  {
    title: 'Higher Secondary (12th)',
    place: 'Government Higher Secondary School, Dharmapuri',
    period: '2021 – 2022',
    result: 'Percentage 50%',
  },
]

export const courses = [
  { title: 'Data Analyst', provider: 'Fast Learning Technologies', icon: 'chart' },
  { title: 'Master SQL for Data Science', provider: 'HCL GUVI', icon: 'database' },
  { title: 'Advanced Excel', provider: 'HCL GUVI', icon: 'table' },
  { title: 'Hands-On Data Visualization with Microsoft Power BI', provider: 'HCL GUVI', icon: 'chart' },
  { title: 'Python Programming Course in Tamil: Beginner to Advanced', provider: 'HCL GUVI · Aug 2023', icon: 'code' },
  { title: 'National & International Conference Participation', provider: 'Conferences', icon: 'award' },
]

export const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
]
