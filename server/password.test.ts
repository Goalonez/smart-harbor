// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { createDeterministicPasswordHash, hashPassword, verifyPassword } from './password.js'

describe('password helpers', () => {
  it('hashes passwords with scrypt and verifies them', async () => {
    const password = 'super-secure-password-123'
    const passwordHash = await hashPassword(password)

    expect(passwordHash).toMatch(/^scrypt\$/)
    expect(passwordHash).not.toBe(password)
    expect(await verifyPassword(password, passwordHash)).toBe(true)
    expect(await verifyPassword('wrong-password-456', passwordHash)).toBe(false)
  })

  it('creates deterministic hashes for constant-time dummy verification', async () => {
    const passwordHash = createDeterministicPasswordHash('dummy-password', 'dummy-salt')

    expect(passwordHash).toBe(createDeterministicPasswordHash('dummy-password', 'dummy-salt'))
    expect(await verifyPassword('dummy-password', passwordHash)).toBe(true)
  })
})
