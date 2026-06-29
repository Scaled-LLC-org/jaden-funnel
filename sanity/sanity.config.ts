import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'
import { deskStructure } from './deskStructure'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'PLACEHOLDER_SANITY_PROJECT_ID'

export default defineConfig({
  name: 'jaden-funnel',
  title: 'Aesthetic Mastery',
  projectId,
  dataset: 'production',
  plugins: [structureTool({ structure: deskStructure }), visionTool()],
  schema: { types: schemaTypes },
})
