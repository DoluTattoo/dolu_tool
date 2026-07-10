import { Image, Paper, Transition } from '@mantine/core'
import { useAtomValue } from 'jotai'
import { displayImageAtom, imagePathAtom } from '../../atoms/imgPreview'

const ImgPreview: React.FC = () => {
  const isDisplayImage = useAtomValue(displayImageAtom)
  const imagePath = useAtomValue(imagePathAtom)

  return (
    <Transition transition='slide-right' mounted={isDisplayImage}>
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
