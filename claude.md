# Gradex - AI-Powered Educational Grading Platform

## Project Overview

Gradex is an AI-powered SaaS platform for educational institutions that automates assignment grading and provides instant feedback to students. Teachers create classes and assignments, students submit work, and the platform uses OpenAI GPT-4o-mini to evaluate submissions.

## Brand Color Scheme

**IMPORTANT:** Always use this color scheme for all UI components, buttons, badges, cards, and styling.

| Element | Tailwind Class | Hex Code |
|---------|---------------|----------|
| **Primary** | `violet-600` | `#7C3AED` |
| **Primary Hover** | `violet-700` | `#6D28D9` |
| **Primary Light** | `violet-500` | `#8B5CF6` |
| **Light Background** | `violet-50` | `#F5F3FF` |
| **Light Background Alt** | `violet-100` | `#EDE9FE` |
| **Text on Light BG** | `violet-700`, `violet-800`, `violet-900` | - |
| **Borders** | `violet-200`, `violet-300` | - |
| **Page Background** | `white` | `#FFFFFF` |

### Color Usage Rules
- **Buttons:** `bg-violet-600 hover:bg-violet-700 text-white`
- **Outline Buttons:** `border-violet-200 text-violet-700 hover:bg-violet-50`
- **Cards/Badges:** `bg-violet-50 text-violet-700 border-violet-200`
- **Icons:** `text-violet-500` or `text-violet-600`
- **Focus rings:** `ring-violet-500` or `focus:ring-violet-500`
- **Progress bars:** `bg-violet-500` or `bg-violet-600`
- **Links:** `text-violet-600 hover:text-violet-700`

### DO NOT use these colors (replaced by violet):
- `blue-*` classes
- `purple-*` classes
- `indigo-*` classes
- `cyan-*` classes
- `teal-*` classes
- `sky-*` classes
- `orange-*` classes
- `amber-*` classes
- `yellow-*` classes
- `pink-*` classes
- `rose-*` classes
- `emerald-*` classes
- `green-*` classes (except for success states like form validation)

**Note:** Only use `green` for success indicators (e.g., "Saved successfully"), `red` for errors/destructive actions, and `yellow` for warnings. All other UI elements should use violet.

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19
- **Language:** TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS 4 with Radix UI components
- **Database:** PostgreSQL with Prisma 6 ORM
- **Authentication:** NextAuth.js 4 with JWT sessions
- **AI:** OpenAI API (gpt-4o-mini model)
- **File Storage:** Cloudinary
- **Email:** Resend / Nodemailer

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API route handlers
│   ├── dashboard/         # Dashboard pages (student/teacher)
│   ├── admin/             # Teacher admin panel
│   ├── login/             # Auth pages
│   └── join/              # Class enrollment
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn-style)
│   ├── assignments/      # Assignment-related modals
│   ├── classes/          # Class management components
│   └── auth/             # Login/register forms
├── lib/                   # Utilities and configurations
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client singleton
│   └── cloudinary.ts     # Cloudinary config
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## Key Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Database Models

Core entities: `User`, `Class`, `Assignment`, `Submission`, `ClassEnrollment`, `UserProfile`

- **User roles:** `client` (teacher) or `student`
- **Submission status:** `pending`, `submitted`, `graded`

## Code Conventions

### File Organization
- API routes use RESTful conventions with GET, POST, PUT, DELETE handlers
- Components are organized by feature (assignments/, classes/, auth/)
- Client components require `"use client"` directive

### Patterns
- Validate requests with Zod schemas in API routes
- Use `getServerSession(authOptions)` for authentication in API routes
- Use the `cn()` utility from `lib/utils.ts` for className merging
- Prisma queries should use the singleton from `lib/prisma.ts`

### API Route Structure
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... handler logic
}
```

### Component Structure
```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  // typed props
}

export function ComponentName({ ...props }: Props) {
  // component logic
}
```

## Protected Routes

Middleware protects these paths:
- `/admin/*` - Teacher admin panel
- `/api/protected/*` - Protected API endpoints

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
OPENAI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Important Notes

- Prisma client is generated to `src/generated/prisma/` - run `npx prisma generate` after schema changes
- File uploads are limited to 5MB and stored on Cloudinary
- AI grading endpoint: `/api/submissions/ai-grade`
- Manual grading endpoint: `/api/submissions/grade`
- The platform uses a subscription-based model with pricing tiers

## Testing

No formal test framework is currently configured. Consider adding Jest + React Testing Library for future testing needs.
