import { z } from 'zod'
import {
  SEARCH_KEYWORD_PLACEHOLDER,
  builtinSearchEngineIds,
  isValidSearchEngineTemplate,
} from './searchEngines.js'

const trimmedString = z.string().trim().min(1)
const optionalUrl = z.string().trim().url().optional()
const positiveInteger = z.number().int().min(1)

export const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug 必须使用小写字母、数字和连字符')

export const openTargetSchema = z.enum(['self', 'blank'])

export const authUsernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[A-Za-z0-9._@-]+$/, '用户名只能包含字母、数字、点、下划线、@ 和短横线')

export const authPasswordHashSchema = z.string().trim().min(1)

export const authConfigSchema = z.object({
  username: authUsernameSchema,
  passwordHash: authPasswordHashSchema,
})

const canonicalServiceConfigSchema = z.object({
  slug: slugSchema,
  name: trimmedString,
  icon: z.string().trim().min(1).optional(),
  primaryUrl: z.string().trim().url(),
  secondaryUrl: optionalUrl,
  probes: z.array(z.string().trim().url()).min(1).optional(),
  forceNewTab: z.boolean().optional(),
})

const legacyServiceConfigSchema = z.object({
  slug: slugSchema,
  name: trimmedString,
  icon: z.string().trim().min(1).optional(),
  lanUrl: z.string().trim().url(),
  wanUrl: optionalUrl,
  probes: z.array(z.string().trim().url()).min(1).optional(),
  forceNewTab: z.boolean().optional(),
})

export const serviceConfigSchema = z
  .union([canonicalServiceConfigSchema, legacyServiceConfigSchema])
  .transform((service) => {
    if ('primaryUrl' in service) {
      return service
    }

    return {
      slug: service.slug,
      name: service.name,
      icon: service.icon,
      primaryUrl: service.lanUrl,
      secondaryUrl: service.wanUrl,
      probes: service.probes,
      forceNewTab: service.forceNewTab,
    }
  })
  .pipe(canonicalServiceConfigSchema)

export const serviceGroupConfigSchema = z.object({
  category: trimmedString,
  items: z.array(serviceConfigSchema),
})

export const servicesConfigSchema = z.array(serviceGroupConfigSchema).default([])

export const serviceSchema = canonicalServiceConfigSchema.extend({
  category: trimmedString,
})

export const servicesSchema = z.array(serviceSchema)

const searchEngineTemplateSchema = z
  .string()
  .trim()
  .min(1)
  .refine(isValidSearchEngineTemplate, {
    message: `请输入可用的搜索链接，并包含 ${SEARCH_KEYWORD_PLACEHOLDER}`,
  })

const customSearchEngineSchema = z.object({
  id: slugSchema,
  name: trimmedString,
  urlTemplate: searchEngineTemplateSchema,
})

export const webdavBackupConfigSchema = z
  .object({
    url: z.string().trim().default(''),
    username: z.string().trim().default(''),
    password: z.string().default(''),
    remotePath: z.string().trim().default('/smart-harbor'),
    autoBackup: z.boolean().default(false),
    intervalDays: positiveInteger.max(365).default(7),
    maxVersions: positiveInteger.max(365).default(10),
  })
  .superRefine((config, ctx) => {
    const hasAnyCredential =
      config.url.length > 0 || config.username.length > 0 || config.password.length > 0

    if (config.url.length > 0) {
      try {
        new URL(config.url)
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['url'],
          message: '请输入合法的 WebDAV 地址',
        })
      }
    }

    if (!hasAnyCredential && !config.autoBackup) {
      return
    }

    if (!config.url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['url'],
        message: '请输入 WebDAV 地址',
      })
    }

    if (!config.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['username'],
        message: '请输入 WebDAV 用户名',
      })
    }

    if (!config.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['password'],
        message: '请输入 WebDAV 密码',
      })
    }
  })

export const systemConfigSchema = z
  .object({
    appName: trimmedString.default('Smart Harbor'),
    darkMode: z.boolean().default(false),
    clickOpenTarget: openTargetSchema.default('self'),
    middleClickOpenTarget: openTargetSchema.default('blank'),
    defaultSearchEngine: slugSchema.default('google'),
    customSearchEngines: z.array(customSearchEngineSchema).default([]),
    webdavBackup: webdavBackupConfigSchema.default({}),
    auth: authConfigSchema.optional(),
  })
  .superRefine((config, ctx) => {
    const customEngineIds = new Set<string>()

    config.customSearchEngines.forEach((engine, index) => {
      if (builtinSearchEngineIds.includes(engine.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customSearchEngines', index, 'id'],
          message: `自定义搜索引擎标识不能与内置引擎重复：${engine.id}`,
        })
        return
      }

      if (customEngineIds.has(engine.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['customSearchEngines', index, 'id'],
          message: `自定义搜索引擎标识重复：${engine.id}`,
        })
        return
      }

      customEngineIds.add(engine.id)
    })

    const availableEngineIds = new Set([...builtinSearchEngineIds, ...customEngineIds])

    if (!availableEngineIds.has(config.defaultSearchEngine)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['defaultSearchEngine'],
        message: `默认搜索引擎不存在：${config.defaultSearchEngine}`,
      })
    }
  })
  .default({})

export const appConfigSchema = z
  .object({
    system: systemConfigSchema,
    services: servicesConfigSchema,
  })
  .default({})

export type OpenTarget = z.infer<typeof openTargetSchema>
export type ServiceConfig = z.infer<typeof serviceConfigSchema>
export type ServiceGroupConfig = z.infer<typeof serviceGroupConfigSchema>
export type ServicesConfig = z.infer<typeof servicesConfigSchema>
export type Service = z.infer<typeof serviceSchema>
export type Services = z.infer<typeof servicesSchema>
export type AuthConfig = z.infer<typeof authConfigSchema>
export type WebdavBackupConfig = z.infer<typeof webdavBackupConfigSchema>
export type SystemConfig = z.infer<typeof systemConfigSchema>
export type AppConfig = z.infer<typeof appConfigSchema>
