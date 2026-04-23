# BitGo Fast Activation — 26Q2 Prototype

A design prototype exploring a streamlined onboarding and activation experience for new BitGo customers. Built as self-contained HTML files — no build step, no dependencies.

**Live prototype:** https://phyllisfei-bg.github.io/26Q2-fast-activation/flow.html

---

## Project Goal

Fast Activation (FA) is a Q2 2026 initiative to accelerate time-to-value for new BitGo customers. The goal is to get businesses and their users through compliance verification and into their first meaningful platform actions as quickly as possible — reducing drop-off, shortening onboarding time, and delivering a role-appropriate experience from day one.

The prototype covers three sequential stages: entity-level compliance (KYB), individual user verification (KYC), and a role-based getting-started dashboard that surfaces the right priorities for each user type immediately after first login.

---

## Flows

### 1. KYB — Business Verification (`bitgo-KYB.html`)
Targets the legal person or entity initiating the BitGo account. Covers entity identity collection, ownership structure disclosure, and compliance checks. This is typically completed by a company representative before any individual users are invited.

### 2. KYC — User Verification (`bitgo-kyc.html`)
Targets invited platform admins and users assigned default roles. Covers individual identity verification and initial goal-setting to personalize the experience downstream.

### 3. Getting Started Dashboard (`bitgo-dashboard.html`)
The post-verification landing experience. Surfaces role-based priority actions, business product recommendations, and a personalized "For You" section based on the user's stated goals from KYC.

---

## File Map

| File | Description |
|---|---|
| `flow.html` | Entry point — visual map linking all three flows |
| `bitgo-KYB.html` | KYB flow (business / entity verification) |
| `bitgo-kyc.html` | KYC flow (platform admins and default-role users) |
| `bitgo-dashboard.html` | Getting Started dashboard (role-based + For You) |
| `card-hover-exploration.html` | Card hover interaction sandbox |

---

## Design

Built on the Kintsugi design system with full dark/light mode support. Theme toggle is available in the top-right corner of each flow screen.
