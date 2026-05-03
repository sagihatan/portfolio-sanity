import { defineType, defineField, defineArrayMember } from 'sanity'
import { ImageIcon } from '@sanity/icons'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'name',
      title: 'Project name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtext',
      title: 'Subtext',
      description: 'One short line shown below the project name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'iconLabel',
      title: 'Icon label',
      description: 'Fallback single letter shown when no project icon is uploaded',
      type: 'string',
      validation: (rule) => rule.required().max(1),
    }),
    defineField({
      name: 'iconAsset',
      title: 'Project icon',
      description: 'Optional image shown in the project-icon badge. Upload a square image when possible. The site renders it at 48 × 48 px and requests a high-resolution version for retina screens.',
      type: 'image',
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent color',
      type: 'string',
      options: {
        list: [
          { title: 'Teal', value: 'teal' },
          { title: 'Violet', value: 'violet' },
          { title: 'Plum', value: 'plum' },
          { title: 'Amber', value: 'amber' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      description: 'Two tags is the safest default',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.required().min(1).max(4),
    }),
    defineField({
      name: 'tileSize',
      title: 'Tile size',
      description: 'Controls the bento grid width of this tile. Recommended image resolution per size is shown below.',
      type: 'string',
      options: {
        list: [
          { title: 'Wide (4 cols) — 2400 × 1100 px', value: 't-wide' },
          { title: 'Square (2 cols) — 1600 × 1500 px', value: 't-sq' },
          { title: 'Mid (3 cols) — 1800 × 1100 px', value: 't-mid' },
          { title: 'Large (4 cols) — 2400 × 1500 px', value: 't-lg' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'artVariant',
      title: 'Art variant',
      description: 'CSS art class shown as fallback when no image is uploaded',
      type: 'string',
      options: {
        list: [
          { title: 'art-1 (Music player)', value: 'art-1' },
          { title: 'art-2 (Logo / brand)', value: 'art-2' },
          { title: 'art-3 (Finance dashboard)', value: 'art-3' },
          { title: 'art-4 (CRM / flow)', value: 'art-4' },
          { title: 'art-5 (Orb / motion)', value: 'art-5' },
          { title: 'art-6 (Wallet card)', value: 'art-6' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Project image',
      description: 'Optional. Replaces the CSS art background. Format: webp (80–90 q), jpg for photos, png for UI/text. Default display is cover + center, so edges can crop when the card shape changes.',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageFit',
      title: 'Image fit',
      description: 'Cover fills the tile and may crop. Contain shows the full image and may leave empty space.',
      type: 'string',
      initialValue: 'cover',
      options: {
        list: [
          { title: 'Cover - fill tile, may crop', value: 'cover' },
          { title: 'Contain - show full image', value: 'contain' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'imagePosition',
      title: 'Image position',
      description: 'Controls which part stays visible when using cover, and where the image sits when using contain.',
      type: 'string',
      initialValue: 'center',
      options: {
        list: [
          { title: 'Center', value: 'center' },
          { title: 'Top', value: 'top' },
          { title: 'Top left', value: 'top left' },
          { title: 'Left', value: 'left' },
          { title: 'Top right', value: 'top right' },
        ],
      },
    }),
    defineField({
      name: 'imageBackgroundColor',
      title: 'Image background color',
      description: 'Optional color shown behind contained images. Example: #f7f7f8',
      type: 'string',
    }),
    defineField({
      name: 'imagePadding',
      title: 'Image padding',
      description: 'Optional padding in pixels around the image. Most cover images should stay at 0.',
      type: 'number',
      validation: (rule) => rule.min(0).max(80),
    }),
  ],
  orderings: [
    {
      title: 'Display order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'subtext',
      iconAsset: 'iconAsset',
      image: 'image',
    },
    prepare({ title, subtitle, iconAsset, image }) {
      return {
        title,
        subtitle,
        media: iconAsset ?? image,
      }
    },
  },
})
