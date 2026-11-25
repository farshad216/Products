'use client'

import { useEffect, useState } from 'react'

interface QRCodeDisplayProps {
  language: 'ja' | 'en'
}

export default function QRCodeDisplay({ language }: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const translations = {
    ja: {
      title: 'QRコード',
      description: 'スマートフォンでスキャンして申込フォームにアクセス',
      loading: '読み込み中...'
    },
    en: {
      title: 'QR Code',
      description: 'Scan with your smartphone to access the submission form',
      loading: 'Loading...'
    }
  }

  const t = translations[language]

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true)
        const formUrl = window.location.origin
        const response = await fetch(`/api/qrcode?url=${encodeURIComponent(formUrl)}`)
        const data = await response.json()
        setQrCodeUrl(data.qrCode)
      } catch (error) {
        console.error('Error fetching QR code:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchQRCode()
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
      <h3 className="text-xl font-bold text-sky-900 mb-2">{t.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{t.description}</p>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">{t.loading}</p>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg border-4 border-sky-600 inline-block">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-64 h-64"
            />
          </div>
        </div>
      )}
    </div>
  )
}
