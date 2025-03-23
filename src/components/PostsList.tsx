import { getPosts } from "@/actions/post.action";
import { getDBUserId } from "@/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import WhotToFollow from "./WhotToFollow";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";

export default async function PostsList() {
  const user = await currentUser();
  const { posts } = await getPosts();
  const dbUserId = await getDBUserId();

  //   if (!posts || posts.length === 0) {
  //     return;
  //   }

  console.log({ posts });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10">
      <div className="lg:col-span-6">
        {user && <CreatePost />}
        <div className="space-y-6">
          {posts?.map(post => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId!} />
          ))}
        </div>
      </div>
      <div className="top-20 hidden lg:col-span-4 lg:block">
        <WhotToFollow />
      </div>
    </div>
  );
}
