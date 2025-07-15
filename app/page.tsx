import Link from "next/link";
import { getArticles, getCategories, getBio } from "../lib/actions";
import { getArticlesByCategory } from "../lib/utils-server";

// Add revalidation configuration
export const revalidate = 0; // This enables on-demand revalidation

function renderTextWithLinks(text: string, links: Array<{ name: string; url: string }>) {
  let result = text;

  // Sort links by length (longest first) to avoid partial replacements
  const sortedLinks = [...links].sort((a, b) => b.name.length - a.name.length);

  sortedLinks.forEach((link) => {
    const regex = new RegExp(`\\b${link.name}\\b`, "gi");
    result = result.replace(regex, `<LINK>${link.name}|${link.url}</LINK>`);
  });

  // Split by <LINK> tags and render
  const parts = result.split(/<LINK>|<\/LINK>/);
  const elements = [];

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Regular text
      if (parts[i]) {
        elements.push(parts[i]);
      }
    } else {
      // Link text
      const [linkText, linkUrl] = parts[i].split("|");
      elements.push(
        <Link key={i} href={linkUrl} className="text-blue-600 hover:underline">
          {linkText}
        </Link>
      );
    }
  }

  return elements;
}

export default async function HomePage() {
  let articles: Awaited<ReturnType<typeof getArticles>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let bio: Awaited<ReturnType<typeof getBio>> = null;

  try {
    const [articlesData, categoriesData, bioData] = await Promise.all([
      getArticles(),
      getCategories(),
      getBio(),
    ]);

    articles = articlesData;
    categories = categoriesData;
    bio = bioData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  return (
    <div className="min-h-screen bg-white max-w-2xl">
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6 text-sm leading-relaxed">
          {/* Dynamic Bio Section */}
          {bio && (
            <div className="space-y-4">
              <p>
                {bio.name}
                <Link
                  href={bio.links[0].url}
                  target="_blank"
                  className="text-blue-600 hover:underline"
                >
                  {" "}
                  {bio.title}
                </Link>
                .
              </p>

              {bio.paragraph1 && <p>{renderTextWithLinks(bio.paragraph1, bio.links)}</p>}

              {bio.paragraph2 && <p>{renderTextWithLinks(bio.paragraph2, bio.links)}</p>}

              {bio.paragraph3 && <p>{renderTextWithLinks(bio.paragraph3, bio.links)}</p>}
            </div>
          )}

          {/* Dynamic Categories and Articles */}
          {categories.length > 0 ? (
            categories.map((category) => {
              const categoryArticles = getArticlesByCategory(articles, category.slug);

              return (
                <div key={category.id} className="space-y-3">
                  <h2 className="font-bold italic text-black">{category.name}</h2>
                  <div className="space-y-1 ml-4">
                    {categoryArticles.length > 0 ? (
                      categoryArticles.map((article) => (
                        <div key={article.id}>
                          <Link
                            href={`/article/${article.slug}`}
                            className="text-blue-600 hover:underline"
                          >
                            {article.title}
                          </Link>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">
                        No articles in this category yet...
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 italic">No categories available yet...</p>
          )}
        </div>
      </div>
    </div>
  );
}
