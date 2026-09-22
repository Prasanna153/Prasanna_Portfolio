import { useEffect, useState } from 'react'

// Types a word, pauses, deletes it, then moves to the next one.
export default function useTypingEffect(words, { typeSpeed = 85, deleteSpeed = 45, pause = 1500, disabled = false } = {}) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(disabled ? words[0] : '')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (disabled) return undefined
    const word = words[index % words.length]
    let delay = deleting ? deleteSpeed : typeSpeed
    if (!deleting && text === word) delay = pause
    const t = setTimeout(() => {
      if (!deleting && text === word) return setDeleting(true)
      if (deleting && text === '') {
        setDeleting(false)
        return setIndex((i) => (i + 1) % words.length)
      }
      setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1))
    }, delay)
    return () => clearTimeout(t)
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause, disabled])

  return text
}
