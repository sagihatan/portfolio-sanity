import { CogIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const capabilitiesSettings = defineType({
  name: 'capabilitiesSettings',
  title: 'Capabilities carousel',
  type: 'document',
  icon: CogIcon,
  initialValue: {
    title: 'Capabilities carousel',
    items: [
      {
        _type: 'capability',
        title: 'MVPs',
        description: 'From idea to product.',
        enabled: true,
      },
      {
        _type: 'capability',
        title: 'SaaS',
        description: 'Make complex products simple.',
        enabled: true,
      },
      {
        _type: 'capability',
        title: 'Mobile apps',
        description: 'Apps people love to use.',
        enabled: true,
      },
      {
        _type: 'capability',
        title: 'Websites',
        description: 'Make them clear and memorable.',
        enabled: true,
      },
      {
        _type: 'capability',
        title: 'Branding',
        description: 'Make your product unforgettable.',
        enabled: true,
      },
    ],
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Capabilities carousel',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'items',
      title: 'Capabilities carousel',
      description: 'Items shown in the scroll-driven capabilities orbit. Drag to reorder; upload an image for each card.',
      type: 'array',
      of: [
        defineField({
          name: 'capability',
          title: 'Capability',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'image',
              title: 'Image',
              description: 'Image shown inside the carousel card.',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'altText',
              title: 'Alt text',
              description: 'Used for accessibility. If empty, the capability title is used.',
              type: 'string',
            }),
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
              media: 'image',
              enabled: 'enabled',
            },
            prepare({ title, subtitle, media, enabled }) {
              return {
                title: title || 'Capability',
                subtitle: enabled === false ? 'Disabled' : subtitle,
                media,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Capabilities carousel',
      }
    },
  },
})
