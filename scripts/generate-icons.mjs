// Generates icon-192.png and icon-512.png from embedded SVG using canvas
import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const r = size * 0.22 // corner radius

  // Background rounded rect
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fillStyle = '#4f46e5'
  ctx.fill()

  // Checkmark circle
  const cx = size / 2
  const cy = size / 2
  const circleR = size * 0.28

  ctx.beginPath()
  ctx.arc(cx, cy, circleR, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = size * 0.05
  ctx.stroke()

  // Checkmark
  ctx.beginPath()
  ctx.moveTo(cx - circleR * 0.45, cy)
  ctx.lineTo(cx - circleR * 0.05, cy + circleR * 0.4)
  ctx.lineTo(cx + circleR * 0.55, cy - circleR * 0.35)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = size * 0.065
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()

  return canvas.toBuffer('image/png')
}

const publicDir = join(__dirname, '..', 'public')
writeFileSync(join(publicDir, 'icon-192.png'), drawIcon(192))
writeFileSync(join(publicDir, 'icon-512.png'), drawIcon(512))
console.log('Icons generated: icon-192.png, icon-512.png')
