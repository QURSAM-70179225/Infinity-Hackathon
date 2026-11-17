// Admin only: paste a meeting transcript and let AI create the projects and tasks.
import { useState } from 'react'
import { api } from '../services/api.js'
import { SAMPLE_TRANSCRIPT } from '../utils/sampleTranscript.js'
import Icon from './Icon.jsx'
import OverloadReview from './OverloadReview.jsx'
import { Spinner } from './States.jsx'

export default function TranscriptPanel({ onCreated }) {
  const [transcript, setTranscript] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error | invalid | overload
  const [message, setMessage] = useState('')
  const [issues, setIssues] = useState([])
  const [draftText, setDraftText] = useState('')
  const [overload, setOverload] = useState(null)

  const loading = status === 'loading'

  function handleFailure(err) {
    if (err.status === 409 && err.data?.code === 'OVERLOAD') {
      // The draft is valid, but a developer would go over 40 hours. Review before saving.
      setStatus('overload')
      setOverload(err.data)
    } else if (err.status === 422 && err.data?.errors) {
      // The AI answered, but some people or dates could not be resolved.
      setStatus('invalid')
      setMessage(err.message)
      setIssues(err.data.errors)
      setDraftText(JSON.stringify(err.data.draft, null, 2))
    } else {
      setStatus('error')
      setMessage(err.message)
    }
  }

  function handleSuccess(data) {
    setStatus('success')
    setMessage(data.model ? `${data.message} Processed by ${data.provider} (${data.model}).` : data.message)
    setIssues([])
    setDraftText('')
    setOverload(null)
    setTranscript('')
    onCreated()
  }

  async function createFromTranscript() {
    if (loading || !transcript.trim()) return
    setStatus('loading')
    try {
      handleSuccess(await api('/transcript', { method: 'POST', body: { transcript } }))
    } catch (err) {
      handleFailure(err)
    }
  }

  // Saves a draft the admin reviewed or corrected. The server validates it again.
  async function saveDraft(draft, allowOverload = false) {
    if (loading) return
    setStatus('loading')
    try {
      handleSuccess(await api('/transcript/save', { method: 'POST', body: { draft, allowOverload } }))
    } catch (err) {
      handleFailure(err)
    }
  }

  function saveCorrectedText() {
    let draft
    try {
      draft = JSON.parse(draftText)
    } catch {
      setMessage('The corrected draft is not valid JSON. Check the commas and quotes.')
      return
    }
    saveDraft(draft)
  }

  return (
    <section className="rise overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-amber-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Icon name="spark" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">Create from Transcript</h2>
            <p className="text-sm text-slate-500">Paste the meeting notes. AI creates the projects, tasks, owners and deadlines.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-indigo-400 hover:text-indigo-700 disabled:opacity-50"
        >
          Use supplied transcript
        </button>
      </div>

      <div className="p-5">
        <label htmlFor="transcript" className="sr-only">
          Meeting transcript
        </label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          disabled={loading}
          rows={8}
          placeholder="Paste the meeting transcript or description here..."
          className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 disabled:opacity-60"
        />

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={createFromTranscript}
            disabled={loading || !transcript.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Spinner className="h-4 w-4" /> : <Icon name="spark" size={16} />}
            {loading ? 'Creating projects and tasks...' : 'Create from Transcript'}
          </button>
          {loading && (
            <p className="text-sm text-slate-500">
              Reading the meeting, matching people to the team directory, and checking dates and workload. This takes a few seconds.
            </p>
          )}
          {!loading && transcript.trim() && (
            <p className="text-sm text-slate-400">{transcript.trim().split(/\s+/).length} words ready</p>
          )}
        </div>

        {status === 'success' && (
          <div className="rise mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900" role="status">
            <Icon name="check" className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="rise mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800" role="alert">
            <Icon name="alert" className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {status === 'overload' && overload && <OverloadReview key={JSON.stringify(overload.draft)} data={overload} onSave={saveDraft} />}

        {status === 'invalid' && (
          <div className="rise mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4" role="alert">
            <div className="flex items-start gap-3 text-amber-900">
              <Icon name="alert" className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{message}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-700">
              Correct the draft below, or fix the transcript and create again. Use directory codes such as PM01 or DEV03 for people.
            </p>
            <textarea
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
              rows={12}
              spellCheck={false}
              aria-label="Draft to correct"
              className="mt-2 w-full rounded-lg border border-amber-300 bg-white p-3 font-mono text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button
              type="button"
              onClick={saveCorrectedText}
              className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Check again and save
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
