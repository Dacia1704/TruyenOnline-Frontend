"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { StoryFormPage } from "@/features/uploader";

function StoryFormPageWrapper() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  return <StoryFormPage storyId={editId || undefined} />;
}

export default function UploaderStoryNewRoute() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StoryFormPageWrapper />
    </Suspense>
  );
}
