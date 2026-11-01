/**
 * Plain words for the actions a media server (Blossom) request can ask for.
 * Data only, so the prompt, the app list and utils can all read it.
 */
export const BLOSSOM_ACTIONS = Object.freeze({
    upload: { label: 'Upload a file to a media server', remember: 'Remember uploads for this site', risk: 'neutral' },
    media: { label: 'Send a file to a media server to process', remember: 'Remember media uploads for this site', risk: 'neutral' },
    get: { label: 'Fetch a file from a media server', remember: 'Remember file fetches for this site', risk: 'neutral' },
    list: { label: 'List your files on a media server', remember: 'Remember file lists for this site', risk: 'neutral' },
    delete: {
        label: 'Delete a file from a media server',
        remember: null,
        risk: 'danger',
        warning: 'This deletes a file from a media server. It cannot be undone.',
    },
});
