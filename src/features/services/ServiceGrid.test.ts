import { describe, expect, it } from 'vitest'
import {
  getCompactGroupWidth,
  getDesktopCardWidth,
  getDesktopColumnCount,
} from './serviceGridLayout'

describe('ServiceGrid desktop layout helpers', () => {
  it('selects 6, 8, or 9 columns from the actual container width', () => {
    expect(getDesktopColumnCount(949)).toBe(0)
    expect(getDesktopColumnCount(950)).toBe(6)
    expect(getDesktopColumnCount(1225)).toBe(6)
    expect(getDesktopColumnCount(1226)).toBe(8)
    expect(getDesktopColumnCount(1363)).toBe(8)
    expect(getDesktopColumnCount(1364)).toBe(9)
  })

  it('caps wide layouts at 9 columns', () => {
    expect(getDesktopColumnCount(1472)).toBe(9)
    expect(getDesktopColumnCount(2400)).toBe(9)
  })

  it('uses the same card width when deciding whether a group stays on one row', () => {
    const containerWidth = 1472
    const columnCount = getDesktopColumnCount(containerWidth)
    const cardWidth = getDesktopCardWidth(containerWidth, columnCount)

    expect(columnCount).toBe(9)
    expect(cardWidth).toBe(140)
    expect(getCompactGroupWidth(9, cardWidth)).toBe(containerWidth)
    expect(getCompactGroupWidth(10, cardWidth)).toBeGreaterThan(containerWidth)
  })
})
