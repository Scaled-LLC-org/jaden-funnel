import { defineType, defineField } from 'sanity'

export const videoLibrary = defineType({
  name: 'videoLibrary',
  title: 'Video Library',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fieldsets: [{ name: 'videos', title: 'YouTube Video IDs', options: { collapsible: true, collapsed: false } }],
  fields: [
    defineField({
      name: 'vslVideoId',
      title: 'VSL Video ID',
      type: 'string',
      fieldset: 'videos',
      description: 'YouTube ID for the main VSL on the /vsl page. Leave empty to use the static poster.',
    }),
    defineField({
      name: 'thankYouWelcomeVideoId',
      title: 'Thank You — Welcome / Pre-Call Video ID',
      type: 'string',
      fieldset: 'videos',
      description: 'YouTube ID for the pre-call welcome video on the /thank-you page.',
    }),
    defineField({
      name: 'thankYouTrainingVideoId',
      title: 'Thank You — Training Video ID',
      type: 'string',
      fieldset: 'videos',
      description: 'YouTube ID for the training breakdown video on the /thank-you page.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Video Library' }) },
})
