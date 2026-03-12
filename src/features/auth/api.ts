export interface AuthStatus {
  setupRequired: boolean
  authenticated: boolean
  username?: string
}

interface JsonRequestOptions extends RequestInit {
  fallbackMessage: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface UpdateCredentialsPayload {
  currentPassword: string
  nextUsername: string
  nextPassword: string
}

async function requestJson<T>(url: string, options: JsonRequestOptions): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    credentials: 'same-origin',
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || options.fallbackMessage)
  }

  return response.json() as Promise<T>
}

export const authStatusQueryKey = ['auth', 'status'] as const

export function fetchAuthStatus() {
  return requestJson<AuthStatus>('/api/auth/status', {
    method: 'GET',
    fallbackMessage: '鉴权状态获取失败',
  })
}

export function login(payload: LoginPayload) {
  return requestJson<AuthStatus>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    fallbackMessage: '登录失败',
  })
}

export function setup(payload: LoginPayload) {
  return requestJson<AuthStatus>('/api/auth/setup', {
    method: 'POST',
    body: JSON.stringify(payload),
    fallbackMessage: '创建管理员账号失败',
  })
}

export function logout() {
  return requestJson<{ ok: true }>('/api/auth/logout', {
    method: 'POST',
    body: JSON.stringify({}),
    fallbackMessage: '退出登录失败',
  })
}

export function updateCredentials(payload: UpdateCredentialsPayload) {
  return requestJson<AuthStatus>('/api/auth/credentials', {
    method: 'PUT',
    body: JSON.stringify(payload),
    fallbackMessage: '更新账号密码失败',
  })
}
