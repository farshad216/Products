'use client'

interface LandingPageProps {
  language: 'ja' | 'en'
  onStart: () => void
}

export default function LandingPage({ language, onStart }: LandingPageProps) {
  const translations = {
    ja: {
      company: 'スカイペルシア',
      headline1: '埼玉で一番',
      headline2: '納得の価格で',
      headline3: '金属・リサイクル品を買取',
      features: [
        '💰 高価買取保証',
        '🚚 無料出張査定',
        '⚡ その場で現金払い',
        '♻️ 環境に優しい'
      ],
      description: '不要な金属、家電製品、電子機器を最高価格で買い取ります。15年以上の実績で安心の査定。',
      cta: '回収申込を開始',
      subtitle: '簡単3ステップ'
    },
    en: {
      company: 'Sky Persia',
      headline1: 'Top Prices in Saitama',
      headline2: 'for Your',
      headline3: 'Metal & Recyclables',
      features: [
        '💰 Highest Prices Guaranteed',
        '🚚 Free On-Site Appraisal',
        '⚡ Instant Cash Payment',
        '♻️ Eco-Friendly'
      ],
      description: 'We buy your unwanted metals, appliances, and electronics at the best prices. Over 15 years of trusted service.',
      cta: 'Start Pickup Request',
      subtitle: 'Quick & Easy'
    }
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Animated Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block bg-gradient-to-r from-sky-600 to-blue-700 text-white px-8 py-4 rounded-full shadow-2xl mb-6 animate-bounce-slow">
            <h1 className="text-2xl md:text-3xl font-bold">{t.company}</h1>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center mb-8 animate-slide-up">
          <h2 className="text-4xl md:text-6xl font-bold text-sky-900 mb-4 leading-tight">
            <span className="block animate-fade-in-delay-1">{t.headline1}</span>
            <span className="block text-persia-gold animate-fade-in-delay-2">{t.headline2}</span>
            <span className="block animate-fade-in-delay-3">{t.headline3}</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in-delay-4">
            {t.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-fade-in-delay-5">
          {t.features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-lg text-center transform transition hover:scale-105 animate-pop-in"
              style={{ animationDelay: `${0.6 + index * 0.1}s` }}
            >
              <div className="text-3xl mb-2">{feature.split(' ')[0]}</div>
              <div className="text-sm font-medium text-gray-700">
                {feature.split(' ').slice(1).join(' ')}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center animate-fade-in-delay-6">
          <p className="text-sm text-gray-500 mb-4">{t.subtitle}</p>
          <button
            onClick={onStart}
            className="group relative bg-gradient-to-r from-sky-600 to-blue-700 text-white px-12 py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 font-bold text-xl animate-pulse-slow"
          >
            <span className="relative z-10">{t.cta}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-sky-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-12 text-sm text-gray-500 animate-fade-in-delay-7">
          <p className="mb-1">📞 049-297-1355 / 070-9151-1212</p>
          <p>📧 info@skypersia.com</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pop-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-pop-in {
          animation: pop-in 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animate-fade-in-delay-1 {
          animation: fade-in 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.8s ease-out 0.6s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-4 {
          animation: fade-in 0.8s ease-out 0.8s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-5 {
          animation: fade-in 0.8s ease-out 1s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-6 {
          animation: fade-in 0.8s ease-out 1.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-7 {
          animation: fade-in 0.8s ease-out 1.4s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
