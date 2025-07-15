"use server";

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  DocumentData,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import type { Article, Category, Bio, ArticleImage } from "../types/article";
import { db, storage } from "./firebase";

// Articles
export async function getArticles(): Promise<Article[]> {
  try {
    const articlesRef = collection(db, "articles");
    const querySnapshot = await getDocs(articlesRef);
    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Article));
  } catch (error) {
    console.error("Error getting articles:", error);
    return [];
  }
}

export async function saveArticle(
  article: Article
): Promise<{ success: boolean; error?: string }> {
  try {
    const articleRef = doc(db, "articles", article.id);

    // Handle image uploads if any
    if (article.images && article.images.length > 0) {
      const uploadedImages = await Promise.all(
        article.images.map(async (image: ArticleImage) => {
          // If the image URL is already a Firebase Storage URL, keep it as is
          if (image.url.includes("firebasestorage.googleapis.com")) {
            return image;
          }

          // If it's a new image (either base64 or direct upload)
          try {
            const timestamp = Date.now();
            const imageRef = ref(
              storage,
              `articles/${article.id}/${timestamp}_${image.id}`
            );

            // Handle base64 images
            if (image.url.startsWith("data:")) {
              const response = await fetch(image.url);
              const blob = await response.blob();
              await uploadBytes(imageRef, blob);
            } else {
              // Handle direct URL uploads
              const response = await fetch(image.url);
              const blob = await response.blob();
              await uploadBytes(imageRef, blob);
            }

            const downloadUrl = await getDownloadURL(imageRef);
            return {
              ...image,
              url: downloadUrl,
            };
          } catch (error) {
            console.error("Error uploading image:", error);
            // If upload fails, return original image
            return image;
          }
        })
      );
      article.images = uploadedImages;
    }

    await setDoc(articleRef, article);
    return { success: true };
  } catch (error) {
    console.error("Error saving article:", error);
    return { success: false, error: "Failed to save article" };
  }
}

export async function deleteArticle(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete the article document
    await deleteDoc(doc(db, "articles", id));

    // Delete associated images
    try {
      const imagesRef = ref(storage, `articles/${id}`);
      await deleteObject(imagesRef);
    } catch (error) {
      // Ignore errors if no images exist
      console.log("No images to delete or error deleting images:", error);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting article:", error);
    return { success: false, error: "Failed to delete article" };
  }
}

// Categories
export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, "categories");
    const querySnapshot = await getDocs(categoriesRef);
    return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Category));
  } catch (error) {
    console.error("Error getting categories:", error);
    return [];
  }
}

export async function saveCategory(
  category: Category
): Promise<{ success: boolean; error?: string }> {
  try {
    const categoryRef = doc(db, "categories", category.id);
    await setDoc(categoryRef, category);
    return { success: true };
  } catch (error) {
    console.error("Error saving category:", error);
    return { success: false, error: "Failed to save category" };
  }
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, "categories", id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}

// Bio
export async function getBio(): Promise<Bio | null> {
  try {
    const bioRef = doc(db, "bio", "1");
    const bioDoc = await getDoc(bioRef);

    if (!bioDoc.exists()) {
      return null;
    }

    return bioDoc.data() as Bio;
  } catch (error) {
    console.error("Error getting bio:", error);
    return null;
  }
}

export async function saveBio(bio: Bio): Promise<{ success: boolean; error?: string }> {
  try {
    const bioRef = doc(db, "bio", bio.id);
    await setDoc(bioRef, bio);
    return { success: true };
  } catch (error) {
    console.error("Error saving bio:", error);
    return { success: false, error: "Failed to save bio" };
  }
}
