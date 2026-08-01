const DESKTOP_SECTION_HORIZONTAL_PADDING_PX = 24
const DESKTOP_LABEL_WIDTH_PX = 84
const DESKTOP_SECTION_GAP_PX = 12
const DESKTOP_GRID_HORIZONTAL_PADDING_PX = 12
const DESKTOP_CARD_GAP_PX = 10
export const DESKTOP_CARD_MIN_WIDTH_PX = 130
const DESKTOP_CARD_FIT_MIN_WIDTH_PX = 128
const DESKTOP_COLUMN_COUNTS = [9, 8, 6] as const

export function getDesktopCardWidth(containerWidth: number, desktopColumnCount: number) {
  const availableWidth =
    containerWidth -
    DESKTOP_SECTION_HORIZONTAL_PADDING_PX -
    DESKTOP_LABEL_WIDTH_PX -
    DESKTOP_SECTION_GAP_PX -
    DESKTOP_GRID_HORIZONTAL_PADDING_PX -
    Math.max(desktopColumnCount - 1, 0) * DESKTOP_CARD_GAP_PX

  return Math.max(Math.floor(availableWidth / desktopColumnCount), DESKTOP_CARD_MIN_WIDTH_PX)
}

export function getCompactGroupWidth(cardCount: number, desktopCardWidth: number) {
  return (
    DESKTOP_SECTION_HORIZONTAL_PADDING_PX +
    DESKTOP_LABEL_WIDTH_PX +
    DESKTOP_SECTION_GAP_PX +
    DESKTOP_GRID_HORIZONTAL_PADDING_PX +
    cardCount * desktopCardWidth +
    Math.max(cardCount - 1, 0) * DESKTOP_CARD_GAP_PX
  )
}

export function getDesktopColumnCount(containerWidth: number) {
  return (
    DESKTOP_COLUMN_COUNTS.find((columnCount) => {
      const availableWidth =
        containerWidth -
        DESKTOP_SECTION_HORIZONTAL_PADDING_PX -
        DESKTOP_LABEL_WIDTH_PX -
        DESKTOP_SECTION_GAP_PX -
        DESKTOP_GRID_HORIZONTAL_PADDING_PX -
        Math.max(columnCount - 1, 0) * DESKTOP_CARD_GAP_PX

      return Math.floor(availableWidth / columnCount) >= DESKTOP_CARD_FIT_MIN_WIDTH_PX
    }) ?? 0
  )
}
