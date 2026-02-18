<div align="center">

  
<img width="1000" height="1024" alt="image" src="https://github.com/user-attachments/assets/8b2c359f-2b7f-40c4-ace3-3bb9130c8f8d" />

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Stellar](https://img.shields.io/badge/Stellar-7D00FF?style=for-the-badge&logo=Stellar&logoColor=white)

[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green?style=flat-square)](https://opensource.org/)


**A donation platform that helps raise funds for pets and animals requiring medical treatment or special care.**

[Conduct](./docs/CODE_OF_CONDUCT.md) • [Security](./docs/SECURITY.md) • [Contributing](./docs/CONTRIBUTING.md)
</div>


# 🐾 Huellas Vivas

Huellas Vivas is a donation platform created to help pets and animals receive the medical care they need.

When a dog needs surgery, a cat requires treatment, or any animal faces high medical expenses, this platform allows people to create fundraising campaigns and receive support from others who care.

**Because every paw leaves a mark.** 🐶🐱

---

## 🌟 What is Huellas Vivas?

Huellas Vivas connects people who need help covering veterinary expenses with people who want to help.

**Users can:**

- Create donation campaigns
- Contribute to existing campaigns
- Share cases with others
- Comment and interact
- Track fundraising progress in real time

The goal is simple: make animal care more accessible through community support.

---

## 💡 How It Works

### 📝 Create a Post

A post includes:

- Title
- Detailed description of the case
- Supporting evidence (photos, videos, medical documents)
- Target fundraising amount
- Real-time progress indicator

Once the goal is reached, the campaign is automatically marked as completed — but it can still receive additional donations.

---

### 💬 Community Interaction

Each post includes:

- A comment section
- The ability to reply to other users
- A visual category indicator (Dog, Cat, Rabbit, Others)

Posts are displayed in a vertical infinite scroll feed, similar to social media platforms.

---

### 🔐 Secure Donations

- Passwords and sensitive data are securely encrypted.
- Donations are protected using blockchain-based escrow logic.
- Donors may request additional proof before releasing funds.
- Transparency is a priority.

---

## 👤 User Features

To donate or create a campaign, users must register.

**Registration includes:**

- Username
- First name
- Last name
- Email
- Secure password
- Optional profile picture

**After registering, users can:**

- Donate
- Raise funds
- Receive notifications
- Manage their profile

---

## 🔔 Notifications

Users receive notifications when:

- A donor requests additional proof
- A fundraiser submits requested proof
- A donation is successfully completed

---

## 🧱 Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| **Frontend** | Next.js, React, TypeScript — minimalist and accessible UI (Tailwind CSS, shadcn/ui) |
| **Backend**  | NestJS — RESTful API, scalable modular structure |

---

## 📂 Repository Structure

This is a **monorepo**: the frontend lives in the root and the API in a separate folder.

```
huellas-vivas/
├── app/              # Next.js App Router (pages, layouts)
├── components/       # Reusable UI (including shadcn/ui)
├── hooks/            # React hooks
├── lib/              # Utilities and shared logic
├── public/           # Static assets
├── backend/          # NestJS API
│   ├── src/          # Application source
│   └── test/         # Backend tests
├── CONTRIBUTING.md   # Setup and contribution guide
└── README.md
```

---

## 📄 Pages

- 🏠 **Home** — Infinite scroll feed
- 📝 **Register**
- 🔐 **Login**
- 👤 **My Profile**

Navigation is handled through a clean sidebar layout.

---

## 🎯 Project Vision

Huellas Vivas aims to:

- Promote transparency in fundraising
- Make donation campaigns accessible
- Build a scalable open-source solution
- Provide a clean and user-friendly experience

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.18+ (20+ recommended)
- **pnpm** (recommended via [Corepack](https://nodejs.org/api/corepack.html)):

  ```bash
  corepack enable
  corepack prepare pnpm@latest --activate
  ```

- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_ORG/huellas-vivas.git
cd huellas-vivas
```

### 2. Install dependencies

**Frontend** (from repo root):

```bash
pnpm install
```

**Backend**:

```bash
pnpm -C backend install
```

### 3. Run the application

Use **two terminals**: one for the frontend, one for the backend.

**Terminal 1 — Frontend:**

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

**Terminal 2 — Backend:**

The API runs on a different port so it doesn’t conflict with Next.js (default 3000).

- **Windows (PowerShell):**
  ```powershell
  $env:PORT=4000
  pnpm -C backend start:dev
  ```
- **Windows (CMD):**
  ```bat
  set PORT=4000&& pnpm -C backend start:dev
  ```
- **macOS / Linux:**
  ```bash
  PORT=4000 pnpm -C backend start:dev
  ```

The API will be available at `http://localhost:4000`.

### 4. Optional: run checks

- **Lint frontend:** `pnpm lint`
- **Build frontend:** `pnpm build`
- **Lint backend:** `pnpm -C backend lint`
- **Test backend:** `pnpm -C backend test`

---

## 🤝 Contributing

We welcome contributions. Please read **[CONTRIBUTING guide](./docs/CONTRIBUTING.md)** for:

- Detailed setup and run instructions
- Code style and project conventions
- Pull request process and commit guidelines

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## 📄 License

This project is currently unlicensed. See repository settings or contact the maintainers for usage terms.
