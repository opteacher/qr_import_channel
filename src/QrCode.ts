import { Ref } from 'vue'
import { parseQrcode } from './workers/qrcode.worker'

export default async function useQrCode(
  options: MediaTrackConstraints,
  videoRef: Ref<HTMLVideoElement | null>,
  onResult: (data: string) => void
) {
  const constraints = {
    audio: false,
    video: {
      ...options
    }
  }

  const video = videoRef.value
  if (!video) {
    throw new Error('没有找到video组件！')
  }
  video.playsInline = true
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  video.srcObject = await navigator.mediaDevices.getUserMedia(constraints)
  const dimensions = stream ? stream.getVideoTracks()[0].getSettings() : null

  const height = dimensions?.height || 300
  const width = dimensions?.width || 300
  let assignedCanvas: HTMLCanvasElement | OffscreenCanvas | null = null
  const notify = () => {
    if (assignedCanvas && video) {
      let context = assignedCanvas.getContext('2d', {
        alpha: false // should never have alpha from camera, boosts performance a bit
      })

      if (context) {
        context.drawImage(video, 0, 0)

        let imageData: ImageData | null = context.getImageData(0, 0, width, height)

        if (imageData && imageData.data) {
          const started = Date.now()
          const res = parseQrcode(imageData)

          imageData = null
          context = null
          if (res) {
            const duration = Date.now() - started
            if (duration > 200) {
              console.warn(`Decode took ${duration} ms`)
            }
            onResult(res)
          }
        }
      }
    }
  }
  setInterval(notify, 50)
  // requestAnimationFrame(notify)

  if (video && width && height) {
    let cv: HTMLCanvasElement | OffscreenCanvas = document.createElement('canvas')

    if ('OffscreenCanvas' in window && 'transferControlToOffscreen' in cv) {
      assignedCanvas = cv.transferControlToOffscreen()
    } else {
      assignedCanvas = cv
    }

    assignedCanvas.height = height
    assignedCanvas.width = width

    //console.log(video, height, width, assignedCanvas)

    //video.addEventListener('timeupdate', notify)
    // requestAnimationFrame(notify)
    
    setInterval(notify, 50)
  } else if (Number.isNaN(width) || Number.isNaN(height)) {
    throw new TypeError('height and width must be numbers')
  }

  return () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.stop())
    }
  }
}
