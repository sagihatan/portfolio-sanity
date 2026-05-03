import { CogIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  initialValue: {
    title: 'Site settings',
    trustedLogos: [
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
      initialValue: 'Site settings',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'showHeroStage',
      title: 'Show hero video stage',
      description: 'Turn this on when the hero-stage video is ready to publish.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'heroStageVideo',
      title: 'Hero stage video',
      description: 'Upload the video shown inside the hero-stage frame. MP4 or WebM is recommended.',
      type: 'file',
      options: {
        accept: 'video/mp4,video/webm,video/quicktime',
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { showHeroStage?: boolean } | undefined

          if (parent?.showHeroStage && !value) {
            return 'Upload a hero stage video before turning this on'
          }

          return true
        }),
    }),
    defineField({
      name: 'trustedLogos',
      title: 'Trusted logos',
      description: 'Logos shown in the "Trusted by teams at" strip. Use either a Sanity upload or a local logo URL such as /assets/logos/wisor.png.',
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
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'Site settings',
      }
    },
  },
})
