import { defineType, defineField } from 'sanity'
import { headlineField } from './headlineField'

export const amBookPage = defineType({
  name: 'amBookPage',
  title: 'Aesthetic Mastery — Book Call',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'announcementBarText',
      title: 'Announcement / Urgency Bar Text',
      type: 'string',
      description: 'The bar above the page (e.g. "Limited strategy-call spots this week").',
    }),
    headlineField('Highlight the emphasized phrase ("free strategy call").'),
    defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 3 }),
  ],
  preview: { prepare: () => ({ title: 'Book Call' }) },
})
