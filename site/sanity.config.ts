import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Sagi Hatan – Portfolio',
  basePath: '/studio',

  projectId: 'gqanrvta',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site settings')
              .schemaType('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
            S.listItem()
              .title('Trusted logos')
              .schemaType('trustedLogosSettings')
              .child(
                S.document()
                  .schemaType('trustedLogosSettings')
                  .documentId('trustedLogosSettings')
                  .title('Trusted logos')
              ),
            S.listItem()
              .title('Capabilities carousel')
              .schemaType('capabilitiesSettings')
              .child(
                S.document()
                  .schemaType('capabilitiesSettings')
                  .documentId('capabilitiesSettings')
                  .title('Capabilities carousel')
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (item) =>
                !['siteSettings', 'trustedLogosSettings', 'capabilitiesSettings'].includes(item.getId() || '')
            ),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
