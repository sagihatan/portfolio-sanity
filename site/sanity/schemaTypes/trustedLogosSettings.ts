import { CogIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const trustedLogosSettings = defineType({
  name: 'trustedLogosSettings',
  title: 'Trusted logos',
  type: 'document',
  icon: CogIcon,
  initialValue: {
    title: 'Trusted logos',
    logos: [
      {
        _type: 'trustedLogo',
        name: 'Voltify',
        altText: 'Voltify',
        enabled: true,
        displayHeight: 24,
        maxWidth: 138,
        verticalOffset: 0,
        localLogoUrl: '/assets/logos/voltify.svg',
      },
      {
        _type: 'trustedLogo',
        name: 'MESH',
        altText: 'MESH',
        enabled: true,
        displayHeight: 24,
        maxWidth: 138,
        verticalOffset: 0,
        localLogoUrl: '/assets/logos/mesh.png',
      },
      {
        _type: 'trustedLogo',
        name: 'Wisor.AI',
        altText: 'Wisor.AI',
        enabled: true,
        displayHeight: 31,
        maxWidth: 170,
        verticalOffset: -1,
        localLogoUrl: '/assets/logos/wisor.png',
      },
      {
        _type: 'trustedLogo',
        name: 'Quizell',
        altText: 'Quizell',
        enabled: true,
        displayHeight: 24,
        maxWidth: 138,
        verticalOffset: 0,
        localLogoUrl: '/assets/logos/quizell.png',
      },
      {
        _type: 'trustedLogo',
        name: 'NSO Group',
        altText: 'NSO Group',
        enabled: true,
        displayHeight: 34,
        maxWidth: 98,
        verticalOffset: 1,
        localLogoUrl: '/assets/logos/nso.png',
      },
    ],
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Trusted logos',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'logos',
      title: 'Trusted logos',
      description: 'Logos shown in the "Trusted by teams at" strip. Drag to reorder.',
      type: 'array',
      of: [
        defineField({
          name: 'trustedLogo',
          title: 'Trusted logo',
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Company name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'logo',
              title: 'Logo file',
              description: 'Preferred for new logos. SVG, transparent PNG/JPG/WebP are supported.',
              type: 'file',
              options: {
                accept: 'image/svg+xml,image/png,image/jpeg,image/webp',
              },
            }),
            defineField({
              name: 'localLogoUrl',
              title: 'Local logo URL',
              description: 'Use for logos already included in the website, for example /assets/logos/voltify.svg.',
              type: 'string',
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as { logo?: unknown } | undefined

                  if (!value && !parent?.logo) {
                    return 'Upload a logo file or add a local logo URL'
                  }

                  if (value && !value.startsWith('/assets/logos/')) {
                    return 'Local logo URLs should start with /assets/logos/'
                  }

                  return true
                }),
            }),
            defineField({
              name: 'altText',
              title: 'Alt text',
              description: 'Used for accessibility. Usually the company name is enough.',
              type: 'string',
            }),
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              name: 'displayHeight',
              title: 'Display height',
              description: 'Optional visual height in pixels. Default is 30.',
              type: 'number',
              validation: (rule) => rule.min(16).max(80),
            }),
            defineField({
              name: 'maxWidth',
              title: 'Max width',
              description: 'Optional maximum width in pixels. Default is 170.',
              type: 'number',
              validation: (rule) => rule.min(60).max(260),
            }),
            defineField({
              name: 'verticalOffset',
              title: 'Vertical offset',
              description: 'Optional Y offset in pixels for optical alignment. Negative moves up.',
              type: 'number',
              validation: (rule) => rule.min(-20).max(20),
            }),
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'altText',
              media: 'logo',
              localLogoUrl: 'localLogoUrl',
              enabled: 'enabled',
            },
            prepare({ title, subtitle, media, localLogoUrl, enabled }) {
              return {
                title: title || 'Trusted logo',
                subtitle: enabled === false ? 'Disabled' : subtitle || localLogoUrl,
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
        title: 'Trusted logos',
      }
    },
  },
})
