export const slugify = (text: string) => {
    return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')       // Remove special chars
    .replace(/(^-|-$)/g, '')           // Replace spaces/underscores with -
    .replace(/^-+|-+$/g, '')           // Trim leading/trailing dashes
}