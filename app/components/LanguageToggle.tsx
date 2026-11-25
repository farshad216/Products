interface LanguageToggleProps {
  language: 'ja' | 'en'
  setLanguage: (lang: 'ja' | 'en') => void
}

export default function LanguageToggle({ language, setLanguage }: LanguageToggleProps) {
  return (
    <div className="flex gap-2 bg-white rounded-lg shadow-md p-1">
      <button
        onClick={() => setLanguage('ja')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'ja'
            ? 'bg-sky-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        日本語
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-sky-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        English
      </button>
    </div>
  )
}
