# Gradex - Enterprise Roadmap

> Post-MVP feature plan for scaling Gradex into an enterprise-grade educational grading platform.
>
> **Status:** Planning | **Last Updated:** January 2026

---

## Phase 1 - Security & Stability

These items are blockers for any production deployment and should be addressed first.

### 1.1 Testing Framework

- Set up Jest + React Testing Library
- Unit tests for all API routes (`/api/assignments`, `/api/submissions`, `/api/classes`, etc.)
- Component tests for critical UI flows (login, registration, submission, grading)
- Integration tests for auth flow and role-based access
- CI pipeline integration - block merges on failing tests
- Target: minimum 80% coverage on API routes

### 1.2 Rate Limiting

- Add rate limiting middleware to all API routes
- Strict limits on AI grading endpoint (`/api/submissions/ai-grade`) to prevent abuse
- Per-user and per-IP throttling
- Return proper `429 Too Many Requests` responses
- Suggested: `next-rate-limit` or custom middleware with Redis backing

### 1.3 Input Sanitization & Security Hardening

- Tighten Zod schemas across all API routes
- Add XSS protection on all user-generated content (assignment descriptions, submission text, feedback)
- Strict file type validation on uploads (whitelist allowed MIME types)
- Add CSRF protection
- Content Security Policy (CSP) headers
- Dependency audit (`npm audit`) as part of CI

### 1.4 Error Monitoring

- Integrate Sentry for real-time error tracking
- Configure source maps for production builds
- Set up error boundaries in React components
- Alert channels (Slack/email) for critical errors
- Performance monitoring (page load times, API response times)

### 1.5 Structured Logging

- Add Pino or Winston for structured JSON logging
- Log levels: error, warn, info, debug
- Request/response logging middleware for API routes
- Correlation IDs for request tracing
- Log aggregation setup (e.g., Datadog, Logtail, or ELK stack)

---

## Phase 2 - Core Enterprise Features

Features required for institutional adoption and revenue generation.

### 2.1 Payment Integration (Stripe)

- Stripe Checkout for subscription plans
- Implement pricing tiers defined in dashboard UI:
  - Free tier (limited classes/assignments)
  - Pro tier (unlimited classes, AI grading)
  - Enterprise tier (custom limits, priority support)
- Stripe webhooks for subscription lifecycle (created, updated, cancelled, payment failed)
- Usage-based billing for AI grading credits
- Invoice generation and billing history page
- Subscription management UI (upgrade, downgrade, cancel)

### 2.2 Role-Based Access Control (RBAC)

- Middleware-level authorization per route
- Granular permissions beyond basic teacher/student roles:
  - `admin` - platform administrator
  - `teacher` - class and assignment management
  - `teaching_assistant` - limited grading access
  - `student` - submission and viewing access
- Permission checks on every API endpoint
- UI elements hidden/shown based on permissions

### 2.3 Audit Logging

- Log all write operations (create, update, delete) with:
  - User ID and role
  - Action performed
  - Resource affected
  - Timestamp
  - IP address
- Dedicated `AuditLog` database table
- Admin UI to view and filter audit logs
- Exportable audit reports for compliance

### 2.4 Email & Notification System

- Transactional email service (Resend fully integrated)
- Email templates for:
  - Welcome / registration confirmation
  - Assignment published notification
  - Submission received confirmation
  - Grade available notification
  - Class invitation
  - Password reset
- In-app notification center (bell icon with unread count)
- Email preferences page (opt-in/opt-out per notification type)

### 2.5 Grade Export

- Export grades to CSV and Excel (XLSX)
- Per-class and per-assignment export
- Bulk export for all classes
- Include: student name, assignment title, marks, percentage, grade letter, feedback summary
- Downloadable from teacher admin dashboard

---

## Phase 3 - AI & Academic Integrity

Enhancing the AI grading capabilities and adding integrity features.

### 3.1 Upgrade to GPT-4o-mini

- Replace OpenRouter/Mistral with direct OpenAI GPT-4o-mini API
- Improved grading accuracy and feedback quality
- Configurable AI model per institution (allow enterprise clients to choose model)
- Fallback chain: primary model -> secondary model -> manual grading queue

### 3.2 Plagiarism Detection

- Integrate plagiarism checking on submissions
- Cross-reference against:
  - Other student submissions within the same class
  - Other submissions across the platform
  - External sources (optional, via third-party API)
- Similarity score displayed to teachers
- Flag submissions above a configurable threshold
- Plagiarism report with highlighted matching sections

### 3.3 AI Grading Improvements

- Rubric-based grading (teachers define rubrics, AI follows them)
- Multi-criteria scoring (content, structure, grammar, originality)
- Confidence score on AI grades
- Teacher override and feedback loop to improve AI accuracy
- Batch/bulk AI grading with progress tracking
- Queue-based processing (Bull/BullMQ with Redis) for large batches

---

## Phase 4 - Platform Scalability

Infrastructure and architecture changes for handling institutional scale.

### 4.1 Multi-Tenancy & Organization Support

- Organization/institution entity in database
- Data isolation between organizations
- Organization-level settings and branding
- Org admin role for managing teachers within an institution
- SSO integration (SAML/OAuth) per organization

### 4.2 Background Job Processing

- Redis + BullMQ for async task processing
- Job queues for:
  - AI grading (move out of request-response cycle)
  - Email sending
  - Report generation
  - File processing
- Job dashboard for monitoring (Bull Board)
- Retry logic and dead letter queues

### 4.3 Caching Layer

- Redis caching for frequently accessed data:
  - Class lists and student counts
  - Assignment details
  - Dashboard aggregations
- Cache invalidation strategy
- Session storage migration from JWT-only to Redis-backed sessions

### 4.4 Database Optimization

- Database indexing strategy for common queries
- Read replicas for heavy read operations
- Connection pooling (PgBouncer or Prisma Accelerate)
- Regular backup strategy (automated daily backups)
- Migration testing in staging environment before production

### 4.5 Horizontal Scaling

- Stateless application design (no in-memory state)
- Container orchestration (Kubernetes or Docker Swarm)
- Load balancer configuration
- Auto-scaling policies based on CPU/memory/request count
- CDN for static assets

---

## Phase 5 - Advanced Features

Features that differentiate Gradex and add long-term value.

### 5.1 Analytics Dashboard

- Teacher analytics:
  - Class performance trends over time
  - Assignment difficulty analysis (average scores, distribution)
  - Student progress tracking
  - Submission rate and timeliness metrics
- Student analytics:
  - Personal grade trends
  - Subject-wise performance
  - Comparison with class averages (anonymized)
- Charts and visualizations (Recharts or Chart.js)

### 5.2 Grade Appeals System

- Students can submit appeals on graded assignments
- Appeal form with reason and supporting evidence
- Teacher review queue for appeals
- Appeal status tracking (pending, reviewed, accepted, rejected)
- Audit trail for appeal decisions

### 5.3 Teacher-Student Messaging

- In-app messaging between teachers and students
- Per-assignment discussion threads
- File attachments in messages
- Read receipts and unread indicators
- Notification integration (email + in-app)

### 5.4 LMS Integration

- Webhook support for external LMS platforms
- REST API with API key authentication for third-party integrations
- LTI (Learning Tools Interoperability) support
- Import/export compatibility with:
  - Google Classroom
  - Canvas
  - Moodle
  - Blackboard

### 5.5 API Documentation

- OpenAPI/Swagger specification for all API routes
- Interactive API explorer
- API versioning strategy (v1, v2)
- Developer portal for third-party integrations
- Rate limit documentation per endpoint

### 5.6 Internationalization (i18n)

- Multi-language support using `next-intl` or `next-i18next`
- Initial languages: English, Urdu, Arabic
- RTL layout support
- Locale-aware date and number formatting
- Language switcher in UI

---

## Database Schema Additions (Planned)

New models needed for enterprise features:

```
Organization        - Multi-tenancy support
Subscription        - Stripe subscription tracking
Payment             - Payment history
AuditLog            - Action logging
Notification        - In-app notifications
NotificationPrefs   - User notification settings
Appeal              - Grade appeals
Message             - Teacher-student messaging
Rubric              - AI grading rubrics
RubricCriteria      - Individual rubric items
PlagiarismReport    - Plagiarism check results
ApiKey              - Third-party API access
JobQueue            - Background job tracking
```

---

## Priority Matrix

| Priority | Phase | Timeline Target |
|----------|-------|-----------------|
| P0 | Phase 1 - Security & Stability | Before any production users |
| P1 | Phase 2 - Core Enterprise | First 2 paying institutions |
| P1 | Phase 3 - AI & Integrity | Alongside Phase 2 |
| P2 | Phase 4 - Scalability | When hitting performance limits |
| P3 | Phase 5 - Advanced Features | Based on user demand |

---

## Notes

- This roadmap is a living document and will be updated as requirements evolve.
- Each phase should be completed with proper testing before moving to the next.
- Security and stability (Phase 1) is non-negotiable before production deployment.
- Feature prioritization within phases may change based on institutional feedback.
