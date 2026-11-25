# Sky Persia Recycling Submission Portal

A mobile-friendly web application for Sky Persia recycling company where customers can submit items for pickup and pricing.

## Features

- 📱 **Mobile-First Design** - Optimized for smartphone users who scan QR codes
- 🌐 **Bilingual Support** - Japanese (日本語) and English interface
- 📋 **Easy Submission Form** - Collect customer details, item information, and optional photos
- 📧 **Email Notifications** - Submissions sent to company email
- 🔲 **Built-in QR Code** - Generate QR code for easy access to the form
- 🎨 **Modern UI** - Clean, professional design aligned with Sky Persia branding

## Form Fields

The submission form collects:
- Customer name
- Phone number
- Email address
- Item category (computers, appliances, scrap metal, electronics, furniture, bicycles, other)
- Detailed description
- Pickup address/location
- Optional photo upload

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **QR Code**: qrcode library
- **Email**: nodemailer

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Email Configuration

For production email sending, create a `.env.local` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note**: For Gmail, enable 2-factor authentication and generate an app-specific password.

Alternatively, use a dedicated email service like:
- [Resend](https://resend.com)
- [SendGrid](https://sendgrid.com)
- [AWS SES](https://aws.amazon.com/ses/)

## Company Information

**Sky Persia (スカイペルシア)**
- Address: 〒350-0122 埼玉県比企郡川島町下八ツ林731-1
- Phone: 049-297-1355 / 070-9151-1212
- Email: info@skypersia.com
- Website: https://skypersia.com

## License

© 2024 Sky Persia. All rights reserved.
