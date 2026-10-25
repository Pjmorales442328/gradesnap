// Hash-based routing so the phone back button works: #/quiz/<id>/scan -> ['quiz', '<id>', 'scan'].
import { useEffect, useState } from 'react'

const parse = () => location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)

export function useHashRoute() {
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const on = () => setRoute(parse())
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return route
}

export const go = (...parts: string[]) => { location.hash = '/' + parts.join('/') }
