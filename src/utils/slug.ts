export function generateSlug(text: string): string {
  return text
    .toString()
    .normalize("NFD")                   // Pisahkan karakter + accent
    .replace(/[\u0300-\u036f]/g, "")    // Hapus accent
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")       // Hapus karakter khusus
    .replace(/\s+/g, "-")               // Spasi -> -
    .replace(/-+/g, "-");               // Gabungkan --- -> -
}
