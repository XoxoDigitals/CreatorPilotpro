import { Suspense } from "react";
import PostsClient from "./PostsClient";

export default function PostsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <PostsClient />
    </Suspense>
  );
}
