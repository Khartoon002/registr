// lib/slugify.ts
export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")  // replace non-alphanumeric characters with "-"
    .replace(/(^-|-$)+/g, "")      // remove leading/trailing hyphens
    .slice(0, 60);                 // limit length to 60 characters
}