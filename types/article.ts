export interface Article {
  id: string
  title: string
  content: string
  category: string
  slug: string
  createdAt: string
  updatedAt: string
  published: boolean
  images?: ArticleImage[]
}

export interface ArticleImage {
  id: string
  url: string
  alt: string
  caption?: string
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Link {
  id: string
  name: string
  url: string
}

export interface Bio {
  id: string
  name: string
  title: string
  company: string
  paragraph1: string
  paragraph2: string
  paragraph3: string
  links: Link[]
}
