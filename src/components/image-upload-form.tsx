'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import type { ImageType, UserProfile } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateImageHashtags, type GenerateImageHashtagsInput } from '@/ai/flows/generate-image-hashtags';
import { Loader2, UploadCloud, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadFormProps {
  onImageAdd: (newImage: Omit<ImageType, 'id' | 'likes' | 'commentsCount' | 'sharesCount' | 'liked' | 'user' | 'timestamp'> & { user: UserProfile, timestamp: string }) => void;
}

export function ImageUploadForm({ onImageAdd }: ImageUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [username, setUsername] = useState('CurrentUser'); // Mock username
  
  const { toast } = useToast();

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setHashtags([]); // Reset hashtags when new file is selected
    }
  };

  const handleGenerateHashtags = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select an image first.", variant: "destructive" });
      return;
    }
    setIsGeneratingHashtags(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const input: GenerateImageHashtagsInput = {
          photoDataUri: base64data,
          additionalDescription: caption || file.name,
        };
        const result = await generateImageHashtags(input);
        setHashtags(result.hashtags || []);
        toast({ title: "Success", description: "Hashtags generated!" });
      };
      reader.onerror = () => {
        throw new Error("Error reading file.");
      };
    } catch (error) {
      console.error('Error generating hashtags:', error);
      toast({ title: "Error", description: "Failed to generate hashtags. Please try again.", variant: "destructive" });
      setHashtags([]);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!file || !previewUrl) {
      toast({ title: "Error", description: "Please select an image.", variant: "destructive" });
      return;
    }

    // Mock user profile
    const mockUser: UserProfile = {
      name: username || 'DefaultUser',
      avatarUrl: `https://picsum.photos/seed/${username || 'default'}/40/40`,
    };

    onImageAdd({
      src: previewUrl, // For client-side display. Real uploads would use the file.
      alt: file.name,
      caption,
      hashtags,
      user: mockUser,
      timestamp: 'JUST NOW', // Mock timestamp
    });

    // Reset form
    setFile(null);
    setPreviewUrl(null);
    setCaption('');
    setHashtags([]);
    if (document.getElementById('image-upload-input') as HTMLInputElement) {
      (document.getElementById('image-upload-input') as HTMLInputElement).value = "";
    }
    toast({ title: "Success", description: "Image added to gallery!" });
  };

  return (
    <Card className="w-full max-w-xl mx-auto mb-8 shadow-lg rounded-xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-primary" />
            Upload New Image
          </CardTitle>
          <CardDescription>Share your moments with the world. Add a caption and let AI suggest some hashtags!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image-upload-input">Image</Label>
            <Input id="image-upload-input" type="file" accept="image/*" onChange={handleFileChange} required />
          </div>

          {previewUrl && (
            <div className="rounded-md overflow-hidden border-2 border-dashed border-primary/50 p-2">
              <Image src={previewUrl} alt="Selected preview" width={500} height={500} className="aspect-square object-cover w-full rounded" data-ai-hint="image preview" />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username">Username (mock)</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption..." />
          </div>

          <div className="space-y-2">
            <Button type="button" onClick={handleGenerateHashtags} disabled={!file || isGeneratingHashtags} className="w-full sm:w-auto">
              {isGeneratingHashtags ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Hashtags
            </Button>
            {hashtags.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-md mt-2">
                <p className="text-sm font-medium mb-2 text-foreground">Suggested Hashtags:</p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">#{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!file || isGeneratingHashtags} className="w-full">
            Add to Gallery
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
