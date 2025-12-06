# 🍽️ X-Group Feedback System

A modern, lightweight guest feedback application for X-Group Hospitality restaurants. Built with Next.js 15, React 19, and Tailwind CSS for optimal performance and user experience.

![X-Group Feedback](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwind-css)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)

---

## ✨ Features

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Beautiful frosted glass effects with backdrop blur
- **Animated Gradient Background** - Smooth, eye-catching gradient animations with floating orbs
- **Responsive Layout** - Perfect experience on mobile, tablet, and desktop
- **Micro-interactions** - Smooth hover effects, transitions, and animations
- **Accessibility First** - WCAG compliant with keyboard navigation support

### 📝 Smart Form Features
- **Real-time Validation** - Visual feedback with red borders for required fields
- **Progressive Validation** - Errors clear as user types
- **Multi-branch Support** - Dynamic branch selection via URL parameters
- **Auto-generated IDs** - Unique feedback reference numbers
- **Optional Ratings** - 4 categories (Food, Service, Environment, Overall) with 3 levels each
- **Color-coded Ratings** - Distinct colors for Excellent (purple), Good (light purple), Average (gray)

### ⚡ Performance Optimized
- **81% CSS Reduction** - Migrated from 540 lines of custom CSS to 100 lines with Tailwind
- **Tailwind JIT** - Only includes used CSS classes in production
- **Next.js 15** - Latest performance improvements and optimizations
- **React 19** - Cutting-edge React features
- **Font Optimization** - Next.js font loading for Poppins, Inter, Outfit, and JetBrains Mono

### 🔒 Robust Architecture
- **TypeScript** - Full type safety throughout the application
- **API Routes** - Built-in Next.js API for feedback submission
- **Error Handling** - Comprehensive error states and retry logic
- **Mock API** - Development-ready with simulated backend responses

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd x-group-feedback-2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Branch Selection

Access different branches via URL parameter:
```
http://localhost:3000?branch=x-01  # Default branch
http://localhost:3000?branch=x-02  # Branch 2
http://localhost:3000?branch=x-03  # Branch 3
```

---

## 📁 Project Structure

```
x-group-feedback-2.0/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── feedback/
│   │   │       └── route.ts          # API endpoint for feedback submission
│   │   ├── globals.css               # Minimal global styles (100 lines)
│   │   ├── layout.tsx                # Root layout with fonts
│   │   └── page.tsx                  # Main feedback form page
│   ├── components/
│   │   ├── Input.tsx                 # Glassmorphism input component
│   │   └── RatingRow.tsx             # Rating button component
│   ├── lib/
│   │   └── api.ts                    # API client with retry logic
│   └── types/
│       └── index.ts                  # TypeScript type definitions
├── public/
│   └── logo.webp                     # X-Group logo
└── package.json
```

---

## 🎨 Design System

### Color Palette
```css
--brand-primary: hsl(238, 48%, 34%)        /* Deep purple */
--brand-primary-light: hsl(238, 55%, 65%)  /* Light purple */
--brand-glow: hsl(238, 60%, 70%)           /* Glow effect */
--brand-dark: hsl(238, 52%, 25%)           /* Dark purple */
```

### Typography
- **Primary**: Poppins (300, 400, 500, 600, 700, 800)
- **Body**: Inter
- **Display**: Outfit
- **Monospace**: JetBrains Mono

### Rating Colors
- **Excellent**: Dark purple (`--brand-dark`)
- **Good**: Light purple (`--brand-primary-light`)
- **Average**: Slate gray

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.7 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Lucide React** | 0.556.0 | Icon library |

---

## 📊 API Reference

### POST `/api/feedback`

Submit guest feedback.

**Request Body:**
```typescript
{
  feedbackId: string;           // Unique ID (e.g., "019392")
  branchCode: string;           // Branch code (e.g., "X-01")
  branchName: string;           // Branch name
  submittedAt: string;          // ISO timestamp
  guest: {
    name: string;               // Guest name (required)
    contact: string;            // Email or phone (required)
  };
  ratings: {
    FOOD: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
    SERVICE: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
    ENVIRONMENT: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
    OVERALL: "EXCELLENT" | "GOOD" | "AVERAGE" | null;
  };
  comments: string | null;      // Optional feedback text
}
```

**Response:**
```typescript
{
  success: true,
  message: "Feedback submitted successfully",
  feedbackId: string
}
```

---

## 🔧 Configuration

### Branch Configuration

Edit `BRANCH_MAP` in `src/app/page.tsx`:

```typescript
const BRANCH_MAP: Record<string, string> = {
  "X-01": "Xian Restaurant",
  "X-02": "Branch Name 2",
  "X-03": "Branch Name 3",
  // Add more branches...
};
```

### Styling Customization

Modify CSS variables in `src/app/globals.css`:

```css
:root {
  --brand-primary: 238 48% 34%;
  --brand-primary-light: 238 55% 65%;
  --brand-glow: 238 60% 70%;
  --brand-dark: 238 52% 25%;
}
```

---

## 📦 Build & Deploy

### Production Build
```bash
npm run build
npm start
```

### Deploy to Vercel
```bash
vercel deploy
```

### Environment Variables
No environment variables required for basic setup. Configure as needed for production database integration.

---

## 🎯 Key Improvements Made

### UX Enhancements
✅ Visual validation feedback with red borders  
✅ Progressive validation (clears on user input)  
✅ Improved accessibility (10px labels, 3px focus outlines)  
✅ Color-coded rating buttons  

### Performance Optimizations
✅ 81% CSS reduction (540 → 100 lines)  
✅ Removed 3 unnecessary `useMemo` calls  
✅ Tailwind JIT for optimal bundle size  
✅ Next.js font optimization  

### Code Quality
✅ Full TypeScript coverage  
✅ Clean component architecture  
✅ Reusable utility components  
✅ Comprehensive error handling  

---

## 📝 License

Private - X-Group Hospitality Systems © 2025

---

## 🤝 Contributing

This is a private project for X-Group Hospitality. For internal contributions, please contact the development team.

---

## 📞 Support

For technical support or questions, contact the X-Group IT department.

---

**Built with ❤️ for X-Group Hospitality**
