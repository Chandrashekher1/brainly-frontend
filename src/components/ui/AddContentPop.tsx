import React, { useRef, useState } from 'react';
import { Button } from './Button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { DockIcon, Link, PlusIcon } from 'lucide-react';
import { YoutubeIcons } from '@/icons/YoutubeIcons';
import { TwitterIcon } from '@/icons/TwitterIcon';
import { BACKEND_URL } from '@/config';
import { Input } from './Input';
import { AlertPopup } from './AlertPopup';
import { useContent } from '@/Hook/useContent';

interface Props {
  token: string;
}

export const AddContentPopover: React.FC<Props> = ({ token }) => {
  const [selectedType, setSelectedType] = useState<string | null>('document');
  const [isDocumentOpen, setDocumentOpen] = useState(false);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDescription, setAlertDescription] = useState('');
  const [alertVariant, setAlertVariant] = useState<"default" | "success" | "error">("default");
  const {fetchContent} = useContent();

  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);

  const triggerAlert = (
    title: string,
    description: string,
    variant: "default" | "success" | "error" = "default"
  ) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertVariant(variant);
    setIsAlertOpen(true);
  };

  const handleAddContent = async () => {
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;
    const tags = tagsRef.current?.value?.split(',').map(tag => tag.trim()) || [];

    if (!title || (selectedType === 'document' && !content)) {
      triggerAlert('Missing Fields', 'Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);

    const payload: any = {
      title,
      link,
      type: selectedType || 'document',
      tags,
    };

    if (selectedType === 'document') {
      payload.content = content;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authorization": `${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.message) {
        fetchContent()
        triggerAlert('Success', "Content added successfully!", "success");
        window.location.href = '/dashboard';
      }
    } catch (e: any) {
      triggerAlert('Error', e.message || "Something went wrong.", "error");
      console.error("Error adding content:", e.message);
    } finally {
      setLoading(false);
      setSelectedType(null);
      setDocumentOpen(false);
      setContent('');
      if (titleRef.current) titleRef.current.value = '';
      if (linkRef.current) linkRef.current.value = '';
      if (tagsRef.current) tagsRef.current.value = '';
    }
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" className="mx-2">
            <PlusIcon className="mr-2" /> Add Content
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[95vw] max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Add New Content</h2>
            <p className="text-muted-foreground text-sm">
              Add a new note, link, tweet, or YouTube video to your collection.
            </p>

            <div className="flex flex-wrap justify-center">
              {[
                { label: 'Document', type: 'document', icon: <DockIcon /> },
                { label: 'YouTube', type: 'youtube', icon: <YoutubeIcons /> },
                { label: 'Tweet', type: 'twitter', icon: <TwitterIcon /> },
                { label: 'Link', type: 'link', icon: <Link /> },
              ].map(({ label, type, icon }) => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="lg"
                  className={`mx-2 my-2 w-60 h-12 font-semibold text-lg ${
                    selectedType === type ? 'ring-2 ring-primary shadow-md' : ''
                  }`}
                  onClick={() => {
                    setSelectedType(type);
                    setDocumentOpen(type !== 'document');
                  }}
                >
                  {icon} {label}
                </Button>
              ))}
            </div>

            {isDocumentOpen && (
              <div>
                <label className="block text-sm font-medium">
                  URL <span className="text-red-500">*</span>
                </label>
                <Input ref={linkRef} placeholder="Enter the URL" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </label>
              <Input ref={titleRef} placeholder="Enter a descriptive title" />
            </div>

            {selectedType === 'document' && (
              <div>
                <label className="block text-sm font-medium">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-32 border border-border bg-background text-foreground p-2 rounded-md"
                  placeholder="Write your content in Markdown format..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">Tags</label>
              <Input ref={tagsRef} placeholder="Add tags, separated by commas" />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost">Cancel</Button>
              <Button variant={loading ? "outline" : "default"} onClick={handleAddContent}>
                {loading ? 'Adding...' : 'Add Content'}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <AlertPopup
        title={alertTitle}
        description={alertDescription}
        isOpen={isAlertOpen}
        setIsOpen={setIsAlertOpen}
        variant={alertVariant}
      />
    </>
  );
};
