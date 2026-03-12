import {
  randomBytes,
  scrypt as scryptCallback,
  scryptSync,
  timingSafeEqual,
  type ScryptOptions,
} from 'node:crypto'

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  keyLength: 64,
  maxmem: 32 * 1024 * 1024,
} as const

function scrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error)
        return
      }

      resolve(derivedKey)
    })
  })
}

function formatPasswordHash(salt: Buffer, derivedKey: Buffer) {
  return [
    'scrypt',
    `N=${SCRYPT_PARAMS.N},r=${SCRYPT_PARAMS.r},p=${SCRYPT_PARAMS.p}`,
    salt.toString('base64url'),
    derivedKey.toString('base64url'),
  ].join('$')
}

function parsePasswordHash(value: string) {
  const [algorithm, paramsPart, saltPart, hashPart] = value.split('$')
  if (algorithm !== 'scrypt' || !paramsPart || !saltPart || !hashPart) {
    throw new Error('密码哈希格式无效')
  }

  const params = Object.fromEntries(
    paramsPart.split(',').map((entry) => {
      const [key, rawValue] = entry.split('=')
      return [key, Number(rawValue)]
    })
  )

  const N = Number(params.N)
  const r = Number(params.r)
  const p = Number(params.p)
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
    throw new Error('密码哈希参数无效')
  }

  return {
    N,
    r,
    p,
    salt: Buffer.from(saltPart, 'base64url'),
    hash: Buffer.from(hashPart, 'base64url'),
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derivedKey = await scrypt(password, salt, SCRYPT_PARAMS.keyLength, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
    maxmem: SCRYPT_PARAMS.maxmem,
  })

  return formatPasswordHash(salt, derivedKey)
}

export async function verifyPassword(password: string, passwordHash: string) {
  const { N, r, p, salt, hash } = parsePasswordHash(passwordHash)
  const derivedKey = await scrypt(password, salt, hash.length, {
    N,
    r,
    p,
    maxmem: SCRYPT_PARAMS.maxmem,
  })

  return derivedKey.length === hash.length && timingSafeEqual(derivedKey, hash)
}

export function createDeterministicPasswordHash(password: string, saltSeed: string) {
  const salt = Buffer.from(saltSeed, 'utf8')
  const derivedKey = scryptSync(password, salt, SCRYPT_PARAMS.keyLength, {
    N: SCRYPT_PARAMS.N,
    r: SCRYPT_PARAMS.r,
    p: SCRYPT_PARAMS.p,
    maxmem: SCRYPT_PARAMS.maxmem,
  })

  return formatPasswordHash(salt, derivedKey)
}
