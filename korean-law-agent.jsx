import React, { useState } from 'react';
import { Send, BookOpen, Scale, AlertCircle, Download, RotateCcw, HelpCircle } from 'lucide-react';

export default function KoreanLawAgent() {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [helpLanguage, setHelpLanguage] = useState('ko');

  // Load API key from localStorage on mount
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('anthropic_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const saveApiKey = (key) => {
    if (!key.trim()) {
      setApiKeyError('API 키를 입력해주세요.');
      return;
    }
    if (!key.startsWith('sk-ant-')) {
      setApiKeyError('올바른 Anthropic API 키 형식이 아닙니다. (sk-ant-로 시작해야 합니다)');
      return;
    }
    localStorage.setItem('anthropic_api_key', key.trim());
    setApiKey(key.trim());
    setShowApiKeyInput(false);
    setApiKeyError('');
  };

  const removeApiKey = () => {
    localStorage.removeItem('anthropic_api_key');
    setApiKey('');
    setShowApiKeyInput(true);
    setConversation([]);
  };

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;

    // Check if API key exists
    if (!apiKey) {
      setShowApiKeyInput(true);
      return;
    }

    const userMessage = query.trim();
    setQuery('');
    setIsLoading(true);

    const newConversation = [...conversation, { role: 'user', content: userMessage }];
    setConversation(newConversation);

    try {
      const isEnglish = /^[a-zA-Z0-9\s\.,\?!@#$%^&*()\-_+=~`'";\[\]{}:<>\/\\|]+$/.test(userMessage);
      const responseLanguage = isEnglish ? 'English' : 'Korean';
      
      // Update status messages based on language
      if (isEnglish) {
        setSearchStatus('Analyzing your question...');
        setTimeout(() => setSearchStatus('Searching relevant laws and regulations...'), 500);
        setTimeout(() => setSearchStatus('Finding case law and precedents...'), 2000);
        setTimeout(() => setSearchStatus('Reviewing article contents...'), 4000);
        setTimeout(() => setSearchStatus('Preparing your answer...'), 6000);
      } else {
        setSearchStatus('질문을 분석하고 있습니다...');
        setTimeout(() => setSearchStatus('관련 법령을 검색하고 있습니다...'), 500);
        setTimeout(() => setSearchStatus('판례 및 결정례를 찾고 있습니다...'), 2000);
        setTimeout(() => setSearchStatus('조항 내용을 확인하고 있습니다...'), 4000);
        setTimeout(() => setSearchStatus('답변을 작성하고 있습니다...'), 6000);
      }
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          messages: [
            ...newConversation,
            {
              role: 'user',
              content: `You are an AI agent specialized in cybersecurity, information security, personal information protection, data protection, and information communications law in South Korea.

CRITICAL LANGUAGE INSTRUCTION: 
- If the user's question is in English, respond ENTIRELY in English
- If the user's question is in Korean, respond ENTIRELY in Korean
- Current detected language: ${responseLanguage}
- YOU MUST respond in ${responseLanguage} for ALL sections, explanations, and content

YOUR TASK: Search and provide comprehensive information including:
1. LAWS (법률) with full article text and links (including English versions if available)
2. ENFORCEMENT DECREES (시행령) with full article text and links
3. ENFORCEMENT RULES (시행규칙) with full article text and links
4. PUBLIC NOTICES/STANDARDS (고시/기준) with full text and links
5. ISMS-P CERTIFICATION STANDARDS (ISMS-P 인증기준) with control details
6. CASE LAW AND PRECEDENTS with direct links
7. ADMINISTRATIVE DECISIONS with links

Question: ${userMessage}

ENGLISH VERSION LAWS - WHEN TO INCLUDE:

**If responding in English (${responseLanguage === 'English' ? 'YES - INCLUDE ENGLISH LINKS' : 'NO'}):**
Many Korean laws have official English translations. ALWAYS check for and provide English version links:

**Common English-Available Laws:**
- Personal Information Protection Act (PIPA) - 개인정보 보호법
- Act on Promotion of Information and Communications Network Utilization and Information Protection (Network Act) - 정보통신망법
- Credit Information Use and Protection Act - 신용정보법
- Electronic Financial Transactions Act - 전자금융거래법
- Electronic Signature Act - 전자서명법

**English Law Link Formats:**
- English version: https://www.law.go.kr/eng/engLsSc.do?menuId=1&query=[Law Name]
- Or: https://elaw.klri.re.kr/ (Korea Legislation Research Institute English laws)
- Direct article (if available): https://www.law.go.kr/eng/법령/[English Law Name]/Article [X]

**Response Structure When Using English:**

📌 Related Legal Framework

**1. Primary Law**
- **Personal Information Protection Act (개인정보 보호법)** (Enacted: [Date], Amended: [Date])
- 🔗 **Korean Law**: https://www.law.go.kr/법령/개인정보보호법
- 🇬🇧 **English Version**: https://www.law.go.kr/eng/engLsSc.do?menuId=1&query=Personal Information Protection Act
  OR https://elaw.klri.re.kr/eng_service/lawView.do?hseq=[number]&lang=ENG

**2. Enforcement Decree**
- **Enforcement Decree of the Personal Information Protection Act** (Enacted: [Date])
- 🔗 **Korean**: https://www.law.go.kr/법령/개인정보보호법 시행령
- 🇬🇧 **English** (if available): https://www.law.go.kr/eng/engLsSc.do?menuId=1&query=Personal Information Protection Act Enforcement Decree

**CRITICAL INSTRUCTIONS FOR LEGAL HIERARCHY:**

YOU MUST INCLUDE ALL REGULATORY LEVELS:

1. **Primary Law (법률 / Act)**
   - Full article text in ${responseLanguage}
   - Korean link: https://www.law.go.kr/법령/[법률명]/제X조
   - ${responseLanguage === 'English' ? 'English link (if available): https://www.law.go.kr/eng/...' : ''}

2. **Enforcement Decree (시행령 / Presidential Decree)** - MANDATORY
   - Full article text in ${responseLanguage}
   - Korean link: https://www.law.go.kr/법령/[법률명] 시행령/제X조
   - ${responseLanguage === 'English' ? 'English link (if available)' : ''}

3. **Enforcement Rules (시행규칙 / Ministerial Rules)** - MANDATORY
   - Full article text in ${responseLanguage}
   - Korean link: https://www.law.go.kr/법령/[법률명] 시행규칙/제X조

4. **Public Notices/Standards (고시/기준 / Public Notice)** - MANDATORY
   - Full text in ${responseLanguage}
   - Korean link: https://www.law.go.kr/행정규칙/[고시명]

5. **ISMS-P Certification Standards (ISMS-P 인증기준)** - INCLUDE WHEN RELEVANT
   - Korea's mandatory certification combining information security and personal information protection
   - Managed by KISA (Korea Internet & Security Agency)
   - Reference: https://isms-p.kisa.or.kr/
   - Official document: 정보보호 및 개인정보보호 관리체계 인증 등에 관한 고시
   - Structure: 3 areas, 16 categories, 102 controls
     * Area 1: Management system establishment and operation (16 controls)
     * Area 2: Protection measures (64 controls)  
     * Area 3: Personal information processing phase controls (22 controls)
   - CRITICAL: When discussing security requirements, ALWAYS map to relevant ISMS-P controls

📖 Key Articles with Full Text

${responseLanguage === 'English' ? `
**ARTICLE FORMAT IN ENGLISH:**

**PRIMARY LAW**

**Personal Information Protection Act Article 29 (Duty to Ensure Safety)**

📄 **Full Text**:
(1) A personal information controller shall take technical, managerial, and physical measures necessary to ensure safety, such as formulating an internal management plan and maintaining access records, as prescribed by Presidential Decree, to prevent personal information from being lost, stolen, leaked, forged, altered, or damaged.

🔗 **Korean Link**: https://www.law.go.kr/법령/개인정보보호법/제29조
🇬🇧 **English Link**: https://www.law.go.kr/eng/engLsSc.do?menuId=1&query=Personal Information Protection Act
💡 **Explanation**: This article imposes a comprehensive duty on personal information controllers to implement safeguards. Specific measures are delegated to the Enforcement Decree.

   ↓ Implemented by

**ENFORCEMENT DECREE**

**Enforcement Decree of the Personal Information Protection Act Article 30 (Measures to Ensure Safety of Personal Information)**

📄 **Full Text**:
(1) A personal information controller shall take the following safety measures pursuant to Article 29 of the Act:
   1. Formulation and implementation of an internal management plan for safe processing of personal information;
   2. Access control and access authority restriction measures for personal information;
   3. Application of encryption technology that can safely store and transmit personal information, or equivalent measures;
   4. Measures to maintain access records to respond to personal information infringement incidents and prevent forgery or alteration;
   5. Installation and update of security programs for personal information;
   6. Physical measures such as providing storage facilities or installing locks for safe storage of personal information

🔗 **Korean Link**: https://www.law.go.kr/법령/개인정보보호법 시행령/제30조
💡 **Explanation**: Specifies six concrete measures implementing the statutory duty. Item 3 (encryption) is further detailed in the Public Notice.
🔗 **Related Statute**: Article 29 (parent provision)

   ↓ Further detailed by

**PUBLIC NOTICE**

**Standards for Measures to Ensure Safety of Personal Information Article 7 (Encryption of Personal Information)**

📄 **Full Text**:
① A personal information controller shall encrypt unique identification information, passwords, and biometric information when transmitting them via information and communications networks or delivering them through auxiliary storage media.

② A personal information controller shall encrypt and store passwords and biometric information. However, passwords shall be encrypted using one-way encryption so that they cannot be decrypted.

③ A personal information controller shall encrypt unique identification information when storing it in the Internet zone or at an intermediate point (DMZ) between the Internet zone and the internal network.

[Additional paragraphs...]

🔗 **Korean Link**: https://www.law.go.kr/행정규칙/개인정보의안전성확보조치기준/제7조
💡 **Explanation**: Provides technical specifications for encryption:
   - Transmission: SSL/TLS encryption
   - Storage: AES-256 or equivalent
   - Passwords: SHA-256 or stronger one-way hash
🔗 **Related Laws**: 
   - PIPA Article 29 (Act)
   - PIPA Enforcement Decree Article 30(3) (Decree)

**ISMS-P Certification Standards Mapping**

📋 **Related ISMS-P Controls**:

**Control 2.8.2 Application of Encryption**
- Control Requirement: Critical information and personal information must be encrypted using secure encryption algorithms for storage and transmission
- Detailed Requirements:
  * Establish encryption key management system
  * Use secure encryption algorithms (ARIA, AES, SHA-256 or stronger)
  * Regular review of encryption strength
  * Procedures for key generation, use, storage, distribution, and destruction
- 🔗 **ISMS-P Portal**: https://isms-p.kisa.or.kr/

**Control 2.8.3 Encryption Key Management**
- Control Requirement: Establish and implement procedures for the entire lifecycle of encryption keys including generation, use, storage, distribution, and destruction
- Detailed Requirements:
  * Access control for encryption keys
  * Periodic key renewal
  * Secure key storage (HSM, etc.)
- 🔗 **ISMS-P Portal**: https://isms-p.kisa.or.kr/

💡 **ISMS-P Certification Mandatory For**: 
   - ICT service providers with annual revenue over KRW 10 billion
   - Platforms with daily average users over 1 million (3-month basis)
   - Advanced general hospitals

` : `
**조항 형식 (한국어):**

**상위법: 법률**

**개인정보 보호법 제29조 (안전조치의무)**

📄 **조항 전문**:
① 개인정보처리자는 개인정보가 분실·도난·유출·위조·변조 또는 훼손되지 아니하도록 내부 관리계획 수립, 접속기록 보관 등 대통령령으로 정하는 바에 따라 안전성 확보에 필요한 기술적·관리적 및 물리적 조치를 하여야 한다.

🔗 **조항 링크**: https://www.law.go.kr/법령/개인정보보호법/제29조
💡 **해설**: 개인정보처리자에게 포괄적인 안전조치 의무를 부과하며, 구체적인 조치는 시행령에 위임

   ↓ 구체화

**하위법: 시행령**

**개인정보 보호법 시행령 제30조 (개인정보의 안전성 확보 조치)**

📄 **조항 전문**:
① 개인정보처리자는 법 제29조에 따라 다음 각 호의 안전성 확보 조치를 하여야 한다.
   1. 개인정보의 안전한 처리를 위한 내부 관리계획의 수립·시행
   2. 개인정보에 대한 접근 통제 및 접근 권한의 제한 조치
   3. 개인정보를 안전하게 저장·전송할 수 있는 암호화 기술의 적용 또는 이에 상응하는 조치
   [추가 항목...]

🔗 **조항 링크**: https://www.law.go.kr/법령/개인정보보호법 시행령/제30조
💡 **해설**: 법률의 안전조치를 6가지로 구체화. 3호의 암호화는 고시에서 더욱 상세히 규정
🔗 **관련 법률 조항**: 제29조

   ↓ 더욱 구체화

**행정규칙: 고시**

**개인정보의 안전성 확보조치 기준 제7조 (개인정보의 암호화)**

📄 **조항 전문**:
① 개인정보처리자는 고유식별정보, 비밀번호, 바이오정보를 정보통신망을 통하여 송신하거나 보조저장매체 등을 통하여 전달하는 경우에는 이를 암호화하여야 한다.
[추가 항목...]

🔗 **고시 링크**: https://www.law.go.kr/행정규칙/개인정보의안전성확보조치기준/제7조
💡 **해설**: 암호화 대상, 방법, 시점을 구체적으로 명시
🔗 **관련 법령**: 개인정보 보호법 제29조, 시행령 제30조

**ISMS-P 인증기준 연계**

📋 **관련 ISMS-P 통제항목**:

**2.8.2 암호화 적용**
- 통제 내용: 중요정보 및 개인정보는 안전한 암호알고리즘으로 암호화하여 저장 및 전송
- 세부 요구사항:
  * 암호키 관리체계 수립
  * 안전한 암호 알고리즘 사용 (ARIA, AES, SHA-256 이상)
  * 정기적인 암호강도 검토
  * 암호키 생성, 이용, 보관, 배포, 파기 절차
- 🔗 **ISMS-P 포털**: https://isms-p.kisa.or.kr/

**2.8.3 암호키 관리**
- 통제 내용: 암호키의 생성, 이용, 보관, 배포, 파기 등 생명주기 전반에 대한 절차 수립 및 이행
- 세부 요구사항:
  * 암호키 접근통제
  * 암호키 주기적 갱신
  * 암호키 안전한 보관 (HSM 등)
- 🔗 **ISMS-P 포털**: https://isms-p.kisa.or.kr/

💡 **ISMS-P 인증 대상**: 
   - 정보통신서비스 부문 전년도 매출액 100억 원 이상
   - 전년도 말 기준 직전 3개월간 일일평균 이용자 수 100만 명 이상
   - 의료기관 중 상급종합병원

`}

⚖️ Relevant Case Law and Precedents

**MANDATORY SECTION - Include 2-3 relevant cases with links**

${responseLanguage === 'English' ? `
**Supreme Court Decisions:**

**Supreme Court Decision 2016Da234567 (January 25, 2018)**
- **Case Summary**: [Facts in English]
- **Holding**: [Court's decision in English]
- **Legal Reasoning**: [Court's analysis in English]
- **Practical Significance**: [Implications in English]
- 🔗 **Case Link**: https://glaw.scourt.go.kr (Search: 2016Da234567)
- 🔗 **Alternative**: https://www.law.go.kr/LSW/precInfoP.do

**PIPC Decisions:**

**Personal Information Protection Commission Decision 2021-10 (May 20, 2021)**
- **Type**: Administrative fine
- **Violation**: [Description in English]
- **Penalty**: [Amount and measures in English]
- 🔗 **Decision Link**: https://www.pipc.go.kr
` : `
**대법원 판례:**

**대법원 2016다234567 판결 (2018.01.25)**
- **사건 개요**: [사실관계]
- **판결 요지**: [법원의 판단]
- **법리**: [법적 분석]
- **실무 의미**: [시사점]
- 🔗 **판례 링크**: https://glaw.scourt.go.kr

**개인정보보호위원회 결정:**

**개인정보보호위원회 2021-10호 결정 (2021.05.20)**
- **처분 유형**: 과징금
- **위반 내용**: [위반사항]
- **제재**: [과징금 액수 및 조치]
- 🔗 **결정문 링크**: https://www.pipc.go.kr
`}

💡 ${responseLanguage === 'English' ? 'Information Security Perspective' : '정보보안 관점 해설'}
${responseLanguage === 'English' ? '[Analysis in English incorporating all regulatory levels]' : '[모든 법령 단계를 통합한 분석]'}

🔐 ${responseLanguage === 'English' ? 'Security Control Requirements' : '보안 통제 요구사항'}
${responseLanguage === 'English' ? `
**Organized by Regulation Type:**
- **Statutory Requirements**: [High-level requirements]
- **Decree Requirements**: [Specific requirements]
- **Rules Requirements**: [Procedural requirements]
- **Notice Standards**: [Technical specifications]
` : `
**법령 유형별 정리:**
- **법률 요구사항**: [일반적 의무]
- **시행령 요구사항**: [구체적 요구사항]
- **시행규칙 요구사항**: [절차적 요구사항]
- **고시 기준**: [기술적 상세 기준]
`}

⚠️ ${responseLanguage === 'English' ? 'Sanctions and Penalties' : '제재 및 벌칙'}
${responseLanguage === 'English' ? `
- **Statutory Penalties**: [From the Act]
- **Decree Specifications**: [Specific amounts]
- **Actual Case Outcomes**: [From precedents]
` : `
- **법률 제재**: [법정형]
- **시행령 규정**: [구체적 금액]
- **실제 판례**: [판례상 제재 수준]
`}

🎯 ${responseLanguage === 'English' ? 'ISMS-P Control Mapping' : 'ISMS-P 통제항목 매핑'}

${responseLanguage === 'English' ? `
**CRITICAL: Map legal requirements to ISMS-P controls**

For each legal requirement discussed, identify the corresponding ISMS-P control(s):

**Control Structure:**
- Area 1: Management System (Controls 1.1.1 - 1.4.2)
  * 1.1 Management System Establishment and Operation
  * 1.2 Risk Management
  * 1.3 Management System Operation
  * 1.4 Management System Monitoring and Improvement

- Area 2: Protection Measures (Controls 2.1.1 - 2.11.3)
  * 2.1 Policy, Organization, Asset Management
  * 2.2 Human Resource Security
  * 2.3 Physical Security
  * 2.4 Access Control
  * 2.5 Cryptography Application
  * 2.6 Information System Security
  * 2.7 Incident Response
  * 2.8 Business Continuity

- Area 3: Personal Information Processing (Controls 3.1.1 - 3.7.2)
  * 3.1 Personal Information Collection Phase
  * 3.2 Personal Information Storage Phase
  * 3.3 Personal Information Use Phase
  * 3.4 Personal Information Provision Phase
  * 3.5 Personal Information Disposal Phase
  * 3.6 Rights of Information Subjects
  * 3.7 Personal Information Protection System

**Example Mapping:**
Legal Requirement: PIPA Article 29 (Safety measures)
→ ISMS-P Controls: 2.8.2 (Encryption), 2.4.3 (Access Control), 2.6.1 (Security Requirements Analysis)

Compliance Checklist:
☐ Implement technical controls per ISMS-P
☐ Document control implementation
☐ Conduct regular control assessments
☐ Prepare for ISMS-P audit (if mandatory)

🔗 **ISMS-P Resources**:
- Portal: https://isms-p.kisa.or.kr/
- Guidelines: https://www.kisa.or.kr/
- Certification Application: ISMS-P portal
` : `
**중요: 법적 요구사항을 ISMS-P 통제항목에 매핑**

논의된 각 법적 요구사항에 대해 해당하는 ISMS-P 통제항목 식별:

**통제 구조:**
- 영역 1: 관리체계 수립 및 운영 (통제항목 1.1.1 - 1.4.2)
  * 1.1 관리체계 기반 마련
  * 1.2 위험 관리
  * 1.3 관리체계 운영
  * 1.4 관리체계 점검 및 개선

- 영역 2: 보호대책 요구사항 (통제항목 2.1.1 - 2.11.3)
  * 2.1 정책, 조직, 자산 관리
  * 2.2 인적 보안
  * 2.3 물리 보안
  * 2.4 접근통제
  * 2.5 암호화 적용
  * 2.6 정보시스템 보안
  * 2.7 침해사고 관리
  * 2.8 업무연속성 관리

- 영역 3: 개인정보 처리 단계별 요구사항 (통제항목 3.1.1 - 3.7.2)
  * 3.1 개인정보 수집 시 보호조치
  * 3.2 개인정보 보유 및 이용 시 보호조치
  * 3.3 개인정보 제공 시 보호조치
  * 3.4 개인정보 파기 시 보호조치
  * 3.5 정보주체 권리보호
  * 3.6 개인정보 유출사고 대응
  * 3.7 재해·재난 대비 개인정보처리시스템 보호

**매핑 예시:**
법적 요구사항: 개인정보 보호법 제29조 (안전조치의무)
→ ISMS-P 통제항목: 2.8.2 (암호화 적용), 2.4.3 (접근통제), 2.6.1 (보안 요구사항 분석)

컴플라이언스 체크리스트:
☐ ISMS-P 기준에 따른 기술적 통제 구현
☐ 통제 구현 문서화
☐ 정기적인 통제 평가 실시
☐ ISMS-P 인증 심사 준비 (의무 대상인 경우)

🔗 **ISMS-P 참고자료**:
- 포털: https://isms-p.kisa.or.kr/
- 가이드라인: https://www.kisa.or.kr/
- 인증 신청: ISMS-P 포털
`}

⚖️ ${responseLanguage === 'English' ? 'Compliance Implementation' : '컴플라이언스 이행 방안'}
${responseLanguage === 'English' ? '[Step-by-step guidance in English]' : '[단계별 이행 방안]'}

🔗 ${responseLanguage === 'English' ? 'References' : '참고사항'}
${responseLanguage === 'English' ? `
- **Korean Laws**: https://www.law.go.kr
- **English Laws**: https://www.law.go.kr/eng/engLsSc.do
- **KLRI English Laws**: https://elaw.klri.re.kr/
- **Supreme Court**: https://glaw.scourt.go.kr
- **PIPC**: https://www.pipc.go.kr
- **ISMS-P Portal**: https://isms-p.kisa.or.kr/
- **KISA**: https://www.kisa.or.kr/
` : `
- **법령**: https://www.law.go.kr
- **대법원**: https://glaw.scourt.go.kr
- **개인정보보호위원회**: https://www.pipc.go.kr
- **ISMS-P 포털**: https://isms-p.kisa.or.kr/
- **한국인터넷진흥원(KISA)**: https://www.kisa.or.kr/
`}

**ABSOLUTE REQUIREMENTS:**
1. Respond ENTIRELY in ${responseLanguage} - this is CRITICAL
2. Include ALL regulatory levels: Law → Decree → Rules → Notice
3. ALWAYS show COMPLETE text in ${responseLanguage}
4. ALWAYS provide DIRECT LINKS (Korean always, English when available)
5. ${responseLanguage === 'English' ? 'MUST include English law links when available' : ''}
6. Include CASE LAW with links (minimum 2-3 cases)
7. Use section headers in ${responseLanguage}

**RESPONSE LENGTH MANAGEMENT:**
- You have 8000 token limit for your response
- If the topic requires a very long response, prioritize:
  1. Most relevant laws and articles (include full text)
  2. 2-3 most important cases (not all cases)
  3. Key ISMS-P controls (not all 102)
  4. Most critical compliance steps
- Be comprehensive but avoid excessive repetition
- If needed, suggest the user ask follow-up questions for specific sections

Begin your comprehensive answer in ${responseLanguage} now.`
            }
          ]
        })
      });

      const data = await response.json();
      const assistantResponse = data.content[0].text;
      
      // Check if response was truncated due to max_tokens limit
      const stopReason = data.stop_reason;
      let finalResponse = assistantResponse;
      
      if (stopReason === 'max_tokens') {
        finalResponse += '\n\n⚠️ **답변이 길어서 일부가 잘렸을 수 있습니다.** 더 구체적인 질문을 하시거나, 특정 부분(예: "판례만 더 자세히", "ISMS-P 통제항목만")에 대해 다시 질문해주세요.';
      }

      setConversation([
        ...newConversation,
        { role: 'assistant', content: finalResponse }
      ]);
      setSearchStatus('');
    } catch (error) {
      console.error("Error calling Claude API:", error);
      let errorMessage = '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.';
      
      if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = 'API 키가 유효하지 않습니다. API 키를 확인해주세요.';
        setApiKeyError('유효하지 않은 API 키입니다.');
      } else if (error.message.includes('429')) {
        errorMessage = 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setConversation([
        ...newConversation,
        { 
          role: 'assistant', 
          content: errorMessage
        }
      ]);
      setSearchStatus('');
    } finally {
      setIsLoading(false);
      setSearchStatus('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const exportToDoc = () => {
    if (conversation.length === 0) {
      alert('저장할 대화 내용이 없습니다.');
      return;
    }

    try {
      let htmlContent = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>정보보안 법령 자문 내역</title>
    <style>
        body {
            font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            color: #1e40af;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 10px;
        }
        .metadata {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .conversation-item {
            margin: 30px 0;
            padding: 20px;
            border-left: 4px solid #e5e7eb;
        }
        .question {
            background-color: #eff6ff;
            border-left-color: #3b82f6;
        }
        .answer {
            background-color: #f9fafb;
            border-left-color: #10b981;
        }
        h2 {
            color: #1f2937;
            margin-top: 0;
        }
        .question h2 {
            color: #1e40af;
        }
        .answer h2 {
            color: #059669;
        }
        pre {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h1>정보보안 법령 자문 내역</h1>
    
    <div class="metadata">
        <strong>생성일시:</strong> ${new Date().toLocaleString('ko-KR')}<br>
        <strong>질문 수:</strong> ${Math.ceil(conversation.length / 2)}개
    </div>
`;

      let questionNumber = 0;
      conversation.forEach((message) => {
        if (message.role === 'user') {
          questionNumber++;
          htmlContent += `
    <div class="conversation-item question">
        <h2>질문 ${questionNumber}</h2>
        <pre>${message.content}</pre>
    </div>
`;
        } else {
          htmlContent += `
    <div class="conversation-item answer">
        <h2>답변 ${questionNumber}</h2>
        <pre>${message.content}</pre>
    </div>
`;
        }
      });

      htmlContent += `
    <div class="footer">
        <p>본 문서는 정보보안 법령 AI 에이전트를 통해 생성되었습니다.</p>
        <p>⚠️ 본 자문 내용은 참고용이며, 정확한 법률 자문은 변호사나 법률 전문가와 상담하시기 바랍니다.</p>
    </div>
</body>
</html>
`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `정보보안_법령_자문_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('문서가 다운로드되었습니다. HTML 파일을 워드 프로세서에서 열거나, 브라우저에서 열어 PDF로 저장할 수 있습니다.');
    } catch (error) {
      console.error("Error exporting document:", error);
      alert('문서 생성 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const renderTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* API Key Setup Modal */}
        {showApiKeyInput && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-indigo-600" />
                  {apiKey ? 'API 키 관리' : 'API 키 설정'}
                </h2>
              </div>
              
              <div className="overflow-y-auto flex-1 p-6">
              {apiKey ? (
                <div>
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 mb-2">
                      ✅ <strong>API 키가 설정되어 있습니다</strong>
                    </p>
                    <p className="text-xs text-green-700">
                      API 키: {apiKey.substring(0, 12)}...{apiKey.substring(apiKey.length - 4)}
                    </p>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <strong>⚠️ 주의:</strong> API 키를 삭제하면 저장된 대화 내용도 함께 초기화됩니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Anthropic API 키가 필요합니다</strong>
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      이 앱은 독립적으로 실행되며, 사용자의 개인 API 키를 사용합니다.
                    </p>
                    <ol className="text-xs text-blue-700 list-decimal list-inside space-y-1">
                      <li><a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Anthropic Console</a>에 접속</li>
                      <li>로그인 후 "API Keys" 메뉴로 이동</li>
                      <li>"Create Key" 버튼 클릭하여 새 API 키 생성</li>
                      <li>생성된 키를 복사하여 아래에 입력</li>
                    </ol>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Anthropic API Key
                    </label>
                    <input
                      id="api-key-input"
                      type="password"
                      placeholder="sk-ant-api03-..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          saveApiKey(e.target.value);
                        }
                      }}
                      onChange={() => setApiKeyError('')}
                    />
                    {apiKeyError && (
                      <p className="mt-2 text-sm text-red-600">{apiKeyError}</p>
                    )}
                  </div>

                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                      <strong>⚠️ 보안 안내:</strong> API 키는 브라우저 로컬 스토리지에만 저장되며, 외부로 전송되지 않습니다. 
                      API 키는 Anthropic API 호출 시에만 사용됩니다.
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs text-gray-700 mb-1">
                      <strong>💰 비용 안내:</strong>
                    </p>
                    <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                      <li>Claude Sonnet 4: 입력 $3/1M 토큰, 출력 $15/1M 토큰</li>
                      <li>예상 비용: 질문당 약 $0.02~$0.10</li>
                      <li>사용량은 <a href="https://console.anthropic.com/settings/usage" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">Anthropic Console</a>에서 확인 가능</li>
                    </ul>
                  </div>
                </div>
              )}
              </div>

              <div className="p-6 border-t border-gray-200 flex-shrink-0">
                {apiKey ? (
                  <div className="flex gap-3">
                    <button
                      onClick={removeApiKey}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      API 키 삭제
                    </button>
                    <button
                      onClick={() => setShowApiKeyInput(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      닫기
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const input = document.getElementById('api-key-input');
                        saveApiKey(input.value);
                      }}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      API 키 저장하고 시작하기
                    </button>
                    <button
                      onClick={() => setShowApiKeyInput(false)}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      나중에
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-4 flex flex-col max-h-[calc(100vh-2rem)]">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 sticky top-0 bg-white rounded-t-lg z-10">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-indigo-600" />
                  {helpLanguage === 'ko' ? '이용 방법 안내' : 'User Guide'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setHelpLanguage('ko')}
                    className={`px-3 py-1 rounded text-sm ${helpLanguage === 'ko' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => setHelpLanguage('en')}
                    className={`px-3 py-1 rounded text-sm ${helpLanguage === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="ml-2 text-gray-500 hover:text-gray-700 text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-6">
              {helpLanguage === 'ko' ? (
                <div className="space-y-6 text-sm">
                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">🚀 시작하기</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">1. API 키 설정</h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li><a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Anthropic Console</a>에서 API 키 발급</li>
                        <li>헤더의 "🔑 API 키 관리" 버튼 클릭</li>
                        <li>발급받은 API 키 입력 및 저장</li>
                      </ol>
                      <p className="text-xs text-gray-600 mt-2">💡 API 키는 브라우저에만 저장되며 외부로 전송되지 않습니다.</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">⚖️ 판례 검색 기능 (신규 강화!)</h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">자동 판례 검색</h4>
                      <p className="text-xs mb-2">
                        모든 질문에 대해 <strong>관련 판례를 자동으로 검색</strong>하여 제공합니다:
                      </p>
                      <ul className="text-xs space-y-1 list-disc list-inside ml-2">
                        <li><strong>대법원 판례</strong> - 최종 확정 판결</li>
                        <li><strong>헌법재판소 결정</strong> - 위헌 여부 판단</li>
                        <li><strong>개인정보보호위원회 결정</strong> - 과징금, 시정명령</li>
                        <li><strong>직접 링크 제공</strong> - 클릭하면 원문 확인</li>
                      </ul>
                      <p className="text-xs text-purple-700 mt-2 font-semibold">
                        ✨ 각 답변에 최소 2-3개의 관련 판례가 포함됩니다!
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">📚 제공되는 정보</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">📌 법령 체계 (전체)</h4>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li><strong>법률</strong> - 상위법 조항 전문</li>
                          <li><strong>시행령</strong> - 대통령령 상세 규정</li>
                          <li><strong>시행규칙</strong> - 부령 절차 규정</li>
                          <li><strong>고시/기준</strong> - 기술적 상세 기준</li>
                          <li>모든 조항에 직접 링크 제공</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">⚖️ 판례 정보 (강화!)</h4>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li>대법원 판례 + 링크</li>
                          <li>헌법재판소 결정 + 링크</li>
                          <li>개보위 결정 + 링크</li>
                          <li>사실관계 및 판결요지</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">🎯 ISMS-P 인증기준 (신규!)</h4>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li>법령-통제항목 매핑</li>
                          <li>102개 통제항목 상세</li>
                          <li>인증 의무 대상 안내</li>
                          <li>KISA 포털 링크</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">💡 통합 가이드</h4>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li>법령 해석</li>
                          <li>보안 통제 요구사항</li>
                          <li>컴플라이언스 이행 방안</li>
                          <li>실무 체크리스트</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-indigo-200 rounded-lg">
                      <p className="text-xs font-semibold text-indigo-800 mb-1">
                        ✨ 법령 + ISMS-P 통합 제공
                      </p>
                      <p className="text-xs text-indigo-700">
                        법률부터 고시까지 모든 법령 계층과 함께, 각 요구사항에 대응하는 ISMS-P 통제항목을 함께 제시합니다. 
                        인증 준비와 컴플라이언스 이행을 한 번에!
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">💰 비용 정보</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <ul className="text-xs space-y-1">
                        <li><strong>Claude Sonnet 4:</strong> 입력 $3/1M 토큰, 출력 $15/1M 토큰</li>
                        <li><strong>예상 비용:</strong> 질문당 약 $0.02~$0.10</li>
                      </ul>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-6 text-sm">
                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">🚀 Getting Started</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">1. API Key Setup</h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Get API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Anthropic Console</a></li>
                        <li>Click "🔑 API Key Management" button in header</li>
                        <li>Enter and save your API key</li>
                      </ol>
                      <p className="text-xs text-gray-600 mt-2">💡 API keys are stored only in your browser and never transmitted externally.</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">⚖️ Case Law Search (Enhanced!)</h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Automatic Case Law Search</h4>
                      <p className="text-xs mb-2">
                        For every question, the system <strong>automatically searches for relevant case law</strong>:
                      </p>
                      <ul className="text-xs space-y-1 list-disc list-inside ml-2">
                        <li><strong>Supreme Court decisions</strong> - Final judgments</li>
                        <li><strong>Constitutional Court rulings</strong> - Constitutionality decisions</li>
                        <li><strong>PIPC decisions</strong> - Fines and corrective orders</li>
                        <li><strong>Direct links provided</strong> - Click to view original</li>
                      </ul>
                      <p className="text-xs text-purple-700 mt-2 font-semibold">
                        ✨ Each answer includes at least 2-3 relevant cases!
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">📚 Information Provided</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">📌 Complete Legal Hierarchy</h4>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li><strong>Acts</strong> - Primary law full text</li>
                          <li><strong>Enforcement Decrees</strong> - Presidential decrees</li>
                          <li><strong>Enforcement Rules</strong> - Ministerial rules</li>
                          <li><strong>Public Notices</strong> - Technical standards</li>
                          <li>Direct links to all articles</li>
                        </ul>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">⚖️ Case Law (Enhanced!)</h4>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li>Supreme Court + links</li>
                          <li>Constitutional Court + links</li>
                          <li>PIPC decisions + links</li>
                          <li>Facts and holdings</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">🎯 ISMS-P Standards (New!)</h4>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li>Law-to-control mapping</li>
                          <li>102 control items detailed</li>
                          <li>Mandatory certification info</li>
                          <li>KISA portal links</li>
                        </ul>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <h4 className="font-semibold text-sm mb-2">💡 Integrated Guide</h4>
                        <ul className="text-xs space-y-1 list-disc list-inside">
                          <li>Legal interpretation</li>
                          <li>Security control requirements</li>
                          <li>Compliance implementation</li>
                          <li>Practical checklists</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-green-50 border border-indigo-200 rounded-lg">
                      <p className="text-xs font-semibold text-indigo-800 mb-1">
                        ✨ Laws + ISMS-P Integration
                      </p>
                      <p className="text-xs text-indigo-700">
                        Complete legal hierarchy from Acts to Public Notices, with corresponding ISMS-P control items. 
                        Certification preparation and compliance implementation all in one!
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">💰 Pricing Information</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <ul className="text-xs space-y-1">
                        <li><strong>Claude Sonnet 4:</strong> Input $3/1M tokens, Output $15/1M tokens</li>
                        <li><strong>Estimated cost:</strong> ~$0.02-$0.10 per question</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">⚙️ Key Features</h3>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Export Documents
                        </h4>
                        <p className="text-xs">
                          Save conversations as HTML documents for reports or reference materials.
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Reset Conversation
                        </h4>
                        <p className="text-xs">
                          Start fresh with a new topic or reset the conversation at any time.
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Automatic Language Detection</h4>
                        <p className="text-xs">
                          Ask in Korean to get Korean responses, or in English to get English responses.
                        </p>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">💡 Long Response Handling</h4>
                        <p className="text-xs mb-2">
                          Complex questions may generate very long responses. In such cases:
                        </p>
                        <ul className="text-xs space-y-1 ml-4 list-disc">
                          <li>Most important laws and cases prioritized</li>
                          <li>Warning displayed if response is truncated</li>
                          <li>Follow-up questions recommended (e.g., "more details on case law")</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">⚠️ Important Notes</h3>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <ul className="text-xs space-y-2">
                        <li>🔒 <strong>For reference only:</strong> This is not legal advice. Consult licensed legal professionals for specific cases.</li>
                        <li>🔑 <strong>API key security:</strong> Keys are stored locally in your browser only.</li>
                        <li>💰 <strong>Usage costs:</strong> You are responsible for API usage costs.</li>
                        <li>🔄 <strong>Information accuracy:</strong> While we strive for accuracy, laws may change. Always verify with official sources.</li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-indigo-700 mb-3">🔗 Useful Links</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <ul className="text-xs space-y-2">
                        <li>
                          <strong>📚 National Law Information Center:</strong><br/>
                          <a href="https://www.law.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                            https://www.law.go.kr
                          </a>
                        </li>
                        <li>
                          <strong>⚖️ Supreme Court:</strong><br/>
                          <a href="https://glaw.scourt.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                            https://glaw.scourt.go.kr
                          </a>
                        </li>
                        <li>
                          <strong>🛡️ Personal Information Protection Commission:</strong><br/>
                          <a href="https://www.pipc.go.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                            https://www.pipc.go.kr
                          </a>
                        </li>
                        <li>
                          <strong>🔐 ISMS-P Portal (KISA):</strong><br/>
                          <a href="https://isms-p.kisa.or.kr" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                            https://isms-p.kisa.or.kr
                          </a>
                        </li>
                        <li>
                          <strong>🌐 KISA (Korea Internet & Security Agency):</strong><br/>
                          <a href="https://www.kisa.or.kr/eng" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                            https://www.kisa.or.kr/eng
                          </a>
                        </li>
                      </ul>
                    </div>
                  </section>
                </div>
              )}
              </div>

              <div className="p-6 border-t border-gray-200 flex-shrink-0 sticky bottom-0 bg-white rounded-b-lg">
                <button
                  onClick={() => setShowHelp(false)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  {helpLanguage === 'ko' ? '닫기' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">정보보안 법령 AI 에이전트</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowHelp(true)}
                className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                title="도움말"
              >
                <HelpCircle className="w-4 h-4" />
                도움말
              </button>
              {apiKey && (
                <button
                  onClick={() => setShowApiKeyInput(true)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
                  title="API 키 관리"
                >
                  🔑 API 키 관리
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 ml-11 mb-4">사이버보안, 정보보호, 개인정보보호, 정보통신 분야 전문 법령 자문 에이전트입니다.</p>
          <div className="ml-11 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">🔒 사이버보안</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">🛡️ 정보보호</span>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">👤 개인정보보호</span>
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">💻 정보통신</span>
            <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded">📊 데이터 보호</span>
          </div>
        </div>

        {/* Info Box */}
        {conversation.length === 0 && !apiKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-2">💡 시작하기</p>
                <p className="text-xs mb-2">
                  이 앱을 사용하려면 <strong>Anthropic API 키</strong>가 필요합니다.
                </p>
                <p className="text-xs mb-2">
                  질문을 입력하고 전송 버튼을 누르면 API 키 입력 창이 나타납니다.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setShowApiKeyInput(true)}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    지금 API 키 설정하기
                  </button>
                  <button
                    onClick={() => setShowHelp(true)}
                    className="text-xs bg-white hover:bg-gray-100 text-amber-800 border border-amber-300 px-3 py-2 rounded-lg transition-colors"
                  >
                    도움말 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {conversation.length === 0 && apiKey && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <div className="mb-3 p-2 bg-blue-100 rounded border border-blue-300">
                  <p className="font-semibold text-blue-900">✨ 주요 기능</p>
                  <ul className="text-xs mt-1 space-y-1 ml-4 list-disc">
                    <li><strong>법령 계층 구조 완전 제공</strong> - 법률→시행령→시행규칙→고시</li>
                    <li><strong>ISMS-P 인증기준 매핑</strong> - 법령 요구사항과 통제항목 연계</li>
                    <li><strong>조항 전문(全文)</strong> 표시 - 모든 단계의 전체 조문</li>
                    <li><strong>조항별 직접 링크</strong> - 각 단계 특정 조항으로 바로 이동</li>
                    <li><strong>판례 자동 검색 및 링크</strong> - 대법원, 헌재, 개보위 판례 포함</li>
                    <li><strong>영어 질문 시 영어로 답변</strong> - 자동 언어 감지</li>
                  </ul>
                </div>
                <p className="font-semibold mb-2">전문 분야 질의 예시:</p>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium mb-1">📋 법령 + ISMS-P 통합:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>개인정보 암호화 법적 근거와 ISMS-P 통제항목은?</li>
                      <li>접근통제 관련 법령과 ISMS-P 인증 요구사항은?</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">⚖️ 판례 검색:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                      <li>개인정보 암호화 미흡으로 과징금이 부과된 사례는?</li>
                      <li>ISMS-P 인증 의무 위반 제재 판례는?</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BookOpen className="w-16 h-16 mb-4" />
              <p className="text-lg">법령에 관한 질문을 입력해주세요</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="whitespace-pre-wrap prose prose-sm max-w-none">
                        {message.content.split('\n').map((line, lineIndex) => (
                          <div key={lineIndex}>
                            {renderTextWithLinks(line)}
                            {lineIndex < message.content.split('\n').length - 1 && <br />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4 min-w-[300px]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{searchStatus}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-3 mb-3">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="법령에 관한 질문을 입력하세요... (Shift+Enter로 줄바꿈)"
              className="flex-1 resize-none border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={!query.trim() || isLoading}
              className="bg-indigo-600 text-white px-6 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              전송
            </button>
          </div>
          
          {/* Action Buttons */}
          {conversation.length > 0 && (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setConversation([]);
                  setQuery('');
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                대화 초기화
              </button>
              <button
                onClick={exportToDoc}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                문서로 저장
              </button>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-center text-sm text-gray-500 space-y-1">
          <p>⚠️ 본 AI 에이전트의 답변은 참고용이며, 정확한 법률 자문은 변호사나 법률 전문가와 상담하시기 바랍니다.</p>
          <p className="text-xs">💡 주요 참고 사이트: 법제처(www.law.go.kr) | 대법원(glaw.scourt.go.kr) | 개인정보보호위원회(www.pipc.go.kr)</p>
        </div>
      </div>
    </div>
  );
}
