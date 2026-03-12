import path from 'node:path'
import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import { ZodError, z } from 'zod'
import {
  readAppConfig,
  readServicesConfig,
  readSystemConfig,
  writeAppConfig,
  writeServicesConfig,
  writeSystemConfig,
} from './configStore.js'
import { createAuthService } from './auth.js'
import { createWebdavBackupManager } from './webdavBackupManager.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeSystemConfig(system: Awaited<ReturnType<typeof readSystemConfig>>) {
  const sanitized = { ...system }
  delete sanitized.auth
  return sanitized
}

function sanitizeAppConfig(config: Awaited<ReturnType<typeof readAppConfig>>) {
  return {
    ...config,
    system: sanitizeSystemConfig(config.system),
  }
}

function mergeSystemAuth(
  systemPayload: unknown,
  auth: Awaited<ReturnType<typeof readSystemConfig>>['auth']
) {
  if (!auth || !isRecord(systemPayload)) {
    return systemPayload
  }

  return {
    ...systemPayload,
    auth,
  }
}

function mergeAppAuth(
  appPayload: unknown,
  auth: Awaited<ReturnType<typeof readSystemConfig>>['auth']
) {
  if (!auth || !isRecord(appPayload)) {
    return appPayload
  }

  return {
    ...appPayload,
    system: mergeSystemAuth(appPayload.system, auth),
  }
}

function applySecurityHeaders(reply: { header: (name: string, value: string) => unknown }) {
  reply.header('X-Frame-Options', 'DENY')
  reply.header('X-Content-Type-Options', 'nosniff')
  reply.header('Referrer-Policy', 'same-origin')
}

const isProduction = process.env.NODE_ENV === 'production'
const clientDistDir = path.resolve(process.cwd(), 'dist')
const restoreWebdavBackupBodySchema = z.object({
  versionId: z.string().trim().min(1),
})

export async function buildServer() {
  const app = Fastify({ logger: true, trustProxy: true })
  const authService = createAuthService()
  const webdavBackupManager = createWebdavBackupManager({
    readAppConfig,
    readSystemConfig,
    writeAppConfig,
    logger: app.log,
  })

  await webdavBackupManager.reloadSchedule()

  app.addHook('onSend', async (_request, reply, payload) => {
    applySecurityHeaders(reply)
    return payload
  })

  app.addHook('onClose', async () => {
    webdavBackupManager.stop()
  })

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      reply.code(400)
      return reply.send(error.issues[0]?.message ?? '请求参数无效')
    }

    request.log.error(error)
    reply.code(500)
    return reply.send(request.url.startsWith('/api/') ? '服务器内部错误' : 'Internal Server Error')
  })

  app.get('/api/health', async () => ({ ok: true }))

  app.get('/api/auth/status', (request, reply) => authService.handleAuthStatus(request, reply))
  app.post('/api/auth/setup', (request, reply) => authService.handleSetup(request, reply))
  app.post('/api/auth/login', (request, reply) => authService.handleLogin(request, reply))
  app.post('/api/auth/logout', (request, reply) => authService.handleLogout(request, reply))
  app.put('/api/auth/credentials', (request, reply) =>
    authService.handleUpdateCredentials(request, reply)
  )

  app.get('/api/config/app', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    return sanitizeAppConfig(await readAppConfig())
  })

  app.put('/api/config/app', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    try {
      const currentSystem = await readSystemConfig()
      const nextConfig = mergeAppAuth(request.body, currentSystem.auth)
      const savedConfig = await writeAppConfig(nextConfig)
      await webdavBackupManager.reloadSchedule()
      return sanitizeAppConfig(savedConfig)
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存整站配置失败'
      reply.code(400)
      return message
    }
  })

  app.get('/api/config/services', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    return readServicesConfig()
  })

  app.put('/api/config/services', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    try {
      return await writeServicesConfig(request.body)
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存书签配置失败'
      reply.code(400)
      return message
    }
  })

  app.get('/api/config/system', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    return sanitizeSystemConfig(await readSystemConfig())
  })

  app.put('/api/config/system', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    try {
      const currentSystem = await readSystemConfig()
      const nextSystem = mergeSystemAuth(request.body, currentSystem.auth)
      const savedSystem = await writeSystemConfig(nextSystem)
      await webdavBackupManager.reloadSchedule()
      return sanitizeSystemConfig(savedSystem)
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存系统配置失败'
      reply.code(400)
      return message
    }
  })

  app.get('/api/backups/webdav/versions', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    try {
      return await webdavBackupManager.listVersions()
    } catch (error) {
      const message = error instanceof Error ? error.message : '读取 WebDAV 备份版本失败'
      reply.code(400)
      return message
    }
  })

  app.post('/api/backups/webdav/run', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    try {
      return await webdavBackupManager.runBackup('manual')
    } catch (error) {
      const message = error instanceof Error ? error.message : '执行 WebDAV 备份失败'
      reply.code(400)
      return message
    }
  })

  app.post('/api/backups/webdav/restore', async (request, reply) => {
    if (!(await authService.requireAuthenticated(request, reply))) {
      return reply
    }

    try {
      const { versionId } = restoreWebdavBackupBodySchema.parse(request.body)
      const result = await webdavBackupManager.restoreVersion(versionId)

      if (result.requiresReauth) {
        authService.invalidateAllSessions(reply, request)
      }

      return {
        requiresReauth: result.requiresReauth,
        restoredConfig: sanitizeAppConfig(result.restoredConfig),
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '恢复 WebDAV 备份版本失败'
      reply.code(400)
      return message
    }
  })

  if (isProduction) {
    await app.register(fastifyStatic, {
      root: clientDistDir,
      prefix: '/',
    })

    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api/')) {
        return reply.code(404).send({ message: 'Not Found' })
      }

      return reply.sendFile('index.html')
    })
  }

  return app
}
