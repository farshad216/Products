'use client'

import { useState } from 'react'
import LandingPage from './components/LandingPage'
import SubmissionForm from './components/SubmissionForm'
import QRCodeDisplay from './components/QRCodeDisplay'
import LanguageToggle from './components/LanguageToggle'

export default function Home() {
  const [language, setLanguage] = useState<'ja' | 'en'>('ja')
  const [showQR, setShowQR] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const translations = {
    ja: {
      title: 'リサイクル品回収申込',
      subtitle: '不要な金属・家電製品の回収をご依頼ください',
      company: 'スカイペルシア',
      showQR: 'QRコード表示',
      hideQR: 'QRコードを隠す'
    },
    en: {
      title: 'Recycling Pickup Request',
      subtitle: 'Request pickup for unwanted metals and electronics',
      company: 'Sky Persia',
      showQR: 'Show QR Code',
      hideQR: 'Hide QR Code'
    }
  }

  const t = translations[language]

  if (!showForm) {
    return <LandingPage language={language} onStart={() => setShowForm(true)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white px-6 py-2 rounded-full shadow-lg">
                <h1 className="text-lg font-bold">{t.company}</h1>
              </div>
            </div>
            <div className="flex-1 flex justify-end">
              <LanguageToggle language={language} setLanguage={setLanguage} />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-sky-900 mb-3">
            {t.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* QR Code Toggle Button */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowQR(!showQR)}
            className="bg-gradient-to-r from-persia-gold to-amber-600 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow font-medium"
          >
            {showQR ? t.hideQR : t.showQR}
          </button>
        </div>

        {/* QR Code Display */}
        {showQR && (
          <div className="mb-8">
            <QRCodeDisplay language={language} />
          </div>
        )}

        {/* Submission Form */}
        <SubmissionForm language={language} />

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p className="mb-2">
            {language === 'ja' 
              ? '〒350-0122 埼玉県比企郡川島町下八ツ林731-1'
              : '731-1 Shimoyatsubayashi, Kawajima, Hiki District, Saitama 350-0122'}
          </p>
          <p className="mb-2">
            {language === 'ja' ? '電話' : 'Phone'}: 049-297-1355 / 070-9151-1212
          </p>
          <p className="mb-4">
            Email: info@skypersia.com
          </p>
          <p className="text-xs">
            © 2024 Sky Persia. {language === 'ja' ? '全著作権所有' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </div>
  )
}
