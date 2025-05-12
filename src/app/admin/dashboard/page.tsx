
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { addImageAction, getImagesAdminAction, deleteImageAction, updateImageOrderAction } from '@/actions/imageActions';
import { logoutAction } from '@/actions/authActions';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, LogOut, ImageUp, GripVertical, Save } from 'lucide-react';
import type { ImageType } from '@/types';
import NextImage from 'next/image';


export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [altText, setAltText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingImages, setIsFetchingImages] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<ImageType[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const draggedItem = useRef<ImageType | null>(null);
  const draggedOverItem = useRef<ImageType | null>(null);


  const fetchUploadedImages = async () => {
    setIsFetchingImages(true);
    try {
      const images = await getImagesAdminAction();
      // Ensure images are sorted by order client-side as well, though backend should do it.
      setUploadedImages(images.sort((a, b) => a.order - b.order));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching images', description: 'Could not load existing images.' });
    } finally {
      setIsFetchingImages(false);
    }
  };

  useEffect(() => {
    fetchUploadedImages();
  }, [toast]); // Added toast to dependency array as it's used in fetchUploadedImages error handling

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'File too large', description: 'Please select an image smaller than 5MB.' });
        e.target.value = ''; // Reset file input
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !caption.trim() || !altText.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Image file, Caption and Alt Text are required.' });
      return;
    }
    setIsLoading(true);

    const hashtagsArray = hashtags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const readFileAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    };

    try {
      const imageDataUri = await readFileAsDataURL(imageFile);

      const result = await addImageAction({
        src: imageDataUri,
        caption,
        hashtags: hashtagsArray,
        alt: altText,
      });

      if (result.success && result.data) {
        toast({ title: 'Image Added', description: 'Your image has been successfully added.' });
        setCaption('');
        setHashtags('');
        setImageFile(null);
        setImagePreview(null);
        setAltText('');
        const fileInput = document.getElementById('imageFile') as HTMLInputElement;
        if (fileInput) fileInput.value = ''; 
        fetchUploadedImages(); 
      } else {
        toast({ variant: 'destructive', title: 'Failed to Add Image', description: result.error || 'An unknown error occurred. Check server logs for details.' });
      }
    } catch (error: any) {
      console.error("Error processing or uploading image:", error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not process or upload the image.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteImageAction(imageId);
      if (result.success) {
        toast({ title: 'Image Deleted', description: 'The image has been successfully deleted.' });
        fetchUploadedImages(); 
      } else {
        toast({ variant: 'destructive', title: 'Deletion Failed', description: result.error || 'Could not delete the image.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'An unexpected error occurred during deletion.' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    const orderedImageIds = uploadedImages.map(img => img.id);
    try {
      const result = await updateImageOrderAction(orderedImageIds);
      if (result.success) {
        toast({ title: 'Order Saved', description: 'Image order has been successfully updated.' });
        fetchUploadedImages(); // Re-fetch to confirm order from DB
      } else {
        toast({ variant: 'destructive', title: 'Failed to Save Order', description: result.error || 'Could not save the new image order.' });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Saving Order', description: error.message || 'An unexpected error occurred.' });
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, image: ImageType) => {
    draggedItem.current = image;
    // Optionally add a class for styling the dragged item
    // e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, image: ImageType) => {
    e.preventDefault(); // Necessary to allow dropping
    draggedOverItem.current = image;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedItem.current || !draggedOverItem.current || draggedItem.current.id === draggedOverItem.current.id) {
      return;
    }

    const items = [...uploadedImages];
    const draggedItemIndex = items.findIndex(item => item.id === draggedItem.current!.id);
    const draggedOverItemIndex = items.findIndex(item => item.id === draggedOverItem.current!.id);

    // Remove dragged item and insert it at the new position
    const [reorderedItem] = items.splice(draggedItemIndex, 1);
    items.splice(draggedOverItemIndex, 0, reorderedItem);

    setUploadedImages(items);

    draggedItem.current = null;
    draggedOverItem.current = null;
    // e.currentTarget.classList.remove('dragging'); // If added class on dragStart
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // e.currentTarget.classList.remove('dragging'); // If added class on dragStart
  };


  const handleLogout = async () => {
    await logoutAction();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut size={18} /> Logout
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Add New Image</CardTitle>
            <CardDescription>Fill in the details to add a new image to the gallery.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="imageFile">Image File (Max 5MB)</Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleFileChange}
                  required
                />
                 {imagePreview && (
                  <div className="mt-4 p-2 border rounded-md inline-block bg-muted">
                    <NextImage 
                      src={imagePreview} 
                      alt="Image preview" 
                      width={100} 
                      height={100} 
                      className="rounded object-cover" 
                      data-ai-hint="image preview"
                      unoptimized // Data URIs should be unoptimized
                    />
                  </div>
                )}
              </div>
               <div className="space-y-2">
                <Label htmlFor="altText">Alt Text (for accessibility)</Label>
                <Input
                  id="altText"
                  type="text"
                  placeholder="A descriptive text for the image"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="caption">Caption</Label>
                <Textarea
                  id="caption"
                  placeholder="Enter image caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                <Input
                  id="hashtags"
                  type="text"
                  placeholder="nature, travel, sunset"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <><ImageUp className="mr-2 h-5 w-5" /> Add Image</>}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row justify-between items-start"> {/* items-start for better alignment with multiline description */}
            <div className="flex-grow"> {/* Allow text to take space */}
              <CardTitle className="text-2xl">Uploaded Images</CardTitle>
              <CardDescription>Drag to reorder images. Click save to persist changes.</CardDescription>
            </div>
            <Button onClick={handleSaveOrder} disabled={isSavingOrder || isFetchingImages || uploadedImages.length === 0} size="sm" className="ml-4 shrink-0"> {/* Add margin and shrink-0 */}
              {isSavingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Order
            </Button>
          </CardHeader>
          <CardContent>
            {isFetchingImages ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : uploadedImages.length === 0 ? (
              <p className="text-muted-foreground text-center">No images uploaded yet.</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {uploadedImages.map((image, index) => (
                  <div 
                    key={image.id} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted cursor-grab"
                    draggable
                    onDragStart={(e) => handleDragStart(e, image)}
                    onDragOver={(e) => handleDragOver(e, image)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder"
                  >
                    <div className="flex items-center gap-3 flex-grow">
                       <GripVertical className="h-5 w-5 text-muted-foreground shrink-0" />
                      <NextImage
                        src={image.src}
                        alt={image.alt}
                        width={40}
                        height={40}
                        className="rounded object-cover shrink-0"
                        unoptimized={image.src.startsWith('data:') || image.src.startsWith('https://files.catbox.moe')} 
                        data-ai-hint="gallery thumbnail"
                        />
                      <span className="truncate font-medium flex-grow" title={image.caption}>{image.caption.length > 25 ? `${image.caption.substring(0,22)}...` : image.caption}</span>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 shrink-0" title="Delete" disabled={isDeleting}>
                          {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the image
                            &quot;{image.caption}&quot; and re-adjust the order of other images.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteImage(image.id)}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
