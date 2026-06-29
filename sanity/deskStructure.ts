import { StructureBuilder } from 'sanity/structure'

/**
 * Singleton desk: every document is a one-of-a-kind page (documentId === type
 * name), so we render fixed editors instead of document lists.
 */
export const deskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Global')
        .child(
          S.list()
            .title('Global')
            .items([
              S.listItem().title('Settings').id('amSettings').child(S.document().schemaType('amSettings').documentId('amSettings')),
              S.listItem().title('Video Library').id('videoLibrary').child(S.document().schemaType('videoLibrary').documentId('videoLibrary')),
            ]),
        ),
      S.divider(),
      S.listItem()
        .title('Funnel Pages')
        .child(
          S.list()
            .title('Funnel Pages')
            .items([
              S.listItem().title('Home / Quiz Intro').id('amHomePage').child(S.document().schemaType('amHomePage').documentId('amHomePage')),
              S.listItem().title('Results (/results)').id('amResultsPage').child(S.document().schemaType('amResultsPage').documentId('amResultsPage')),
              S.listItem().title('VSL (/vsl)').id('amVslPage').child(S.document().schemaType('amVslPage').documentId('amVslPage')),
              S.listItem().title('Book Call (/book)').id('amBookPage').child(S.document().schemaType('amBookPage').documentId('amBookPage')),
              S.listItem().title('Thank You (/thank-you)').id('amThankYouPage').child(S.document().schemaType('amThankYouPage').documentId('amThankYouPage')),
              S.listItem()
                .title('Community (/community)')
                .id('amCommunityPage')
                .child(S.document().schemaType('amCommunityPage').documentId('amCommunityPage')),
            ]),
        ),
    ])
