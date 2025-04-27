"use client";

import {
  getNotifications,
  markNotificationsAsRead,
  NotificationsType,
} from "@/actions/notification.action";
import { NotificationsSkeleton } from "@/components/NotificationSkeleton";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return <HeartIcon className="size-4 text-red-500" />;
    case "COMMENT":
      return <MessageCircleIcon className="size-4 text-blue-500" />;
    case "FOLLOW":
      return <UserPlusIcon className="size-4 text-green-500" />;
    default:
      return null;
  }
};

type NotificationType = Awaited<ReturnType<typeof getNotifications>>[number];

export default function NotificationsPage() {
  const [notifications, setNotificattions] = useState<NotificationsType>([]);
  const [isLoading, setisLoading] = useState(false);

  useEffect(() => {
    // fetch notifications
    const fetchNotifications = async () => {
      try {
        setisLoading(true);
        const notifications = await getNotifications();
        setNotificattions(notifications);

        const unreadIds = notifications
          .filter((n: NotificationType) => !n.read)
          .map((n: NotificationType) => n.id);
        if (unreadIds.length > 0) {
          await markNotificationsAsRead(unreadIds);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Failed to fetch notifications");
      } finally {
        setisLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (isLoading) {
    return <NotificationsSkeleton />;
  }
  console.log({ notifications });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle>Notifications</CardTitle>
            <span className="text-muted-foreground text-sm">
              {notifications.filter(n => n.read === false).length} unread
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {notifications.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center">
                No notifications yet
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`hover:bg-muted/25 flex items-start gap-4 border-b p-4 transition-colors ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  {notification.creator.image && (
                    <Avatar className="size-8 sm:h-10 sm:w-10">
                      <AvatarImage
                        className="rounded-full"
                        src={notification.creator.image}
                      />
                    </Avatar>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span>
                        <span className="font-medium">
                          {notification.creator.name ??
                            notification.creator.username}
                        </span>{" "}
                        {notification.type === "FOLLOW"
                          ? "started following you"
                          : notification.type === "LIKE"
                            ? "liked your post"
                            : "commented on your post"}
                      </span>
                    </div>

                    {notification.post &&
                      (notification.type === "LIKE" ||
                        notification.type === "COMMENT") && (
                        <div className="space-y-2 pl-6">
                          <div className="text-muted-foreground bg-muted/30 mt-2 rounded-md p-2 text-sm">
                            <p>{notification.post.content}</p>
                            {notification.post.image && (
                              <Image
                                src={notification.post.image}
                                alt="Post content"
                                className="mt-2 h-auto w-full max-w-[200px] rounded-md object-cover"
                                width={200}
                                height={200}
                              />
                            )}
                          </div>

                          {notification.type === "COMMENT" &&
                            notification.comment && (
                              <div className="bg-accent/50 rounded-md p-2 text-sm">
                                {notification.comment.content}
                              </div>
                            )}
                        </div>
                      )}

                    <p className="text-muted-foreground pl-6 text-sm">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
