"use client";

import type React from "react";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getArticles,
  getCategories,
  getBio,
  saveArticle,
  deleteArticle,
  saveCategory,
  deleteCategory,
  saveBio,
} from "../../lib/actions";
import type { Article, Category, Bio, Link, ArticleImage } from "../../types/article";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trash2,
  Edit,
  Plus,
  LogOut,
  RefreshCw,
  FolderPlus,
  User,
  LinkIcon,
  ImageIcon,
  X,
} from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bio, setBio] = useState<Bio | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // Article form
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    published: true,
    images: [] as ArticleImage[],
  });

  // Image form
  const [imageForm, setImageForm] = useState({
    url: "",
    alt: "",
    caption: "",
  });
  const [editingImage, setEditingImage] = useState<ArticleImage | null>(null);

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: "",
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Bio form
  const [bioForm, setBioForm] = useState({
    name: "",
    title: "",
    company: "",
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
    links: [] as Link[],
  });

  // Link form
  const [linkForm, setLinkForm] = useState({
    name: "",
    url: "",
  });
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Check authentication
    const authenticated = sessionStorage.getItem("admin_authenticated");
    if (authenticated === "true") {
      setIsAuthenticated(true);
      loadData();
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [articlesData, categoriesData, bioData] = await Promise.all([
        getArticles(),
        getCategories(),
        getBio(),
      ]);

      setArticles(articlesData);
      setCategories(categoriesData);
      setBio(bioData);
      setBioForm({
        name: bioData?.name || "",
        title: bioData?.title || "",
        company: bioData?.company || "",
        paragraph1: bioData?.paragraph1 || "",
        paragraph2: bioData?.paragraph2 || "",
        paragraph3: bioData?.paragraph3 || "",
        links: bioData?.links || [],
      });
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Veri yükleme hatası: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    router.push("/");
  };

  const handleImageEdit = (image: ArticleImage) => {
    setEditingImage(image);
    setImageForm({
      url: image.url,
      alt: image.alt,
      caption: image.caption || "",
    });
  };

  const handleImageDelete = (id: string) => {
    const updatedImages = formData.images.filter((img) => img.id !== id);
    setFormData({ ...formData, images: updatedImages });
  };

  const resetImageForm = () => {
    setImageForm({ url: "", alt: "", caption: "" });
    setEditingImage(null);
  };

  // Article functions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      alert("Lütfen tüm alanları doldurun!");
      return;
    }

    startTransition(async () => {
      try {
        const slug = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();
        const article: Article = {
          id: editingArticle?.id || Date.now().toString(),
          title: formData.title,
          content: formData.content,
          category: formData.category,
          slug: editingArticle?.slug || slug,
          createdAt: editingArticle?.createdAt || new Date().toISOString().split("T")[0],
          updatedAt: new Date().toISOString().split("T")[0],
          published: formData.published,
        };

        const result = await saveArticle(article);

        if (result.success) {
          await loadData();
          resetForm();
          alert(isEditing ? "Makale güncellendi!" : "Makale kaydedildi!");
        } else {
          alert("Hata oluştu: " + result.error);
        }
      } catch (error) {
        console.error("Article save error:", error);
        alert("Makale kaydetme hatası: " + error);
      }
    });
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category,
      published: article.published,
      images: article.images || [],
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu makaleyi silmek istediğinizden emin misiniz?")) {
      startTransition(async () => {
        try {
          const result = await deleteArticle(id);

          if (result.success) {
            await loadData();
            alert("Makale silindi!");
          } else {
            alert("Silme işlemi başarısız: " + result.error);
          }
        } catch (error) {
          console.error("Article delete error:", error);
          alert("Makale silme hatası: " + error);
        }
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      category: "",
      published: true,
      images: [],
    });
    setEditingArticle(null);
    setIsEditing(false);
    resetImageForm();
  };

  // Category functions
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryForm.name.trim()) {
      alert("Lütfen kategori adını girin!");
      return;
    }

    startTransition(async () => {
      try {
        const slug = categoryForm.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim();

        const category: Category = {
          id: editingCategory?.id || Date.now().toString(),
          name: categoryForm.name,
          slug: editingCategory?.slug || slug,
        };

        const result = await saveCategory(category);

        if (result.success) {
          await loadData();
          resetCategoryForm();
          alert(editingCategory ? "Kategori güncellendi!" : "Kategori eklendi!");
        } else {
          alert("Hata oluştu: " + result.error);
        }
      } catch (error) {
        console.error("Category save error:", error);
        alert("Kategori kaydetme hatası: " + error);
      }
    });
  };

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
    });
  };

  const handleCategoryDelete = (id: string) => {
    if (confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      startTransition(async () => {
        try {
          const result = await deleteCategory(id);

          if (result.success) {
            await loadData();
            alert("Kategori silindi!");
          } else {
            alert("Silme işlemi başarısız: " + result.error);
          }
        } catch (error) {
          console.error("Category delete error:", error);
          alert("Kategori silme hatası: " + error);
        }
      });
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "" });
    setEditingCategory(null);
  };

  // Bio functions
  const handleBioSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const updatedBio: Bio = {
          id: bio?.id || "1",
          name: bioForm.name,
          title: bioForm.title,
          company: bioForm.company,
          paragraph1: bioForm.paragraph1,
          paragraph2: bioForm.paragraph2,
          paragraph3: bioForm.paragraph3,
          links: bioForm.links,
        };

        const result = await saveBio(updatedBio);

        if (result.success) {
          await loadData();
          alert("Bio güncellendi!");
        } else {
          alert("Hata oluştu: " + result.error);
        }
      } catch (error) {
        console.error("Bio save error:", error);
        alert("Bio kaydetme hatası: " + error);
      }
    });
  };

  // Link functions
  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!linkForm.name.trim() || !linkForm.url.trim()) {
      alert("Lütfen link adı ve URL'sini girin!");
      return;
    }

    const newLink: Link = {
      id: editingLink?.id || Date.now().toString(),
      name: linkForm.name,
      url: linkForm.url,
    };

    if (editingLink) {
      // Update existing link
      const updatedLinks = bioForm.links.map((link) =>
        link.id === editingLink.id ? newLink : link
      );
      setBioForm({ ...bioForm, links: updatedLinks });
    } else {
      // Add new link
      setBioForm({ ...bioForm, links: [...bioForm.links, newLink] });
    }

    resetLinkForm();
  };

  const handleLinkEdit = (link: Link) => {
    setEditingLink(link);
    setLinkForm({
      name: link.name,
      url: link.url,
    });
  };

  const handleLinkDelete = (id: string) => {
    const updatedLinks = bioForm.links.filter((link) => link.id !== id);
    setBioForm({ ...bioForm, links: updatedLinks });
  };

  const resetLinkForm = () => {
    setLinkForm({ name: "", url: "" });
    setEditingLink(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Admin Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={loadData} disabled={isPending}>
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isPending ? "animate-spin" : ""}`}
                />
                Yenile
              </Button>
              <a href="/" className="text-blue-600 hover:underline">
                Ana Sayfa
              </a>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList>
            <TabsTrigger value="articles">Makaleler</TabsTrigger>
            <TabsTrigger value="categories">Kategoriler</TabsTrigger>
            <TabsTrigger value="bio">Bio & Linkler</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Article Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {isEditing ? "Makale Düzenle" : "Yeni Makale"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Başlık</label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Makale başlığı"
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Kategori</label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                        disabled={isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">İçerik</label>
                      <Textarea
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="Makale içeriği... 

**Kalın başlık için** çift yıldız kullanın
• Madde işareti için • kullanın

Paragraflar arasında boş satır bırakın."
                        rows={10}
                        required
                        disabled={isPending}
                      />
                    </div>

                    {/* Image Management */}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="published"
                        checked={formData.published}
                        onChange={(e) =>
                          setFormData({ ...formData, published: e.target.checked })
                        }
                        disabled={isPending}
                      />
                      <label htmlFor="published" className="text-sm">
                        Yayınla
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={isPending}>
                        {isPending
                          ? "Kaydediliyor..."
                          : isEditing
                          ? "Güncelle"
                          : "Kaydet"}
                      </Button>
                      {isEditing && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          disabled={isPending}
                        >
                          İptal
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Articles List */}
              <Card>
                <CardHeader>
                  <CardTitle>Makaleler ({articles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {articles.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Henüz makale yok</p>
                    ) : (
                      articles.map((article) => (
                        <div key={article.id} className="border rounded-lg p-3 bg-white">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{article.title}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                {categories.find((c) => c.slug === article.category)
                                  ?.name || "Kategori bulunamadı"}{" "}
                                •{article.published ? " Yayında" : " Taslak"} •{" "}
                                {article.updatedAt}
                                {article.images && article.images.length > 0 && (
                                  <span className="ml-2">
                                    <ImageIcon className="w-3 h-3 inline" />{" "}
                                    {article.images.length}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(article)}
                                disabled={isPending}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(article.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Önizleme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded border">
                  <h1 className="text-lg font-bold text-black mb-4">
                    {formData.title || "Makale Başlığı"}
                  </h1>

                  {/* Images Preview */}
                  {formData.images.length > 0 && (
                    <div className="space-y-4 mb-6">
                      {formData.images.map((image) => (
                        <div key={image.id} className="space-y-2">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.alt}
                            className="max-w-full h-auto rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/placeholder.svg?height=300&width=600";
                            }}
                          />
                          {image.caption && (
                            <p className="text-sm text-gray-600 italic text-center">
                              {image.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4 text-sm leading-relaxed">
                    {formData.content.split("\n\n").map((paragraph, index) => {
                      if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                        return (
                          <h3
                            key={index}
                            className="font-bold italic text-black mt-6 mb-3"
                          >
                            {paragraph.slice(2, -2)}
                          </h3>
                        );
                      }

                      if (paragraph.includes("•")) {
                        const lines = paragraph.split("\n");
                        return (
                          <div key={index} className="space-y-2">
                            {lines.map((line, lineIndex) => {
                              if (line.trim().startsWith("•")) {
                                return (
                                  <div key={lineIndex} className="ml-4">
                                    <span className="text-blue-600">•</span>
                                    <span className="ml-2">
                                      {line.trim().slice(1).trim()}
                                    </span>
                                  </div>
                                );
                              }
                              return <p key={lineIndex}>{line}</p>;
                            })}
                          </div>
                        );
                      }

                      return (
                        <p key={index} className="text-gray-800">
                          {paragraph || "İçerik buraya gelecek..."}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderPlus className="w-5 h-5" />
                    {editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Kategori Adı
                      </label>
                      <Input
                        value={categoryForm.name}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, name: e.target.value })
                        }
                        placeholder="Kategori adı"
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={isPending}>
                        {isPending
                          ? "Kaydediliyor..."
                          : editingCategory
                          ? "Güncelle"
                          : "Kaydet"}
                      </Button>
                      {editingCategory && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetCategoryForm}
                          disabled={isPending}
                        >
                          İptal
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Categories List */}
              <Card>
                <CardHeader>
                  <CardTitle>Kategoriler ({categories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Henüz kategori yok</p>
                    ) : (
                      categories.map((category) => (
                        <div key={category.id} className="border rounded-lg p-3 bg-white">
                          <div className="flex justify-between items-center gap-2">
                            <div className="flex-1">
                              <h3 className="font-medium text-sm">{category.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Slug: {category.slug}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCategoryEdit(category)}
                                disabled={isPending}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCategoryDelete(category.id)}
                                disabled={isPending}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bio Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Bio Düzenle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBioSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">İsim</label>
                      <Input
                        value={bioForm.name}
                        onChange={(e) => setBioForm({ ...bioForm, name: e.target.value })}
                        placeholder="İsim"
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Başlık/Şirket
                      </label>
                      <Input
                        value={bioForm.title}
                        onChange={(e) =>
                          setBioForm({ ...bioForm, title: e.target.value })
                        }
                        placeholder="Jupiter"
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        1. Paragraf
                      </label>
                      <Textarea
                        value={bioForm.paragraph1}
                        onChange={(e) =>
                          setBioForm({ ...bioForm, paragraph1: e.target.value })
                        }
                        placeholder="Previously, lead adviser at..."
                        rows={3}
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        2. Paragraf
                      </label>
                      <Textarea
                        value={bioForm.paragraph2}
                        onChange={(e) =>
                          setBioForm({ ...bioForm, paragraph2: e.target.value })
                        }
                        placeholder="I like calisthenics..."
                        rows={3}
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        3. Paragraf (Opsiyonel)
                      </label>
                      <Textarea
                        value={bioForm.paragraph3}
                        onChange={(e) =>
                          setBioForm({ ...bioForm, paragraph3: e.target.value })
                        }
                        placeholder="Ek paragraf..."
                        rows={3}
                        disabled={isPending}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? "Kaydediliyor..." : "Bio Güncelle"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Links Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="w-5 h-5" />
                    Link Yönetimi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Link Form */}
                  <form
                    onSubmit={handleLinkSubmit}
                    className="space-y-3 p-3 border rounded"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1">Link Adı</label>
                      <Input
                        value={linkForm.name}
                        onChange={(e) =>
                          setLinkForm({ ...linkForm, name: e.target.value })
                        }
                        placeholder="Jupiter"
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">URL</label>
                      <Input
                        value={linkForm.url}
                        onChange={(e) =>
                          setLinkForm({ ...linkForm, url: e.target.value })
                        }
                        placeholder="https://jupiter.ag"
                        required
                        disabled={isPending}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={isPending}>
                        {editingLink ? "Güncelle" : "Ekle"}
                      </Button>
                      {editingLink && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={resetLinkForm}
                        >
                          İptal
                        </Button>
                      )}
                    </div>
                  </form>

                  {/* Links List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {bioForm.links.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Henüz link yok</p>
                    ) : (
                      bioForm.links.map((link) => (
                        <div
                          key={link.id}
                          className="flex items-center justify-between p-2 border rounded bg-white"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{link.name}</p>
                            <p className="text-xs text-gray-500 truncate">{link.url}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLinkEdit(link)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLinkDelete(link.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bio Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Bio Önizleme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded border space-y-4 text-sm leading-relaxed">
                  <p>
                    {bioForm.name} @ {bioForm.title}.
                  </p>
                  {bioForm.paragraph1 && <p>{bioForm.paragraph1}</p>}
                  {bioForm.paragraph2 && <p>{bioForm.paragraph2}</p>}
                  {bioForm.paragraph3 && <p>{bioForm.paragraph3}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
