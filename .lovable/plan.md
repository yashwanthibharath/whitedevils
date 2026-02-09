

# TrustHire – Verified Job & Internship Platform

## Overview
A corporate-styled, secure job and internship verification platform where only admin-verified recruiters can post opportunities, and students can search, filter, and apply with confidence. Built with Lovable Cloud (Supabase) for authentication, database, and realtime features.

---

## 1. Design System & Layout
- **Dark navy/gray professional theme** inspired by LinkedIn's corporate aesthetic
- Consistent sidebar navigation for logged-in users (role-aware)
- Clean typography, formal card layouts, subtle borders
- Responsive design for desktop and mobile

## 2. Authentication & Onboarding
- **Email/password** signup and login
- During signup, users choose their role: **Student** or **Recruiter**
- Automatic profile creation on signup via database trigger
- Role stored in a separate `user_roles` table (never on profiles)
- Protected routes based on role (student, recruiter, admin)

## 3. Admin Dashboard
- **Verification Requests**: Review and approve/reject recruiter verification submissions
- **Job Moderation**: View all posted jobs, approve/reject/remove listings
- **Scam Reports**: Review reports submitted by students with action options
- **User Management**: View all users, their roles, and account status
- **Platform Analytics**: Overview cards showing total users, jobs posted, reports filed, pending verifications

## 4. Recruiter Experience
- **Company Profile**: Create and edit company details (name, logo URL, description, website, industry)
- **Verification Request**: Submit a verification request with supporting details; see status (Pending / Approved / Rejected)
- **Job Posting** (only if verified): Create job listings with title, description, location, type (internship/full-time), salary range, deadline
- **My Jobs**: View all posted jobs and their approval status
- **Applications**: View students who applied to their jobs

## 5. Student Experience
- **Job Browse & Search**: Search by job title, company name, or location
- **Filters & Sorting**: Filter by internship vs full-time; sort by latest, location; only verified recruiters' jobs shown
- **Verified Badge**: Clear "Verified" badge on recruiter/company cards
- **Apply**: One-click apply with optional cover message
- **My Applications**: Track application status
- **Report**: Flag suspicious job listings with a reason

## 6. Messaging System
- Realtime messaging between students and recruiters
- Conversation threads tied to job applications
- Message notifications within the platform

## 7. Database Structure (Lovable Cloud)
- **profiles** – user details (name, avatar URL, bio)
- **user_roles** – separate role table (admin, recruiter, student)
- **companies** – recruiter company profiles
- **verification_requests** – recruiter verification submissions & status
- **jobs** – job/internship listings with approval status
- **applications** – student applications to jobs
- **reports** – student-submitted scam/suspicious activity reports
- **messages** – realtime messaging between users
- RLS enabled on all tables with `has_role()` security definer function

## 8. Key Security Rules
- Unverified recruiters **cannot** post jobs
- Students only see **approved** jobs from **verified** recruiters
- RLS policies enforce role-based data access throughout
- Admin role checked server-side, never via client storage

