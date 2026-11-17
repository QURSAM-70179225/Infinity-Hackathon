// "Install app" button. The browser tells us when the app can be installed
// (Chrome and Edge on Android, Windows and macOS). Clicking opens the browser's own
// install dialog, and the app is added to the home screen with its icon.
// The button only appears when installing is really possible, so it never does nothing.
// iPhones have no install dialog, so there we show the two steps instead.
import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

const isIos = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent)

export default function InstallButton({ variant = 'light' }) {
  const [promptEvent, setPromptEvent] = useState(null)
  const [installed, setInstalled] = useState(isStandalone())
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault() // keep the event so our own button can open the dialog
      setPromptEvent(event)
    }
    const onInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null

  const style =
    variant === 'dark'
      ? 'border-slate-700 bg-slate-900 text-white hover:border-amber-300 hover:text-amber-300'
      : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-400 hover:bg-indigo-100'

  async function install() {
    promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
  }

  if (promptEvent) {
    return (
      <button
        type="button"
        onClick={install}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${style}`}
      >
        <Icon name="download" size={15} />
        Install app
      </button>
    )
  }

  if (isIos()) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowIosHelp((value) => !value)}
          aria-expanded={showIosHelp}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ${style}`}
        >
          <Icon name="download" size={15} />
          Install app
        </button>
        {showIosHelp && (
          <p className="rise absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-xl">
            On iPhone: tap the <span className="font-semibold">Share</span> button in Safari, then{' '}
            <span className="font-semibold">Add to Home Screen</span>.
          </p>
        )}
      </div>
    )
  }

  return null
}
