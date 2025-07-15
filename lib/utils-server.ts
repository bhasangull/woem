import type { Article } from "../types/article"

export function getArticleBySlug(articles: Article[], slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug)
}

export function getArticlesByCategory(articles: Article[], categorySlug: string): Article[] {
  return articles.filter((a) => a.category === categorySlug && a.published)
}
