// src/services/colorExtractor.test.ts
import { hexToRgb, rgbToHex, kMeans, assignRoles } from './colorExtractor'

it('hexToRgb converts #ff0000 to [255,0,0]', () => {
  expect(hexToRgb('#ff0000')).toEqual([255, 0, 0])
})

it('rgbToHex converts [0,128,255] to #0080ff', () => {
  expect(rgbToHex([0, 128, 255])).toBe('#0080ff')
})

it('kMeans returns exactly k clusters from pixel data', () => {
  // Build 100 red pixels and 100 blue pixels
  const pixels: [number, number, number][] = [
    ...Array(100).fill([255, 0, 0]),
    ...Array(100).fill([0, 0, 255]),
  ]
  const result = kMeans(pixels, 2, 10)
  expect(result).toHaveLength(2)
})

it('assignRoles returns colors with unique roles', () => {
  const colors = ['#ffffff', '#000000', '#ff5500', '#0055ff', '#888888']
  const result = assignRoles(colors)
  const roles = result.map(c => c.role)
  expect(new Set(roles).size).toBe(roles.length)
})
