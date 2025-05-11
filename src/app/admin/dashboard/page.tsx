
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { addImageAction, getImagesAdminAction } from '@/actions/imageActions'; // Will create this
import { logoutAction } from '@/actions/authActions';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2, LogOut } from 'lucide-react';
import type { ImageType } from '@/types'; 
import NextImage from 'next/image';


export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingImages, setIsFetchingImages] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<ImageType[]>([]);


  const fetchUploadedImages = async () => {
    setIsFetchingImages(true);
    try {
      const images = await getImagesAdminAction(); // Action to get images for admin view
      setUploadedImages(images);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching images', description: 'Could not load existing images.' });
    } finally {
      setIsFetchingImages(false);
    }
  };

  useEffect(() => {
    fetchUploadedImages();
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim() || !caption.trim() || !altText.trim()) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Image URL, Caption and Alt Text are required.' });
      return;
    }
    setIsLoading(true);

    const hashtagsArray = hashtags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      const result = await addImageAction({ 
        src: imageUrl, 
        caption, 
        hashtags: hashtagsArray,
        alt: altText,
      });

      if (result.success && result.image) {
        toast({ title: 'Image Added', description: 'Your image has been successfully added.' });
        setCaption('');
        setHashtags('');
        setImageUrl('');
        setAltText('');
        fetchUploadedImages(); // Refresh the list
      } else {
        toast({ variant: 'destructive', title: 'Failed to Add Image', description: result.error || 'An unknown error occurred.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred while adding the image.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
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
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Add Image'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Uploaded Images</CardTitle>
            <CardDescription>Manage existing images.</CardDescription>
          </CardHeader>
          <CardContent>
            {isFetchingImages ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : uploadedImages.length === 0 ? (
              <p className="text-muted-foreground text-center">No images uploaded yet.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div className="flex items-center gap-3">
                      <NextImage 
                        src={image.src} 
                        alt={image.alt} 
                        width={50} 
                        height={50} 
                        className="rounded object-cover"
                        unoptimized={image.src.startsWith('https://files.catbox.moe')}
                        />
                      <span className="truncate font-medium" title={image.caption}>{image.caption.length > 30 ? `${image.caption.substring(0,27)}...` : image.caption}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" title="Delete (not implemented)">
                      <Trash2 size={18} />
                    </Button>
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
