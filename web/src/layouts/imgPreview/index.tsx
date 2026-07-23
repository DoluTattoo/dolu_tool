import { Image, Paper, Transition } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useAtomValue } from 'jotai'
import { displayImageAtom, imagePathAtom } from '../../atoms/imgPreview'

const ImgPreview: React.FC = () => {
  const isDisplayImage = useAtomValue(displayImageAtom)
  const imagePath = useAtomValue(imagePathAtom)

  // Delay the unmount slightly: moving the mouse from one grid card to the
  // next fires hide/show back-to-back, and remounting the Transition would
  // replay the slide animation on every hop. Keeping the panel mounted through
  // these quick toggles means only the image swaps; the slide animation only
  // plays on a real open or close.
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isDisplayImage) {
      setMounted(true)
      return
    }
    const timer = setTimeout(() => setMounted(false), 150)
    return () => clearTimeout(timer)
  }, [isDisplayImage])

  return (
    <Transition transition='slide-right' mounted={mounted}>
      {(style) => (
        <Paper
          p='xs'
          shadow='xs'
          style={{
            ...style,
            zIndex: 2,
            position: 'absolute',
            top: '15px',
            left: '630px',
            maxWidth: '600px',
            borderRadius: '10px',
          }}
        >
          <Image
            fit='contain'
            alt={'Display selected image'}
            src={imagePath}
          />
        </Paper>
      )}
    </Transition>
  )
}

export default ImgPreview
