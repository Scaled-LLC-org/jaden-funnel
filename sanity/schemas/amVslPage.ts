import { defineType, defineField } from 'sanity'
import { headlineField } from './headlineField'

export const amVslPage = defineType({
  name: 'amVslPage',
  title: 'Aesthetic Mastery — VSL',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'announcementBarText',
      title: 'Announcement / Urgency Bar Text',
      type: 'string',
      description: 'The bar above the video (e.g. "Please watch the full video below...").',
    }),
    defineField({ name: 'eyebrowCopy', title: 'Eyebrow', type: 'string' }),
    headlineField('Headline above / around the VSL. Highlight the emphasized words.'),
    defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 3 }),
    defineField({ name: 'ctaButtonText', title: 'CTA Button Text', type: 'string' }),
    defineField({
      name: 'exitIntentText',
      title: 'Exit-Intent / Reassurance Text',
      type: 'string',
      description: 'Fine print under the CTA.',
    }),
  ],
  preview: { prepare: () => ({ title: 'VSL' }) },
})
