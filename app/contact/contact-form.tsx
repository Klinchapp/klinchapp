'use client'

import { useState } from 'react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [company, setCompany] = useState('') // honeypot
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, company }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'Something went wrong. Please try again.')
        return
      }

      setStatus('success')
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-[#F3E8FF] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#6B2C6B]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Message sent</h2>
        <p className="text-gray-600">Thanks — we'll get back to you as soon as we can.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-[#6B2C6B] font-semibold hover:underline"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">Your name</label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B2C6B] focus:border-transparent"
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">Email address</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B2C6B] focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
        <textarea
          id="message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minLength={10}
          maxLength={5000}
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6B2C6B] focus:border-transparent resize-y"
          placeholder="What can we help with?"
        />
      </div>

      {/* Honeypot — visually hidden, real users won't fill it */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">Company (leave empty)</label>
        <input
          id="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-sm">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full sm:w-auto px-8 py-4 bg-[#6B2C6B] text-white rounded-xl font-bold text-lg hover:bg-[#8B3A8B] transition-all shadow-lg shadow-[#6B2C6B]/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>

      <p className="text-gray-500 text-sm">
        We typically reply within 1–2 business days. By submitting, you agree to our{' '}
        <a href="/privacy" className="text-[#6B2C6B] hover:underline">Privacy Policy</a>.
      </p>
    </form>
  )
}
