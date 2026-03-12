import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { z } from 'zod'
import {
  appConfigSchema,
  servicesConfigSchema,
  systemConfigSchema,
  type AppConfig,
} from '../src/config/schema.js'

const configDir = path.resolve(process.env.CONFIG_DIR ?? path.join(process.cwd(), 'config'))
const configFilename = 'config.json'
const legacyServicesFilename = 'services.json'
const legacySystemFilename = 'system.json'

let ensureConfigPromise: Promise<string> | null = null
let writeQueue: Promise<void> = Promise.resolve()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function exists(filePath: string) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function ensureDirectory() {
  await mkdir(configDir, { recursive: true })
}

async function readJsonFile<TSchema extends z.ZodTypeAny>(
  filePath: string,
  filename: string,
  schema: TSchema
): Promise<z.output<TSchema>> {
  const text = await readFile(filePath, 'utf8')
  const trimmed = text.trim()

  if (!trimmed) {
    return schema.parse(undefined)
  }

  let json: unknown
  try {
    json = JSON.parse(trimmed)
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    throw new Error(`${filename} JSON 格式错误：${message}`)
  }

  return schema.parse(json ?? undefined)
}

async function readOptionalJsonFile<TSchema extends z.ZodTypeAny>(
  filename: string,
  schema: TSchema
): Promise<z.output<TSchema> | null> {
  const filePath = path.join(configDir, filename)
  if (!(await exists(filePath))) {
    return null
  }

  return readJsonFile(filePath, filename, schema)
}

async function writeJsonFile(filePath: string, value: unknown) {
  const tempPath = `${filePath}.${randomUUID()}.tmp`

  try {
    await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
    await rename(tempPath, filePath)
  } finally {
    if (await exists(tempPath)) {
      await unlink(tempPath)
    }
  }
}

async function hasLegacyConfigFiles() {
  return (
    (await exists(path.join(configDir, legacyServicesFilename))) ||
    (await exists(path.join(configDir, legacySystemFilename)))
  )
}

async function readLegacyAppConfig() {
  const defaultConfig = appConfigSchema.parse({})
  const services =
    (await readOptionalJsonFile(legacyServicesFilename, servicesConfigSchema)) ??
    defaultConfig.services
  const system =
    (await readOptionalJsonFile(legacySystemFilename, systemConfigSchema)) ?? defaultConfig.system

  return appConfigSchema.parse({ system, services })
}

async function ensureAppConfigFile() {
  if (ensureConfigPromise) {
    return ensureConfigPromise
  }

  ensureConfigPromise = (async () => {
    await ensureDirectory()

    const targetPath = path.join(configDir, configFilename)
    if (await exists(targetPath)) {
      return targetPath
    }

    if (await hasLegacyConfigFiles()) {
      const migratedConfig = await readLegacyAppConfig()
      await writeJsonFile(targetPath, migratedConfig)
      return targetPath
    }

    await writeJsonFile(targetPath, appConfigSchema.parse({}))
    return targetPath
  })()

  try {
    return await ensureConfigPromise
  } finally {
    ensureConfigPromise = null
  }
}

async function withWriteLock<T>(operation: () => Promise<T>) {
  const nextOperation = writeQueue.then(operation, operation)
  writeQueue = nextOperation.then(
    () => undefined,
    () => undefined
  )
  return nextOperation
}

export async function readAppConfig() {
  const filePath = await ensureAppConfigFile()
  return readJsonFile(filePath, configFilename, appConfigSchema)
}

export async function writeAppConfig(value: unknown) {
  if (!isRecord(value)) {
    throw new Error('整站配置格式错误')
  }

  const parsed = appConfigSchema.parse(value)

  return withWriteLock(async () => {
    const filePath = await ensureAppConfigFile()
    await writeJsonFile(filePath, parsed)
    return parsed
  })
}

export async function readServicesConfig() {
  const config = await readAppConfig()
  return config.services
}

export async function writeServicesConfig(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error('书签配置格式错误')
  }

  const services = servicesConfigSchema.parse(value)

  return withWriteLock(async () => {
    const currentConfig = await readAppConfig()
    const nextConfig: AppConfig = {
      ...currentConfig,
      services,
    }

    const filePath = await ensureAppConfigFile()
    await writeJsonFile(filePath, nextConfig)
    return nextConfig.services
  })
}

export async function readSystemConfig() {
  const config = await readAppConfig()
  return config.system
}

export async function writeSystemConfig(value: unknown) {
  if (!isRecord(value)) {
    throw new Error('系统配置格式错误')
  }

  const system = systemConfigSchema.parse(value)

  return withWriteLock(async () => {
    const currentConfig = await readAppConfig()
    const nextConfig: AppConfig = {
      ...currentConfig,
      system,
    }

    const filePath = await ensureAppConfigFile()
    await writeJsonFile(filePath, nextConfig)
    return nextConfig.system
  })
}

export function getConfigDir() {
  return configDir
}
