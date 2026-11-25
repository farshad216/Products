'use client'

import { useState, FormEvent } from 'react'

interface SubmissionFormProps {
  language: 'ja' | 'en'
}

export default function SubmissionForm({ language }: SubmissionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    itemCategory: '',
    description: '',
    address: '',
    photos: [] as File[]
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const translations = {
    ja: {
      name: 'お名前',
      namePlaceholder: '山田太郎',
      phone: '電話番号',
      phonePlaceholder: '090-1234-5678',
      email: 'メールアドレス',
      emailPlaceholder: 'example@email.com',
      itemCategory: '品目カテゴリー',
      selectCategory: 'カテゴリーを選択',
      categories: {
        computer: 'コンピューター・PC',
        appliance: '家電製品',
        metal: '金属スクラップ',
        electronics: '電子機器',
        furniture: '家具',
        bicycle: '自転車',
        other: 'その他'
      },
      description: '詳細説明',
      descriptionPlaceholder: '回収を希望する品物の詳細（種類、数量、状態など）をご記入ください',
      address: '住所・回収場所',
      addressPlaceholder: '埼玉県川島町...',
      photo: '写真（任意）',
      photoButton: '写真を追加',
      noFile: '写真が選択されていません',
      photosSelected: '枚の写真',
      removePhoto: '削除',
      submit: '送信',
      submitting: '送信中...',
      successTitle: '送信完了！',
      successMessage: 'ご依頼ありがとうございます。担当者より営業時間内にご連絡いたします。',
      backButton: '新しい申込',
      requiredField: 'この項目は必須です',
      errorMessage: '送信エラーが発生しました。もう一度お試しください。'
    },
    en: {
      name: 'Name',
      namePlaceholder: 'John Doe',
      phone: 'Phone Number',
      phonePlaceholder: '090-1234-5678',
      email: 'Email Address',
      emailPlaceholder: 'example@email.com',
      itemCategory: 'Item Category',
      selectCategory: 'Select a category',
      categories: {
        computer: 'Computers & PCs',
        appliance: 'Appliances',
        metal: 'Scrap Metal',
        electronics: 'Electronics',
        furniture: 'Furniture',
        bicycle: 'Bicycles',
        other: 'Other'
      },
      description: 'Description',
      descriptionPlaceholder: 'Please describe the items you want picked up (type, quantity, condition, etc.)',
      address: 'Address / Pickup Location',
      addressPlaceholder: 'Kawajima, Saitama...',
      photo: 'Photos (Optional)',
      photoButton: 'Add Photos',
      noFile: 'No photos selected',
      photosSelected: 'photos',
      removePhoto: 'Remove',
      submit: 'Submit',
      submitting: 'Submitting...',
      successTitle: 'Submission Complete!',
      successMessage: 'Thank you for your request. Our staff will contact you during business hours.',
      backButton: 'New Submission',
      requiredField: 'This field is required',
      errorMessage: 'An error occurred while submitting. Please try again.'
    }
  }

  const t = translations[language]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('itemCategory', formData.itemCategory)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('language', language)
      
      formData.photos.forEach((photo, index) => {
        formDataToSend.append(`photo${index}`, photo)
      })

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      setSubmitted(true)
      setFormData({
        name: '',
        phone: '',
        email: '',
        itemCategory: '',
        description: '',
        address: '',
        photos: []
      })
    } catch (err) {
      setError(t.errorMessage)
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-sky-900 mb-3">{t.successTitle}</h3>
          <p className="text-gray-600">{t.successMessage}</p>
        </div>
        <button
          onClick={() => setSubmitted(false)}
          className="bg-gradient-to-r from-sky-600 to-blue-700 text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow font-medium"
        >
          {t.backButton}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            placeholder={t.namePlaceholder}
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.phone} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            placeholder={t.phonePlaceholder}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.email} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            placeholder={t.emailPlaceholder}
          />
        </div>

        {/* Item Category */}
        <div>
          <label htmlFor="itemCategory" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.itemCategory} <span className="text-red-500">*</span>
          </label>
          <select
            id="itemCategory"
            required
            value={formData.itemCategory}
            onChange={(e) => setFormData({ ...formData, itemCategory: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
          >
            <option value="">{t.selectCategory}</option>
            <option value="computer">{t.categories.computer}</option>
            <option value="appliance">{t.categories.appliance}</option>
            <option value="metal">{t.categories.metal}</option>
            <option value="electronics">{t.categories.electronics}</option>
            <option value="furniture">{t.categories.furniture}</option>
            <option value="bicycle">{t.categories.bicycle}</option>
            <option value="other">{t.categories.other}</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.description} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition resize-none"
            placeholder={t.descriptionPlaceholder}
          />
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.address} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            placeholder={t.addressPlaceholder}
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label htmlFor="photos" className="block text-sm font-semibold text-gray-700 mb-2">
            {t.photo}
          </label>
          <div className="space-y-3">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition font-medium inline-block">
              {t.photoButton}
              <input
                type="file"
                id="photos"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    const newPhotos = Array.from(e.target.files)
                    setFormData({ ...formData, photos: [...formData.photos, ...newPhotos] })
                  }
                }}
                className="hidden"
              />
            </label>
            {formData.photos.length === 0 ? (
              <p className="text-sm text-gray-500">{t.noFile}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  {formData.photos.length} {t.photosSelected}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center justify-between">
                        <span className="text-xs text-gray-600 truncate flex-1">
                          {photo.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newPhotos = formData.photos.filter((_, i) => i !== index)
                            setFormData({ ...formData, photos: newPhotos })
                          }}
                          className="ml-2 text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          {t.removePhoto}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white py-4 rounded-lg shadow-md hover:shadow-lg transition-shadow font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t.submitting : t.submit}
        </button>
      </form>
    </div>
  )
}
