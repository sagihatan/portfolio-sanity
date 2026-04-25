import { CogIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  fields: [
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
  ],
  preview: {
    prepare() {
      return {
        title: 'Site settings',
      }
    },
  },
})
