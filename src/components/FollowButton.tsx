"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { toogleFollow } from "@/actions/user.action";

export default function FollowButton({ userId }: { userId: string }) {
  const [isMounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [follow, setFollow] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const result = await toogleFollow(userId);
      if (result.success) {
        if (result.message === "Follow") {
          setFollow(true);
        } else {
          setFollow(false);
        }
        toast.success(result.message);
      }
    } catch (error) {
      console.log("Error while following user :", error);
      toast.error("Error while following user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      {isMounted && (
        <Button
          size="sm"
          variant={"secondary"}
          disabled={isLoading}
          onClick={handleFollow}
        >
          {follow ? "Unfollow" : "Follow"}
        </Button>
      )}
    </div>
  );
}
