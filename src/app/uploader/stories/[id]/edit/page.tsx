"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditStoryPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const storyId = params?.id;

  useEffect(() => {
    if (storyId) {
      router.replace(`/uploader/stories/new?edit=${storyId}`);
    }
  }, [storyId, router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
