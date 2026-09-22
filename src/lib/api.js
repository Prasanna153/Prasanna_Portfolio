// Small helpers for talking to the Express server.
const TOKEN_KEY = 'pt_admin_token'

export const getToken = () => sessionStorage.getItem(TOKEN_KEY) || ''
export const setToken = (t) => sessionStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY)

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function api(path, { method = 'GET', body, auth = false, form } = {}) {
  const headers = {}
  if (auth) headers.Authorization = `Bearer ${getToken()}`
  let payload
  if (form) payload = form
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }
  let res
  try {
    res = await fetch(path, { method, headers, body: payload })
  } catch {
    throw new ApiError('Cannot reach the server. Is it running?', 0)
  }
  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const data = isJson ? await res.json() : null
  if (!res.ok) throw new ApiError(data?.error || 'Something went wrong.', res.status)
  return data
}
