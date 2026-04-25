import { createImageUrlBuilder } from '@sanity/image-url'
import { client } from './client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImageSource = any

const imageBuilder = createImageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return imageBuilder.image(source)
}
