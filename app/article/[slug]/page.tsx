import { getArticles } from "../../../lib/actions";
import { getArticleBySlug } from "../../../lib/utils-server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const articles = await getArticles();
  const { slug } = await params;
  const article = getArticleBySlug(articles, slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white w-[42rem]">
      <div className="max-w-4xl mx-auto p-6">
        <Link href="/" className="text-gray-600 hover:underline text-sm">
          {"<"} 🐈
        </Link>
        {/* Simple Navigation */}
        <div className="mb-6 mt-6">
          <div className="text-sm text-gray-600 ">Woem</div>
        </div>

        <div className="space-y-6">
          {/* Article Header */}
          <div className="space-y-4">
            <h1 className="text-lg font-bold text-black">{article.title}</h1>
          </div>

          {/* Article Content */}
          <div className="space-y-4 text-sm leading-relaxed">
            {article.content.split("\n\n").map((paragraph, index) => {
              // Handle bold text (markdown-style)
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return (
                  <h3 key={index} className="font-bold italic text-black mt-6 mb-3">
                    {paragraph.slice(2, -2)}
                  </h3>
                );
              }

              // Handle bullet points
              if (paragraph.includes("•")) {
                const lines = paragraph.split("\n");
                return (
                  <div key={index} className="space-y-2">
                    {lines.map((line, lineIndex) => {
                      if (line.trim().startsWith("•")) {
                        return (
                          <div key={lineIndex} className="ml-4">
                            <span className="text-blue-600">•</span>
                            <span className="ml-2">{line.trim().slice(1).trim()}</span>
                          </div>
                        );
                      }
                      return <p key={lineIndex}>{line}</p>;
                    })}
                  </div>
                );
              }

              // Regular paragraphs
              return (
                <p key={index} className="text-gray-800">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
