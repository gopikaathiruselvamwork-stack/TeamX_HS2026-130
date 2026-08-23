"""
High-fidelity seed data for ScamX:
- Verified Opportunities (Top tier tech, design, marketing, research)
- Documented Real-World Scam Cases (WhatsApp task scams, fake offer letters, advance training fee traps)
- Company Knowledge Base (Official domains, known impersonation patterns)
"""

VERIFIED_COMPANIES = {
    "Google": {
        "official_domains": ["google.com", "careers.google.com", "abc.xyz"],
        "official_email_domains": ["@google.com"],
        "hiring_channels": ["Google Careers Portal", "Handshake", "LinkedIn (Verified Recruiter)"],
        "never_asks_for": ["Payment for equipment", "Security deposits", "Interviews on Telegram", "Crypto wallets"],
        "trust_score": 98,
        "industry": "Big Tech / Software"
    },
    "Microsoft": {
        "official_domains": ["microsoft.com", "careers.microsoft.com"],
        "official_email_domains": ["@microsoft.com"],
        "hiring_channels": ["Microsoft Action Center", "LinkedIn Verified"],
        "never_asks_for": ["Training fees", "Check cashing", "WhatsApp voice screening"],
        "trust_score": 98,
        "industry": "Big Tech / Cloud"
    },
    "Canva": {
        "official_domains": ["canva.com", "lifeatcanva.com"],
        "official_email_domains": ["@canva.com"],
        "hiring_channels": ["Canva Careers", "Greenhouse"],
        "never_asks_for": ["Upfront laptop fee", "Telegram direct message"],
        "trust_score": 96,
        "industry": "Design Tech"
    },
    "Linear": {
        "official_domains": ["linear.app"],
        "official_email_domains": ["@linear.app"],
        "hiring_channels": ["Linear Careers", "Ashby"],
        "never_asks_for": ["Task deposit", "Unverified third-party recruiters"],
        "trust_score": 97,
        "industry": "Productivity Software"
    },
    "Stripe": {
        "official_domains": ["stripe.com"],
        "official_email_domains": ["@stripe.com"],
        "hiring_channels": ["Stripe Jobs", "Campus Recruiting"],
        "never_asks_for": ["Application processing fee", "Personal bank credentials"],
        "trust_score": 99,
        "industry": "Fintech"
    },
    "NASA Jet Propulsion Laboratory": {
        "official_domains": ["jpl.nasa.gov", "nasa.gov"],
        "official_email_domains": ["@jpl.nasa.gov", "@nasa.gov"],
        "hiring_channels": ["NASA OSTEM Portal", "JPL Jobs"],
        "never_asks_for": ["Security clearance fee", "Gift cards"],
        "trust_score": 99,
        "industry": "Aerospace & Research"
    }
}

SEED_OPPORTUNITIES = [
    {
        "id": "opp_goog_swe_2026",
        "title": "Software Engineering Summer Intern 2026",
        "company": "Google",
        "company_logo": "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=128&auto=format&fit=crop&q=80",
        "location": "Mountain View, CA / New York, NY",
        "work_type": "Hybrid",
        "role_category": "Engineering",
        "stipend": "$54 - $62 / hour ($9,200/mo) + Relocation Stipend",
        "description": "Join Google's core infrastructure or Gemini product teams. You will collaborate on distributed systems, large scale AI model serving, and real-time backend microservices alongside senior engineers.",
        "requirements": ["Currently pursuing BS/MS in Computer Science or related field", "Experience with C++, Java, or Python", "Understanding of data structures and algorithmic complexity"],
        "trust_score": 98,
        "trust_level": "SAFE",
        "trust_reasons": [
            "Verified direct job posting on official careers.google.com",
            "Zero application fees or equipment charges",
            "Recruiter communication restricted to @google.com domains",
            "Strict anti-fraud hiring protocol verified by ScamX"
        ],
        "source_url": "https://careers.google.com/jobs/results/",
        "source_platform": "Official Careers",
        "posted_date": "2 days ago",
        "verified_badge": True
    },
    {
        "id": "opp_canva_uiux_2026",
        "title": "Product Design Intern (Generative Tools)",
        "company": "Canva",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
        "location": "Remote (US & Australia)",
        "work_type": "Remote",
        "role_category": "Design",
        "stipend": "$42 - $48 / hour ($7,000/mo)",
        "description": "Help design the next generation of creative AI tools. You'll partner with UX researchers, engineers, and product leads to prototype intuitive design workflows for millions of global creators.",
        "requirements": ["Portfolio demonstrating strong visual design & interaction systems", "Figma mastery and design token awareness", "Curiosity about human-AI interaction"],
        "trust_score": 96,
        "trust_level": "SAFE",
        "trust_reasons": [
            "Official ATS integration via Greenhouse/Canva",
            "Public mentor profile listed with company directory",
            "No upfront task fee or paid software requirements"
        ],
        "source_url": "https://lifeatcanva.com/internships",
        "source_platform": "Official Careers",
        "posted_date": "3 days ago",
        "verified_badge": True
    },
    {
        "id": "opp_linear_frontend_2026",
        "title": "Frontend Engineering Fellow",
        "company": "Linear",
        "company_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80",
        "location": "San Francisco, CA / Remote",
        "work_type": "Remote",
        "role_category": "Engineering",
        "stipend": "$50 / hour ($8,000/mo) + Workspace grant",
        "description": "Craft lightning-fast web applications with React, TypeScript, and WebGL. You will optimize rendering cycles, build high-framerate keyboard shortcuts, and contribute to open-source components.",
        "requirements": ["High proficiency with TypeScript & modern React", "Strong taste in UI performance (60fps interactions)", "Personal projects or open-source contributions"],
        "trust_score": 97,
        "trust_level": "SAFE",
        "trust_reasons": [
            "Direct posting on linear.app/careers",
            "Transparent compensation range compliant with state standards",
            "Authentic engineer referral system verified"
        ],
        "source_url": "https://linear.app/careers",
        "source_platform": "Ashby",
        "posted_date": "1 day ago",
        "verified_badge": True
    },
    {
        "id": "opp_stripe_data_2026",
        "title": "Data & ML Platform Intern",
        "company": "Stripe",
        "company_logo": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80",
        "location": "Seattle, WA / San Francisco, CA",
        "work_type": "Hybrid",
        "role_category": "Data",
        "stipend": "$55 / hour ($8,800/mo) + Housing Stipend",
        "description": "Build high-throughput streaming pipelines and anomaly detection models that protect billions of dollars in daily global economic transactions.",
        "requirements": ["Background in Statistics, CS, or Data Science", "Familiarity with SQL, Python, Spark, and ML fundamentals", "Passion for financial safety and system reliability"],
        "trust_score": 99,
        "trust_level": "SAFE",
        "trust_reasons": [
            "Verified via Stripe University Relations team",
            "Standard secure interview process via HackerRank and Karat",
            "Complies with official Equal Opportunity standards"
        ],
        "source_url": "https://stripe.com/jobs",
        "source_platform": "Official Careers",
        "posted_date": "4 days ago",
        "verified_badge": True
    },
    {
        "id": "opp_nasa_jpl_robotics_2026",
        "title": "Space Robotics & Computer Vision Research Intern",
        "company": "NASA Jet Propulsion Laboratory",
        "company_logo": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&auto=format&fit=crop&q=80",
        "location": "Pasadena, CA",
        "work_type": "On-site",
        "role_category": "Engineering",
        "stipend": "$36 - $44 / hour + NASA Travel Allowance",
        "description": "Develop visual odometry, terrain hazard detection, and autonomous navigation algorithms for future planetary rovers and orbital exploration probes.",
        "requirements": ["Enrolled in accredited STEM university program", "C++ or Python experience with OpenCV / ROS / PyTorch", "US Citizenship or eligible visa status required"],
        "trust_score": 99,
        "trust_level": "SAFE",
        "trust_reasons": [
            "Official federal government research fellowship",
            "Applications processed strictly through jpl.nasa.gov",
            "Zero fees required at any stage of candidacy"
        ],
        "source_url": "https://www.jpl.nasa.gov/edu/intern/apply/",
        "source_platform": "Official Careers",
        "posted_date": "Just now",
        "verified_badge": True
    }
]

SEED_FORUM_POSTS = [
    {
        "id": "post_scam_001",
        "company_name": "Apex Digital Global (Impersonating Amazon)",
        "opportunity_title": "Remote Data Entry & Product Reviewer ($80/hr)",
        "category": "task_scam",
        "summary": "WhatsApp message offering $500/day for 'liking YouTube videos' and reviewing products. Asked for $120 USDT recharge to unlock commission.",
        "detailed_experience": "I got contacted by a recruiter claiming to be from Amazon HR on WhatsApp. They had me do 3 demo tasks rating products and gave me $15 to build trust. Then on task 4 they claimed I hit a 'lucky booster' and had to deposit $120 via Binance crypto wallet to withdraw $400. Once paid, they demanded another $500. Total scam.",
        "communication_channel": "WhatsApp",
        "requested_amount": "$120 - $500 USDT",
        "author_name": "Marcus C. (Sophomore @ UC Irvine)",
        "tags": ["task scam", "advance fee", "crypto deposit", "WhatsApp recruiter", "unrealistic pay"],
        "upvotes": 47,
        "flagged": False,
        "risk_level": "HIGH_RISK",
        "created_at": "3 hours ago",
        "verified_report": True,
        "comments_count": 18
    },
    {
        "id": "post_scam_002",
        "company_name": "Nexus Systems Inc (Fake Domain: nexus-careers-global.online)",
        "opportunity_title": "Junior Python Developer Internship",
        "category": "fake_offer_letter",
        "summary": "Received instant offer letter after 15-minute Telegram text interview. Required $250 'mandatory equipment insurance' check.",
        "detailed_experience": "Applied on a shady job board. Within 2 hours received a Telegram link for an interview done entirely over text questions. Immediately sent me an offer letter with forged company stamps and offered $45/hr. But the email said they would mail me a $2,500 fake check to buy a MacBook from 'their authorized vendor'. Classic fake check scheme.",
        "communication_channel": "Telegram & Fake Email",
        "requested_amount": "$250 Insurance / Fake Check",
        "author_name": "Priya S. (Senior @ UT Austin)",
        "tags": ["fake offer letter", "telegram interview", "fake check scam", "equipment deposit"],
        "upvotes": 62,
        "flagged": False,
        "risk_level": "HIGH_RISK",
        "created_at": "1 day ago",
        "verified_report": True,
        "comments_count": 24
    },
    {
        "id": "post_scam_003",
        "company_name": "CloudNova Tech Labs",
        "opportunity_title": "AI Research Trainee (Unpaid -> Promised $4,000 Stipend)",
        "category": "fake_stipend",
        "summary": "Made students do 3 months of client production code under the guise of an 'evaluation assignment' then ghosted everyone with no certificate or stipend.",
        "detailed_experience": "They recruited 40 college students on LinkedIn. Made us build an entire Next.js and Firebase SaaS MVP for their real client. When the deadline hit, the CEO deleted the Slack workspace and blocked all student emails. Beware of unpaid internships that assign production code with zero mentorship.",
        "communication_channel": "LinkedIn / Slack",
        "requested_amount": "Free Labor / Unpaid",
        "author_name": "Alex K. (Junior @ Purdue)",
        "tags": ["fake stipend", "ghosting", "exploitative labor", "unpaid project"],
        "upvotes": 35,
        "flagged": False,
        "risk_level": "HIGH_RISK",
        "created_at": "2 days ago",
        "verified_report": True,
        "comments_count": 14
    },
    {
        "id": "post_legit_001",
        "company_name": "Google",
        "opportunity_title": "Software Engineering Summer Intern 2026",
        "category": "legit_experience",
        "summary": "Completed the hiring process through the official Google careers site. Clear communication, no fees, genuine technical rounds.",
        "detailed_experience": "Wanted to post a verified safe benchmark! Applied through careers.google.com with a student referral. All emails came strictly from @google.com. Interview consisted of 2 rounds of LeetCode style live coding on Google Docs/Meet. Recruiter was super clear that Google never asks for money or personal banking info upfront.",
        "communication_channel": "Official Portal & Google Meet",
        "requested_amount": "$0 (Legit)",
        "author_name": "Sarah T. (Junior @ Georgia Tech)",
        "tags": ["confirmed legit", "official portal", "technical interview", "zero fees"],
        "upvotes": 89,
        "flagged": False,
        "risk_level": "SAFE",
        "created_at": "3 days ago",
        "verified_report": True,
        "comments_count": 12
    }
]
