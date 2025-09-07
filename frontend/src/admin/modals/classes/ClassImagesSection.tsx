import { useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { getDefaultClassImage, type ClassImage } from '../../../config/classImages';
import { useAuth } from '../../../contexts/AuthContext';
import type { ClassImagesSectionHandle } from './types';
import { supabase } from '../../../lib/supabase';

interface ClassImagesSectionProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  isOpen: boolean;
  onShowMessage?: (type: 'success' | 'error', title: string, content: string) => void;
}

 

const ClassImagesSection = forwardRef<ClassImagesSectionHandle, ClassImagesSectionProps>(
  ({ imageUrl, onImageUrlChange, isOpen, onShowMessage }, ref) => {
    const { session } = useAuth();

    // תמונות שנבחרו מקומית אך טרם הועלו
    const [newImages, setNewImages] = useState<File[]>([]);
    // תמונות שעלו ל-Supabase (URL אמיתי)
    const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; url: string }>>([]);

    // מצב מודל המחיקה
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<{ url: string; name: string; type: 'predefined' | 'uploaded' } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // תמונות שסומנו למחיקה (תתבצע מחיקה בפועל רק בשמירת השיעור)
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    // רשימת תמונות זמינות בפועל מהסטטיות (סינון לפי קיום ב-bucket)
    const [availableClassImages, setAvailableClassImages] = useState<ClassImage[]>([]);
    useEffect(() => {
      let isMounted = true;
      const fetchImagesFromSupabase = async () => {
        try {
          const { data, error } = await supabase.storage
            .from('classes') // Assuming 'classes' is the correct bucket name
            .list('images/v1', { limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } }); // Corrected path

          if (error) {
            throw error;
          }
          
          const images: ClassImage[] = (data || []).map((file: any) => {
            const publicUrl = supabase.storage.from('classes').getPublicUrl(`images/v1/${file.name}`).data.publicUrl; // Corrected bucket and path
            return {
              id: file.name, // Use file.name (including extension) as id for uniqueness
              name: file.name.split('.')[0], // Extract name without extension
              url: publicUrl,
              description: file.name.split('.')[0], // Use name without extension as description
              category: 'custom' // All uploaded images are custom
            }
          });
    
          if (isMounted) setAvailableClassImages(images);
        } catch (err) {
          console.error('Error fetching images from Supabase:', err);
          if (onShowMessage) {
            onShowMessage('error', 'שגיאה בטעינת תמונות', `לא ניתן לטעון תמונות מ-Supabase: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
          }
          if (isMounted) setAvailableClassImages([]); // Clear if error
        }
      };
      fetchImagesFromSupabase();
      return () => { isMounted = false; };
    }, []); // Removed [onShowMessage] dependency for debugging

    // Effect to update parent's imageUrl when a new image is added
    useEffect(() => {
      if (newImages.length > 0) {
        const lastImageIndex = newImages.length - 1;
        const imagePlaceholderUrl = `new-image-${lastImageIndex}`;
        onImageUrlChange(imagePlaceholderUrl);
      }
    }, [newImages, onImageUrlChange]); // Depend on newImages and onImageUrlChange

    // ניקוי תמונות כשסוגרים/פותחים את המודל מחדש
    useEffect(() => {
      if (isOpen) {
        setNewImages([]);
        setUploadedImages([]);
      }
    }, [isOpen]);

    // חשיפה להורה: העלאת התמונות הממתינות
    useImperativeHandle(ref, () => ({
      uploadPendingImages: async () => {
        if (newImages.length === 0) return;

        if (onShowMessage) {
          onShowMessage('success', 'מעלה תמונות...', `מתחיל להעלות ${newImages.length} תמונה(ות) ל-Supabase...\n\nאנא המתיני עד להשלמת ההעלאה.`);
        }

        const uploadedUrls: string[] = [];
        for (let i = 0; i < newImages.length; i++) {
          const file = newImages[i];
          try {
            const url = await uploadImageToSupabase(file);
            uploadedUrls.push(url);
            setUploadedImages(prev => [...prev, { file, url }]);

            // אם זו התמונה שנבחרה כרגע עם מזהה זמני, עדכני ל-URL האמיתי
            if (imageUrl === `new-image-${i}`) {
              onImageUrlChange(url);
            }
          } catch (err) {
            if (onShowMessage) {
              onShowMessage('error', 'שגיאה בהעלאה', `שגיאה בהעלאת התמונה "${file.name}": ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
            }
            throw err; // נזרוק למעלה כדי לעצור את תהליך השמירה
          }
        }

        if (uploadedUrls.length > 0 && onShowMessage) {
          onShowMessage('success', 'העלאה הושלמה', `${uploadedUrls.length} תמונה(ות) הועלו ל-Supabase בהצלחה!`);
        }

        // ניקוי רשימת התמונות הממתינות לאחר ההעלאה
        setNewImages([]);
      },
      commitDeletions: async () => {
        if (imagesToDelete.length === 0) return;
        const errors: string[] = [];
        for (const url of imagesToDelete) {
          try {
            await deleteImageFromSupabase(url);
            setUploadedImages(prev => prev.filter(img => img.url !== url));
          } catch (err) {
            errors.push(`${url}: ${err instanceof Error ? err.message : 'שגיאה לא ידועה'}`);
          }
        }
        if (errors.length > 0) {
          throw new Error(`חלק מהמחיקות כשלו:\n${errors.join('\n')}`);
        }
        setImagesToDelete([]);
        if (onShowMessage) {
          onShowMessage('success', 'מחיקת תמונות', 'כל התמונות שסומנו נמחקו בהצלחה מ-Supabase.');
        }
      }
    }));

    // העלאת תמונה בודדת ל-Supabase דרך ה-API של המערכת
    const uploadImageToSupabase = async (file: File): Promise<string> => {
      // ולידציה בסיסית
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('גודל הקובץ חייב להיות קטן מ-5MB');
      }
      if (!file.type.startsWith('image/')) {
        throw new Error('יש לבחור קובץ תמונה בלבד');
      }

      if (!session?.access_token) {
        throw new Error('לא נמצא טוקן הרשאה. אנא התחברי מחדש.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ladances.com/api';
      const response = await fetch(`${API_BASE_URL}/admin/upload-class-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('הרשאה נדחתה. אנא התחברי מחדש.');
        }
        if (response.status === 501) {
          throw new Error('מערכת העלאת התמונות עדיין לא מוכנה. אנא פני למפתח המערכת.');
        }
        throw new Error(`שגיאת שרת: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      if (result.success && result.imageUrl) {
        return result.imageUrl as string;
      }
      throw new Error('העלאה נכשלה - לא התקבל URL תמונה');
    };

    // מחיקת תמונה מ-Supabase דרך ה-API של המערכת
    const deleteImageFromSupabase = async (imageUrl: string): Promise<void> => {
      if (!session?.access_token) {
        throw new Error('לא נמצא טוקן הרשאה. אנא התחברי מחדש.');
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.ladances.com/api';
      const response = await fetch(`${API_BASE_URL}/admin/delete-class-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400) {
          throw new Error(errorData.message || 'לא ניתן למחוק את התמונה');
        }
        if (response.status === 401) {
          throw new Error('הרשאה נדחתה. אנא התחברי מחדש.');
        }
        throw new Error(`שגיאת שרת: ${response.status} - ${errorData.message || 'שגיאה לא ידועה'}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'המחיקה נכשלה');
      }
    };

    // בחירת קובץ חדש מקומית
    const handleAddNewImage = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.multiple = false;

      fileInput.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        // ולידציה בסיסית (שוב בצד לקוח לפני העלאה מאוחרת)
        if (file.size > 5 * 1024 * 1024) {
          alert('גודל הקובץ חייב להיות קטן מ-5MB');
          return;
        }
        if (!file.type.startsWith('image/')) {
          alert('יש לבחור קובץ תמונה בלבד');
          return;
        }

        setNewImages(prev => [...prev, file]); // Update newImages state
      };

      fileInput.click();
    };

    // פתיחת מודל מחיקה
    const openDeleteModal = (imageUrl: string, imageName: string, type: 'predefined' | 'uploaded') => {
      setImageToDelete({ url: imageUrl, name: imageName, type });
      setShowDeleteModal(true);
    };

    // עזר: בדיקה אם תמונה סומנה למחיקה
    const isImageMarkedForDeletion = (imageUrl: string) => imagesToDelete.includes(imageUrl);

    // ביצוע המחיקה (סימון בלבד; מחיקה בפועל תתבצע בשמירה)
    const handleDeleteImage = async () => {
      if (!imageToDelete) return;
      
      setIsDeleting(true);
      try {
        // סימון התמונה למחיקה
        setImagesToDelete(prev => (prev.includes(imageToDelete.url) ? prev : [...prev, imageToDelete.url]));
        // אם התמונה שנבחרה למחיקה היא התמונה הנוכחית, נחזור לברירת מחדל
        if (imageUrl === imageToDelete.url) {
          onImageUrlChange(getDefaultClassImage().url);
        }
        if (onShowMessage) {
          onShowMessage('success', 'סומן למחיקה', `"${imageToDelete.name}" יסומן למחיקה ויימחק בשמירת השינויים.`);
        }
        setShowDeleteModal(false);
        setImageToDelete(null);
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <div>
        <h4 className="text-sm font-medium text-[#4B2E83] mb-3">בחרי תמונה לשיעור:</h4>
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {availableClassImages.map((image: ClassImage) => (
            <div
              key={image.id}
              onClick={() => onImageUrlChange(image.url)}
              className={`relative cursor-pointer rounded-lg border-2 transition-all aspect-square overflow-hidden group ${
                imageUrl === image.url
                  ? 'border-[#EC4899] ring-4 ring-[#EC4899]/30 scale-105 shadow-lg shadow-[#EC4899]/25'
                  : 'border-gray-200 hover:border-[#EC4899]/40 hover:scale-105'
              } ${isImageMarkedForDeletion(image.url) ? 'opacity-50 grayscale' : ''}`}
              title={image.description}
            >
              <img
                src={image.url}
                alt={`תמונה ${image.name} לשיעור`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getDefaultClassImage().url;
                }}
              />
              {imageUrl === image.url && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-[#EC4899] rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white text-xs text-center py-2 px-1">
                <div className="font-medium">{image.name}</div>
                {/* Removed category display as it's no longer relevant for dynamic images */}
              </div>
              {/* כפתור מחיקה - רק אם התמונה לא נבחרה כרגע */}
              {imageUrl !== image.url && !isImageMarkedForDeletion(image.url) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal(image.url, image.name, 'predefined');
                  }}
                  className="absolute top-2 left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 pointer-events-none sm:group-hover:opacity-100 sm:pointer-events-auto"
                  title={`מחיקת התמונה "${image.name}"`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {isImageMarkedForDeletion(image.url) && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">נמחק</div>
              )}
            </div>
          ))}

          {/* תמונות חדשות (מקומי) */}
          {newImages.map((file, index) => {
            const placeholderUrl = `new-image-${index}`;
            const isSelected = imageUrl === placeholderUrl;
            return (
              <div
                key={`new-${index}`}
                onClick={() => onImageUrlChange(placeholderUrl)}
                className={`relative cursor-pointer rounded-lg border-2 transition-all aspect-square overflow-hidden group ${
                  isSelected
                    ? 'border-[#EC4899] ring-4 ring-[#EC4899]/30 scale-105 shadow-lg shadow-[#EC4899]/25'
                    : 'border-green-300 hover:border-green-400 hover:scale-105'
                }`}
                title={`תמונה חדשה: ${file.name}`}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`תמונה חדשה ${file.name}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#EC4899] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">חדש</div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white text-xs text-center py-2 px-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-[10px] opacity-80">{(file.size / 1024 / 1024).toFixed(2)}MB</div>
                </div>
              </div>
            );
          })}

          {/* תמונות שהועלו ל-Supabase */}
          {uploadedImages.map((uploadedImage, index) => {
            const isSelected = imageUrl === uploadedImage.url;
            return (
              <div
                key={`uploaded-${index}`}
                onClick={() => onImageUrlChange(uploadedImage.url)}
                className={`relative cursor-pointer rounded-lg border-2 transition-all aspect-square overflow-hidden group ${
                  isSelected
                    ? 'border-[#EC4899] ring-4 ring-[#EC4899]/30 scale-105 shadow-lg shadow-[#EC4899]/25'
                    : 'border-blue-300 hover:border-blue-400 hover:scale-105'
                }`}
                title={`תמונה שהועלתה: ${uploadedImage.file.name}`}
              >
                <img
                  src={uploadedImage.url}
                  alt={`תמונה שהועלתה ${uploadedImage.file.name}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getDefaultClassImage().url;
                  }}
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-[#EC4899] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">הועלה</div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white text-xs text-center py-2 px-1">
                  <div className="font-medium">{uploadedImage.file.name}</div>
                  <div className="text-[10px] opacity-80">Supabase</div>
                </div>
                {/* כפתור מחיקה */}
                {!isImageMarkedForDeletion(uploadedImage.url) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(uploadedImage.url, uploadedImage.file.name, 'uploaded');
                    }}
                    className="absolute top-2 left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 pointer-events-none sm:group-hover:opacity-100 sm:pointer-events-auto"
                    title={`מחיקת התמונה "${uploadedImage.file.name}"`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {isImageMarkedForDeletion(uploadedImage.url) && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">נמחק</div>
                )}
              </div>
            );
          })}

          {/* כרטיס הוספת תמונה חדשה */}
          <div
            onClick={(e) => handleAddNewImage(e)}
            className="relative cursor-pointer rounded-lg border-2 border-dashed border-[#4B2E83]/40 hover:border-[#4B2E83]/60 transition-all aspect-square overflow-hidden group bg-gradient-to-br from-[#4B2E83]/5 to-[#EC4899]/5 hover:from-[#4B2E83]/10 hover:to-[#EC4899]/10"
            title="הוספת תמונה חדשה לשיעורים"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#4B2E83] to-[#EC4899] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#4B2E83]/80 via-[#4B2E83]/40 to-transparent text-white text-xs text-center py-2 px-1">
              <div className="font-medium">
                <span className="hidden sm:inline">הוסיפי תמונה</span>
                <span className="sm:hidden">הוספת תמונה</span>
              </div>
              <div className="text-[10px] opacity-80 hidden sm:block">לחצי להוספה</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#4B2E83]/0 to-[#EC4899]/0 group-hover:from-[#4B2E83]/10 group-hover:to-[#EC4899]/10 transition-all duration-300"></div>
          </div>
        </div>

        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600">התמונות מותאמות לשיעורים ומתעדכנות אוטומטית</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">תמונה חדשה</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">הועלה ל-Supabase</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">כפתור מחיקה (hover)</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 כפתורי המחיקה מופיעים בעת hover. מחיקה תתבצע רק לאחר אישור.
          </p>
        </div>

        {/* מודל אישור מחיקה */}
        {showDeleteModal && imageToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">מחיקת תמונה</h3>
              </div>
              
              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 mb-3">
                  האם את בטוחה שברצונך למחוק את התמונה <strong>"{imageToDelete.name}"</strong>?
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-red-700">
                      <p className="font-medium mb-1">פעולה זו תמחק את התמונה לצמיתות</p>
                      {imageToDelete.type === 'predefined' && (
                        <p className="text-xs opacity-80">שימי לב: תמונות קיימות עשויות להיות בשימוש בשיעורים אחרים.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setImageToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ביטול
                </button>
                <button
                  type="button"
                  onClick={handleDeleteImage}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      מוחק...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      מחקי תמונה
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default ClassImagesSection;


