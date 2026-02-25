export const printPdfBlob = async (blob: Blob): Promise<void> => {
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.src = url

  document.body.appendChild(iframe)

  await new Promise<void>((resolve) => {
    iframe.onload = () => {
      try {
        const win = iframe.contentWindow
        if (!win) throw new Error('No print window')
        const cleanup = () => {
          setTimeout(() => {
            document.body.removeChild(iframe)
            URL.revokeObjectURL(url)
          }, 100)
          win.removeEventListener('afterprint', cleanup)
          resolve()
        }
        win.addEventListener('afterprint', cleanup)
        win.focus()
        // slight delay helps some browsers render before printing
        setTimeout(() => win.print(), 50)
      } catch (e) {
        document.body.removeChild(iframe)
        URL.revokeObjectURL(url)
        resolve()
      }
    }
  })
}

export const downloadPdfBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


export const base64ToPdfBlob = (base64: string): Blob => {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: "application/pdf" })
}


export const openPdf = (blob: Blob): void => {
  const url = URL.createObjectURL(blob)
  window.open(url, "_blank")
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}


