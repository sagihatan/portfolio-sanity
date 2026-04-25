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
      description: 'Optional. Replaces the CSS art background. Format: webp (80–90 q), jpg for photos, png for UI/text. Keep the main subject centered — the site uses background-size: cover, so edges crop on mobile and tablet. If one size fits all tiles, use 2400 × 1600 px.',
      type: 'image',
      options: { hotspot: true },
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
