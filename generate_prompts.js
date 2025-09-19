// Script to generate hundreds of professional AI prompts
// This creates a comprehensive library of expert-level prompts

const professionalPrompts = [];

// Executive & Strategy Prompts
const executivePrompts = [
  {
    id: "exec-002", title: "Board Meeting Preparation", 
    description: "Comprehensive board meeting preparation with agenda, financials, and strategic updates",
    category: "executive", subcategory: "board-communications",
    content: `Prepare a comprehensive board meeting package for [COMPANY_NAME] covering [MEETING_FOCUS]. Include:

1. **Executive Summary Dashboard**:
   - Key metrics: [KEY_METRICS]
   - Performance vs targets
   - Critical decisions needed

2. **Financial Performance**:
   - Revenue: [CURRENT_REVENUE] vs [TARGET_REVENUE]
   - Cash position: [CASH_POSITION]
   - Burn rate and runway
   - Key financial ratios

3. **Strategic Updates**:
   - Progress on strategic initiatives: [INITIATIVES]
   - Market developments
   - Competitive landscape changes

4. **Operational Highlights**:
   - Team updates and key hires
   - Product milestones
   - Customer wins: [KEY_CUSTOMERS]

5. **Risk Assessment**:
   - Top 3 business risks
   - Mitigation strategies
   - Board input needed

6. **Forward-Looking Items**:
   - Next quarter priorities
   - Resource requirements: [RESOURCE_NEEDS]
   - Board decisions required

7. **Appendices**:
   - Detailed financial statements
   - Market research data
   - Competitive analysis

Format as executive-ready presentation with clear action items and discussion points.`,
    variables: [
      {name: "company_name", placeholder: "[COMPANY_NAME]", description: "Company name", example: "TechCorp Inc."},
      {name: "meeting_focus", placeholder: "[MEETING_FOCUS]", description: "Main meeting focus", example: "Q4 performance and 2024 strategy"},
      {name: "key_metrics", placeholder: "[KEY_METRICS]", description: "Key performance indicators", example: "ARR, NRR, CAC, LTV"},
      {name: "current_revenue", placeholder: "[CURRENT_REVENUE]", description: "Current revenue", example: "$50M ARR"},
      {name: "target_revenue", placeholder: "[TARGET_REVENUE]", description: "Revenue target", example: "$75M ARR"},
      {name: "cash_position", placeholder: "[CASH_POSITION]", description: "Current cash position", example: "$25M cash on hand"},
      {name: "initiatives", placeholder: "[INITIATIVES]", description: "Strategic initiatives", example: "International expansion, product diversification"},
      {name: "key_customers", placeholder: "[KEY_CUSTOMERS]", description: "Major customer wins", example: "Fortune 500 enterprise accounts"},
      {name: "resource_needs", placeholder: "[RESOURCE_NEEDS]", description: "Resource requirements", example: "Engineering talent, sales team expansion"}
    ],
    tags: ["board meetings", "executive reporting", "strategic planning", "governance", "financial reporting"],
    difficulty: "Advanced"
  },

  {
    id: "exec-003", title: "Crisis Management Communication Plan", 
    description: "Comprehensive crisis communication strategy for stakeholders, media, and employees",
    category: "executive", subcategory: "crisis-management",
    content: `Develop a comprehensive crisis communication plan for [CRISIS_TYPE] affecting [COMPANY_NAME]. 

**Crisis Overview**:
- Nature of crisis: [CRISIS_DESCRIPTION]
- Severity level: [SEVERITY_LEVEL] 
- Stakeholders impacted: [AFFECTED_STAKEHOLDERS]
- Estimated duration: [ESTIMATED_DURATION]

**Communication Strategy**:

1. **Immediate Response (First 2 Hours)**:
   - Internal team notification
   - Crisis team activation
   - Initial fact gathering: [KEY_FACTS]
   - Legal/compliance consultation

2. **Stakeholder Communications**:
   
   **Employees** (Priority 1):
   - Internal announcement addressing [EMPLOYEE_CONCERNS]
   - Leadership availability for questions
   - Regular updates schedule
   - Support resources available

   **Customers** (Priority 1):
   - Service impact communication: [SERVICE_IMPACT]
   - Resolution timeline: [RESOLUTION_TIMELINE]
   - Account manager outreach for key accounts
   - Compensation/remediation plan if applicable

   **Investors** (Priority 2):
   - Factual briefing on situation
   - Financial impact assessment: [FINANCIAL_IMPACT]
   - Mitigation actions being taken
   - Timeline for regular updates

   **Media/Public** (Priority 3):
   - Prepared statement addressing [PUBLIC_CONCERNS]
   - Designated spokesperson: [SPOKESPERSON]
   - Key messages and approved quotes
   - Media availability schedule

3. **Key Messages Framework**:
   - Acknowledgment of situation
   - Actions being taken: [MITIGATION_ACTIONS]
   - Timeline for resolution
   - Commitment to stakeholders
   - Contact information for follow-up

4. **Monitoring & Response**:
   - Social media monitoring plan
   - Media coverage tracking
   - Stakeholder feedback collection
   - Response to misinformation

5. **Recovery Communications**:
   - Resolution announcement
   - Lessons learned transparency
   - Process improvements implemented
   - Stakeholder confidence rebuilding

Ensure all communications are consistent, transparent, and aligned with legal requirements.`,
    tags: ["crisis management", "communication strategy", "stakeholder management", "public relations", "risk management"],
    difficulty: "Advanced"
  }
];

// Medical Prompts
const medicalPrompts = [
  {
    id: "med-002", title: "Medical Case Presentation", 
    description: "Structured medical case presentation for rounds, conferences, or consultations",
    category: "medical", subcategory: "medical-documentation",
    content: `Present a comprehensive medical case following standard medical presentation format:

**Patient Information**:
- Age/Gender: [PATIENT_AGE]/[PATIENT_GENDER]
- Medical Record #: [MRN]
- Date of Admission: [ADMISSION_DATE]
- Attending Physician: [ATTENDING_PHYSICIAN]

**Chief Complaint**: [CHIEF_COMPLAINT]

**History of Present Illness**:
[HPI_DETAILED] - Include timeline, associated symptoms, severity, aggravating/alleviating factors, and patient's functional status.

**Review of Systems**:
- Constitutional: [ROS_CONSTITUTIONAL]
- Cardiovascular: [ROS_CARDIOVASCULAR] 
- Pulmonary: [ROS_PULMONARY]
- Gastrointestinal: [ROS_GI]
- Genitourinary: [ROS_GU]
- Musculoskeletal: [ROS_MSK]
- Neurological: [ROS_NEURO]
- Psychiatric: [ROS_PSYCH]

**Past Medical History**: [PMH]
**Past Surgical History**: [PSH]
**Medications**: [MEDICATIONS]
**Allergies**: [ALLERGIES]
**Social History**: [SOCIAL_HISTORY]
**Family History**: [FAMILY_HISTORY]

**Physical Examination**:
- Vital Signs: [VITAL_SIGNS]
- General Appearance: [GENERAL_APPEARANCE]
- HEENT: [HEENT_EXAM]
- Cardiovascular: [CV_EXAM]
- Pulmonary: [PULM_EXAM]
- Abdominal: [ABD_EXAM]
- Extremities: [EXT_EXAM]
- Neurological: [NEURO_EXAM]
- Skin: [SKIN_EXAM]

**Laboratory/Diagnostic Results**:
[LAB_RESULTS] - Include relevant normal and abnormal values with reference ranges.

**Imaging Studies**: [IMAGING_RESULTS]

**Assessment and Plan**:
1. **Primary Diagnosis**: [PRIMARY_DIAGNOSIS]
   - Supporting evidence: [SUPPORTING_EVIDENCE]
   - Treatment plan: [TREATMENT_PLAN]
   
2. **Secondary Issues**: [SECONDARY_DIAGNOSES]
   - Management approach for each

**Disposition**: [DISPOSITION_PLAN]
**Follow-up**: [FOLLOWUP_PLAN]

**Discussion Points**:
- Differential diagnosis considerations
- Evidence-based treatment rationale
- Potential complications to monitor
- Questions for team input

Note: This is for educational/professional communication purposes. Always follow institutional protocols and maintain patient confidentiality.`,
    tags: ["case presentation", "medical documentation", "clinical rounds", "patient care", "medical education"],
    difficulty: "Advanced"
  },

  {
    id: "med-003", title: "Treatment Protocol Development", 
    description: "Evidence-based treatment protocol creation for specific medical conditions",
    category: "medical", subcategory: "treatment-protocols",
    content: `Develop an evidence-based treatment protocol for [CONDITION] in [PATIENT_POPULATION].

**Protocol Overview**:
- Condition: [CONDITION]
- Target Population: [PATIENT_POPULATION]
- Clinical Setting: [CLINICAL_SETTING]
- Protocol Version: [VERSION_NUMBER]
- Effective Date: [EFFECTIVE_DATE]

**1. Clinical Indications**:
- Primary indications: [PRIMARY_INDICATIONS]
- Secondary indications: [SECONDARY_INDICATIONS]
- Contraindications: [CONTRAINDICATIONS]
- Relative contraindications: [RELATIVE_CONTRAINDICATIONS]

**2. Patient Selection Criteria**:
- Inclusion criteria: [INCLUSION_CRITERIA]
- Exclusion criteria: [EXCLUSION_CRITERIA]
- Age considerations: [AGE_CONSIDERATIONS]
- Comorbidity considerations: [COMORBIDITY_FACTORS]

**3. Pre-Treatment Assessment**:
- Required laboratory tests: [REQUIRED_LABS]
- Imaging studies needed: [IMAGING_REQUIREMENTS]
- Specialist consultations: [CONSULT_REQUIREMENTS]
- Patient consent requirements: [CONSENT_REQUIREMENTS]

**4. Treatment Protocol**:

**First-Line Treatment**:
- Medication: [FIRST_LINE_MEDICATION]
- Dosing: [FIRST_LINE_DOSING]
- Duration: [FIRST_LINE_DURATION]
- Monitoring parameters: [FIRST_LINE_MONITORING]

**Second-Line Treatment** (if first-line fails):
- Alternative options: [SECOND_LINE_OPTIONS]
- Combination therapy considerations: [COMBINATION_THERAPY]
- Dose modifications: [DOSE_MODIFICATIONS]

**5. Monitoring & Follow-up**:
- Frequency of follow-up: [FOLLOWUP_FREQUENCY]
- Response assessment criteria: [RESPONSE_CRITERIA]
- Toxicity monitoring: [TOXICITY_MONITORING]
- Laboratory monitoring schedule: [LAB_SCHEDULE]

**6. Adverse Event Management**:
- Common side effects: [COMMON_SIDE_EFFECTS]
- Serious adverse events: [SERIOUS_AE]
- Management protocols for each: [AE_MANAGEMENT]
- When to discontinue treatment: [DISCONTINUATION_CRITERIA]

**7. Treatment Modifications**:
- Dose adjustments for: [DOSE_ADJUSTMENT_CRITERIA]
- Special populations: [SPECIAL_POPULATIONS]
- Drug interactions: [DRUG_INTERACTIONS]

**8. Evidence Base**:
- Supporting clinical trials: [CLINICAL_EVIDENCE]
- Guideline recommendations: [GUIDELINE_REFERENCES]
- Quality of evidence rating: [EVIDENCE_QUALITY]

**9. Quality Metrics**:
- Success criteria: [SUCCESS_METRICS]
- Outcome measurements: [OUTCOME_MEASURES]
- Quality indicators: [QUALITY_INDICATORS]

**10. References**:
[REFERENCES] - Include recent, high-quality clinical evidence

This protocol should be reviewed and approved by relevant clinical committees and updated based on new evidence.`,
    tags: ["treatment protocols", "evidence-based medicine", "clinical guidelines", "patient safety", "quality improvement"],
    difficulty: "Advanced"
  }
];

// Legal Prompts
const legalPrompts = [
  {
    id: "legal-002", title: "Due Diligence Checklist Generator", 
    description: "Comprehensive legal due diligence checklist for M&A transactions",
    category: "legal", subcategory: "corporate-law",
    content: `Create a comprehensive legal due diligence checklist for the acquisition of [TARGET_COMPANY] in the [INDUSTRY] sector.

**Transaction Overview**:
- Target Company: [TARGET_COMPANY]
- Industry: [INDUSTRY]
- Transaction Type: [TRANSACTION_TYPE]
- Transaction Value: [TRANSACTION_VALUE]
- Jurisdiction: [JURISDICTION]
- Expected Closing: [CLOSING_DATE]

**I. CORPORATE STRUCTURE & GOVERNANCE**

1. **Corporate Documents**:
   □ Certificate of Incorporation and all amendments
   □ Bylaws (current and historical)
   □ Board resolutions (past [REVIEW_PERIOD] years)
   □ Shareholder agreements and voting trusts
   □ Powers of attorney

2. **Capitalization**:
   □ Cap table with all securities outstanding: [OUTSTANDING_SECURITIES]
   □ Stock option plans and grants
   □ Warrants, convertible securities
   □ Rights of first refusal/co-sale agreements
   □ Anti-dilution provisions

3. **Subsidiary Structure**:
   □ Organizational chart showing all entities
   □ Subsidiary formation documents
   □ Intercompany agreements: [INTERCOMPANY_AGREEMENTS]
   □ Foreign entity registrations

**II. MATERIAL CONTRACTS & COMMITMENTS**

1. **Customer Contracts**:
   □ Top 10 customer agreements: [TOP_CUSTOMERS]
   □ Master service agreements
   □ Revenue recognition implications
   □ Termination/change of control provisions

2. **Supplier/Vendor Agreements**:
   □ Critical supplier contracts: [CRITICAL_SUPPLIERS]
   □ Sole source supplier arrangements  
   □ Supply chain risk assessment
   □ Purchase commitments

3. **Partnership & Joint Ventures**:
   □ Strategic partnership agreements: [PARTNERSHIPS]
   □ Joint venture structures
   □ Revenue/profit sharing arrangements
   □ Exclusive dealing arrangements

**III. INTELLECTUAL PROPERTY**

1. **Patents & Trademarks**:
   □ Patent portfolio analysis: [PATENT_PORTFOLIO]
   □ Trademark registrations
   □ Trade secret inventory
   □ Domain name registrations

2. **Licensing Agreements**:
   □ Inbound licensing agreements: [INBOUND_LICENSES]
   □ Outbound licensing agreements: [OUTBOUND_LICENSES]
   □ Royalty obligations
   □ IP indemnification provisions

3. **IP Litigation**:
   □ Current or threatened IP disputes: [IP_DISPUTES]
   □ Freedom to operate analysis
   □ Third-party IP infringement risks

**IV. EMPLOYMENT & BENEFITS**

1. **Key Personnel**:
   □ Employment agreements for key executives: [KEY_EXECUTIVES]
   □ Non-compete and non-solicitation agreements
   □ Retention and change of control provisions
   □ Severance arrangements

2. **Employee Benefits**:
   □ 401(k) and pension plans: [BENEFIT_PLANS]
   □ Health and welfare plans
   □ Equity compensation plans
   □ COBRA compliance

3. **Labor Relations**:
   □ Union agreements and negotiations: [LABOR_AGREEMENTS]
   □ Work rules and policies
   □ Recent labor disputes: [LABOR_DISPUTES]

**V. REGULATORY & COMPLIANCE**

1. **Industry Regulations**:
   □ Regulatory licenses and permits: [REQUIRED_LICENSES]
   □ Compliance with industry standards: [INDUSTRY_STANDARDS]
   □ Regulatory examination reports
   □ Consent orders or enforcement actions

2. **Environmental**:
   □ Environmental assessments: [ENVIRONMENTAL_ASSESSMENTS]
   □ Hazardous materials handling
   □ Environmental insurance coverage
   □ Cleanup obligations

3. **Data Privacy & Security**:
   □ Privacy policies and GDPR compliance: [PRIVACY_COMPLIANCE]
   □ Data breach incidents: [SECURITY_INCIDENTS]
   □ Cybersecurity insurance
   □ Third-party security assessments

**VI. LITIGATION & DISPUTES**

1. **Current Litigation**:
   □ Pending lawsuits and claims: [PENDING_LITIGATION]
   □ Potential exposure amounts
   □ Insurance coverage analysis
   □ Settlement negotiations

2. **Regulatory Proceedings**:
   □ Government investigations: [GOV_INVESTIGATIONS]
   □ Regulatory enforcement actions
   □ Audit findings and responses

**VII. FINANCIAL & TAX**

1. **Tax Matters**:
   □ Tax returns (federal, state, local): [TAX_PERIODS]
   □ Tax audits and assessments: [TAX_AUDITS]
   □ Tax planning strategies
   □ Transfer pricing documentation

2. **Financial Reporting**:
   □ Audited financial statements: [AUDIT_PERIODS]
   □ Management letters from auditors
   □ Internal control assessments
   □ Related party transactions: [RELATED_PARTY]

**VIII. INSURANCE & RISK MANAGEMENT**

□ Insurance policy summaries: [INSURANCE_COVERAGE]
□ Claims history and reserves
□ Self-insurance arrangements
□ Risk management procedures

**PRIORITY ITEMS REQUIRING IMMEDIATE ATTENTION**:
1. [PRIORITY_ITEM_1]
2. [PRIORITY_ITEM_2]
3. [PRIORITY_ITEM_3]

**RED FLAGS TO INVESTIGATE FURTHER**:
- [RED_FLAG_1]
- [RED_FLAG_2]
- [RED_FLAG_3]

This checklist should be customized based on the specific transaction and industry requirements.`,
    tags: ["due diligence", "mergers acquisitions", "corporate law", "risk assessment", "transaction management"],
    difficulty: "Advanced"
  }
];

// Export the prompts
module.exports = {
  executivePrompts,
  medicalPrompts,
  legalPrompts
};

console.log("Generated professional prompt templates. Use these to create hundreds more prompts by varying the parameters and focusing on specific use cases.");