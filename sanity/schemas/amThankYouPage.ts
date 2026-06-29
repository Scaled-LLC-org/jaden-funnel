import { defineType, defineField } from 'sanity'
import { headlineField } from './headlineField'

export const amThankYouPage = defineType({
  name: 'amThankYouPage',
  title: 'Aesthetic Mastery — Thank You',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    headlineField('Hero headline. Highlight the emphasized words.'),
    defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 3 }),
    defineField({
      name: 'stepsHeading',
      title: 'Steps Section Heading',
      type: 'string',
      description: 'Heading for the 3-step "before your call" section.',
    }),
    defineField({
      name: 'aboutHeading',
      title: 'About Section Heading',
      type: 'string',
      description: 'Heading for the closing "this is a conversation, not a pitch" section.',
    }),
    defineField({ name: 'aboutBody', title: 'About Section Body', type: 'text', rows: 4 }),
  ],
  preview: { prepare: () => ({ title: 'Thank You' }) },
})
