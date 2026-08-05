<div align="center">

# 🍳 Kitchen2Company

### AI-Powered Business Launch Assistant for Food Entrepreneurs in India

Turn your home kitchen into a legally compliant food business using AI-powered business assessments, personalized launch roadmaps, and official government resources.

🏆 **Built by Team Tomb of Nazarick**

🚀 **Built using Natively AI**

🎥 **Demo Video:** <https://youtube.com/your-demo-link>

🌐 **Live Demo:** <https://your-live-demo-url>

</div>

---

# 📖 Problem Statement

Every year, thousands of aspiring food entrepreneurs in India dream of starting businesses like home kitchens, cloud kitchens, bakeries, catering services, food trucks, and meal prep brands.

However, navigating the legal and regulatory landscape is overwhelming for first-time founders.

Common questions include:

- Which business structure should I choose?
- Do I need GST registration?
- Which FSSAI licence applies to me?
- What registrations are mandatory?
- Where can I find the official government portals?
- What should I do first?

The information exists—but it is scattered across multiple government websites, making the launch process confusing, time-consuming, and intimidating.

---

# 💡 Our Solution

Kitchen2Company is an AI-powered business launch assistant that transforms a simple consultation into a personalized launch strategy.

Instead of spending hours researching regulations, entrepreneurs receive:

- 🤖 AI-generated business assessment
- 🏢 Recommended business structure
- 📋 Personalized registration checklist
- 📈 Launch readiness score
- 🛣 Step-by-step launch roadmap
- 🌐 Official government resources
- 📄 Professional downloadable PDF report

Our goal is simple:

> **Help aspiring food entrepreneurs spend less time navigating paperwork and more time building their business.**

---

# ✨ Key Features

## 🤖 AI Business Consultation

Users complete a guided consultation covering:

- Business Type
- Location
- Kitchen Type
- Sales Channels
- Team Size
- Growth Goals

This information is transformed into a structured Business Profile.

---

## 🧠 AI Business Assessment

Powered by **DeepSeek V4 Flash** via **AI/ML API**.

The AI generates:

- Recommended Business Structure
- Personalized Reasoning
- Required Registrations
- Launch Readiness Score
- Next Best Action
- Official Government Resources

Every AI response is validated before being displayed to ensure a consistent and reliable experience.

---

## 🌐 Bright Data Integration

Kitchen2Company integrates **Bright Data** to retrieve official government resources.

Examples include:

- FSSAI
- GST Portal
- UDYAM
- Municipal Trade Licences
- Fire & Safety Portals

This helps entrepreneurs access authoritative government information directly from the platform.

---

## 🛣 Personalized Launch Roadmap

Every consultation generates a launch roadmap tailored to the entrepreneur's profile.

The roadmap outlines:

- Recommended order of registrations
- Business milestones
- Compliance steps
- Launch preparation tasks

---

## 📄 Professional PDF Report

Users can instantly download a comprehensive launch report containing:

- Business Profile
- Business Structure Recommendation
- Registration Checklist
- Launch Readiness Score
- AI Reasoning
- Government Resources
- Personalized Roadmap

---

# 🎯 Highlights

- 🤖 AI-powered business recommendations
- 🌐 Bright Data integration for official resources
- 📄 Downloadable launch reports
- 🛣 Dynamic launch roadmap
- 🛡 Automatic rule-based fallback if AI is unavailable
- ⚡ Built with modern full-stack technologies

---

# 🏗 Architecture

<p align="center">
  <img src="" width="900">
</p>

---

# ⚙ Tech Stack

## Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router

## Backend

- Supabase Edge Functions

## AI

- DeepSeek V4 Flash
- AI/ML API
- Structured JSON Validation

## External Services

- Bright Data
- Supabase

---

# 🔄 AI Workflow

```text
Business Profile

↓

DeepSeek AI

↓

Structured JSON Response

↓

Validation Layer

↓

Business Assessment

↓

Dashboard

↓

Roadmap

↓

PDF Report
```

---

# 🛡 Reliability

Kitchen2Company is designed with graceful degradation.

If the AI service becomes unavailable:

```text
AI Failure

↓

Rule-Based Assessment

↓

Application Continues Normally
```

This ensures entrepreneurs always receive actionable guidance.

---

# 📸 Screenshots

> Add screenshots here.

- Landing Page
- Consultation Flow
- AI Dashboard
- Launch Roadmap
- PDF Report
- Mobile View

---

# 🚀 Getting Started

```bash
git clone https://github.com/<your-username>/Kitchen2Company.git

cd Kitchen2Company

npm install

npm run dev
```

---

# 🔐 Environment Variables

```env
OPENAI_API_KEY=

BRIGHTDATA_API_TOKEN=

SUPABASE_URL=

SUPABASE_ANON_KEY=
```

> **Note:** `OPENAI_API_KEY` stores the AI/ML API key because the Edge Function uses the OpenAI-compatible API interface.

---

# 📂 Project Structure

```text
src/
├── components/
├── pages/
├── services/
├── hooks/
├── types/

supabase/
└── functions/
```

---

# 🗺 Roadmap

## ✅ Version 1

- AI Business Assessment
- Bright Data Integration
- Personalized Launch Roadmap
- PDF Report Generation
- Rule-Based AI Fallback

## 🚀 Version 2

- 🎤 Speechmatics Voice Consultation
- Voice-to-Business Profile Extraction
- Multilingual Voice Support
- Compliance Reminder System
- Investor-Ready Business Reports

---

# 👤 Team

## **Team Name**

**Tomb of Nazarick**

### **Member**

**Vansh** *(Solo Developer)*

### Responsibilities

- Product Design
- Frontend Development
- Backend Integration
- AI Integration
- Bright Data Integration
- Supabase Edge Functions
- Prompt Engineering
- UI/UX Design
- Testing & Deployment

---

# 🙏 Acknowledgements

Built by **Team Tomb of Nazarick** for the **AMD AI Hackathon**.

Special thanks to the technologies and platforms powering this project:

- 🏗 Natively AI
- 🤖 AI/ML API
- 🧠 DeepSeek V4 Flash
- 🌐 Bright Data
- ⚡ Supabase
- ⚛ React
- 🎨 Tailwind CSS
- 🚀 Vite

---

# ⭐ Support

If you found this project interesting, please consider giving it a ⭐ on GitHub.

It helps us improve Kitchen2Company and continue building tools that empower aspiring entrepreneurs.

---

<div align="center">
### 🍳 Kitchen2Company

**From Kitchen to Company — One Smart Step at a Time.**
</div>