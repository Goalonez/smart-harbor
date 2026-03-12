import { useEffect, useState, type ComponentType } from 'react'
import { Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/runtime'

interface ServiceSettingsButtonProps {
  initialOpen?: boolean
}

let serviceSettingsModulePromise: Promise<ComponentType<ServiceSettingsButtonProps>> | null = null

function loadServiceSettingsButton() {
  if (!serviceSettingsModulePromise) {
    serviceSettingsModulePromise = import('./ServiceSettingsButton').then(
      (module) => module.ServiceSettingsButton
    )
  }

  return serviceSettingsModulePromise
}

export function LazyServiceSettingsButton() {
  const { messages } = useI18n()
  const [LoadedComponent, setLoadedComponent] = useState<ComponentType<ServiceSettingsButtonProps> | null>(
    null
  )
  const [openOnLoad, setOpenOnLoad] = useState(false)

  useEffect(() => {
    if (!openOnLoad || LoadedComponent) {
      return
    }

    let cancelled = false

    void loadServiceSettingsButton().then((component) => {
      if (!cancelled) {
        setLoadedComponent(() => component)
      }
    })

    return () => {
      cancelled = true
    }
  }, [LoadedComponent, openOnLoad])

  if (LoadedComponent) {
    return <LoadedComponent initialOpen={openOnLoad} />
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={messages.settings.buttonAria}
      className="h-9 w-9 rounded-full"
      onClick={() => setOpenOnLoad(true)}
      onMouseEnter={() => {
        void loadServiceSettingsButton()
      }}
      onFocus={() => {
        void loadServiceSettingsButton()
      }}
    >
      <Settings2 className="h-4.5 w-4.5" />
    </Button>
  )
}
