import { useRef, useState, useEffect } from 'react'
import './App.css'

// Helper function to wrap text (break long words if needed)
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];
  for (let n = 0; n < words.length; n++) {
    let word = words[n];
    // If the word itself is too long, break it
    while (ctx.measureText(word).width > maxWidth) {
      let fit = '';
      for (let i = 0; i < word.length; i++) {
        if (ctx.measureText(fit + word[i]).width > maxWidth) {
          break;
        }
        fit += word[i];
      }
      if (fit.length === 0) break; // avoid infinite loop
      if (line.length > 0) lines.push(line);
      lines.push(fit);
      word = word.slice(fit.length);
      line = '';
    }
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  // Draw each line
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, y - (lines.length - 1 - i) * lineHeight);
  }
}

function App() {
  const [image, setImage] = useState(null)
  const [text, setText] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef()
  const canvasRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setImage(file)
      setPreviewUrl(url)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setImage(file)
      setPreviewUrl(url)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleTextChange = (e) => {
    setText(e.target.value)
  }

  const drawImage = (img, text) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const size = 800
    canvas.width = size
    canvas.height = size

    // Draw background image, cover style
    const iw = img.width
    const ih = img.height
    const scale = Math.max(size / iw, size / ih)
    const nw = iw * scale
    const nh = ih * scale
    const nx = (size - nw) / 2
    const ny = (size - nh) / 2
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(img, nx, ny, nw, nh)

    // Draw bigger rainbow gradient rectangle (top left) with 'WKE'
    ctx.save()
    const rectX = 32, rectY = 32, rectW = 180, rectH = 70, radius = 22
    const grad = ctx.createLinearGradient(rectX, rectY, rectX + rectW, rectY + rectH)
    grad.addColorStop(0, '#ff3b3b')
    grad.addColorStop(0.17, '#ffb13b')
    grad.addColorStop(0.34, '#ffe53b')
    grad.addColorStop(0.51, '#3bff57')
    grad.addColorStop(0.68, '#3be0ff')
    grad.addColorStop(0.85, '#7b3bff')
    grad.addColorStop(1, '#ff3bbf')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.moveTo(rectX + radius, rectY)
    ctx.lineTo(rectX + rectW - radius, rectY)
    ctx.arcTo(rectX + rectW, rectY, rectX + rectW, rectY + radius, radius)
    ctx.lineTo(rectX + rectW, rectY + rectH - radius)
    ctx.arcTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH, radius)
    ctx.lineTo(rectX + radius, rectY + rectH)
    ctx.arcTo(rectX, rectY + rectH, rectX, rectY + rectH - radius, radius)
    ctx.lineTo(rectX, rectY + radius)
    ctx.arcTo(rectX, rectY, rectX + radius, rectY, radius)
    ctx.closePath()
    ctx.fill()
    // Center 'WKE' in the rectangle
    ctx.font = '900 44px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 6
    ctx.strokeText('WKE', rectX + rectW / 2, rectY + rectH / 2)
    ctx.fillStyle = '#fff'
    ctx.fillText('WKE', rectX + rectW / 2, rectY + rectH / 2)
    ctx.restore()

    // Draw bigger, left-aligned, wrapped text at bottom with more drop shadow
    if (text) {
      ctx.save()
      ctx.font = '600 64px Inter, system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 32
      ctx.shadowOffsetY = 8
      ctx.fillStyle = '#fff'
      const maxWidth = size - 96;
      const lineHeight = 72;
      
      // Draw text outline
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 6
      const drawText = (ctx, x, y, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let line = '';
        let lines = [];
        for (let n = 0; n < words.length; n++) {
          let word = words[n];
          while (ctx.measureText(word).width > maxWidth) {
            let fit = '';
            for (let i = 0; i < word.length; i++) {
              if (ctx.measureText(fit + word[i]).width > maxWidth) {
                break;
              }
              fit += word[i];
            }
            if (fit.length === 0) break;
            if (line.length > 0) lines.push(line);
            lines.push(fit);
            word = word.slice(fit.length);
            line = '';
          }
          const testLine = line + word + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = word + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        for (let i = 0; i < lines.length; i++) {
          ctx.strokeText(lines[i], x, y - (lines.length - 1 - i) * lineHeight);
          ctx.fillText(lines[i], x, y - (lines.length - 1 - i) * lineHeight);
        }
      }
      
      drawText(ctx, 48, size - 48, maxWidth, lineHeight);
      ctx.restore()
    }
  }

  const handleDownload = async () => {
    if (!previewUrl || !text) return
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      drawImage(img, text)
      const url = canvasRef.current.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'gmr_image.png'
      a.click()
    }
    img.src = previewUrl
  }

  return (
    <div className="gmr-container">
      <h1 className="rainbow-text">DEWOKE</h1>
      <div className="sections-wrapper">
        <div className="input-section">
          <div
            className={`drop-area${previewUrl ? ' has-image' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="preview-img" />
            ) : (
              <span>Soltá una imagen aquí o hacé click para elegir</span>
            )}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
          <input
            className="text-input"
            type="text"
            placeholder="Escribí tu texto..."
            value={text}
            onChange={handleTextChange}
            maxLength={80}
          />
          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={!previewUrl || !text}
          >
            Descargar imagen
          </button>
        </div>
        <div className="preview-section">
          <div className="preview-label">Vista previa</div>
          <div className="preview-box">
            <div className="preview-canvas-wrapper">
              {previewUrl && text && (
                <PreviewCanvas imgUrl={previewUrl} text={text} />
              )}
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} width={800} height={800} style={{ display: 'none' }} />
    </div>
  )
}

function PreviewCanvas({ imgUrl, text }) {
  const ref = useRef()
  // Draw preview on mount/update
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const size = 400
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Draw background image, cover style
      const iw = img.width
      const ih = img.height
      const scale = Math.max(size / iw, size / ih)
      const nw = iw * scale
      const nh = ih * scale
      const nx = (size - nw) / 2
      const ny = (size - nh) / 2
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(img, nx, ny, nw, nh)
      // Draw bigger rainbow gradient rectangle (top left) with 'WKE'
      ctx.save()
      const rectX = 16, rectY = 16, rectW = 90, rectH = 35, radius = 11
      const grad = ctx.createLinearGradient(rectX, rectY, rectX + rectW, rectY + rectH)
      grad.addColorStop(0, '#ff3b3b')
      grad.addColorStop(0.17, '#ffb13b')
      grad.addColorStop(0.34, '#ffe53b')
      grad.addColorStop(0.51, '#3bff57')
      grad.addColorStop(0.68, '#3be0ff')
      grad.addColorStop(0.85, '#7b3bff')
      grad.addColorStop(1, '#ff3bbf')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(rectX + radius, rectY)
      ctx.lineTo(rectX + rectW - radius, rectY)
      ctx.arcTo(rectX + rectW, rectY, rectX + rectW, rectY + radius, radius)
      ctx.lineTo(rectX + rectW, rectY + rectH - radius)
      ctx.arcTo(rectX + rectW, rectY + rectH, rectX + rectW - radius, rectY + rectH, radius)
      ctx.lineTo(rectX + radius, rectY + rectH)
      ctx.arcTo(rectX, rectY + rectH, rectX, rectY + rectH - radius, radius)
      ctx.lineTo(rectX, rectY + radius)
      ctx.arcTo(rectX, rectY, rectX + radius, rectY, radius)
      ctx.closePath()
      ctx.fill()
      // Center 'WKE' in the rectangle
      ctx.font = '900 22px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 3
      ctx.strokeText('WKE', rectX + rectW / 2, rectY + rectH / 2)
      ctx.fillStyle = '#fff'
      ctx.fillText('WKE', rectX + rectW / 2, rectY + rectH / 2)
      ctx.restore()
      // Draw bigger, left-aligned, wrapped text at bottom with more drop shadow
      if (text) {
        ctx.save()
        ctx.font = '600 32px Inter, system-ui, sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.shadowBlur = 16
        ctx.shadowOffsetY = 4
        ctx.fillStyle = '#fff'
        const maxWidth = size - 48;
        const lineHeight = 36;
        
        // Draw text outline
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 3
        const drawText = (ctx, x, y, maxWidth, lineHeight) => {
          const words = text.split(' ');
          let line = '';
          let lines = [];
          for (let n = 0; n < words.length; n++) {
            let word = words[n];
            while (ctx.measureText(word).width > maxWidth) {
              let fit = '';
              for (let i = 0; i < word.length; i++) {
                if (ctx.measureText(fit + word[i]).width > maxWidth) {
                  break;
                }
                fit += word[i];
              }
              if (fit.length === 0) break;
              if (line.length > 0) lines.push(line);
              lines.push(fit);
              word = word.slice(fit.length);
              line = '';
            }
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
              lines.push(line);
              line = word + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);
          for (let i = 0; i < lines.length; i++) {
            ctx.strokeText(lines[i], x, y - (lines.length - 1 - i) * lineHeight);
            ctx.fillText(lines[i], x, y - (lines.length - 1 - i) * lineHeight);
          }
        }
        
        drawText(ctx, 24, size - 24, maxWidth, lineHeight);
        ctx.restore()
      }
    }
    img.src = imgUrl
  }, [imgUrl, text])
  return <canvas ref={ref} width={400} height={400} className="preview-canvas" />
}

export default App
