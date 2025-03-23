"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type Message = "Follow" | "Unfollow";

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!user || !userId) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      console.log("existingUser : ", existingUser);
      return existingUser;
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],

        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    console.log("syncUser succes synchorinze user");

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser : ", error);
  }
}

export async function getUserByClerkId(cleckId: string) {
  const user = await prisma.user.findUnique({
    where: {
      clerkId: cleckId,
    },

    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) return;

  return user;
}

export async function getDBUserId() {
  const { userId: cleckUserId } = await auth();
  if (!cleckUserId) return null;

  const user = await getUserByClerkId(cleckUserId);
  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRecommandedUsers() {
  const userId = await getDBUserId();

  if (!userId) return [];

  //get 3 ramdom users exlude ourselves and user we already follow
  const randomUsers = await prisma.user.findMany({
    where: {
      AND: [
        { NOT: { id: userId } },
        {
          NOT: {
            followers: {
              some: {
                followerId: userId,
              },
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      _count: {
        select: {
          followers: true,
        },
      },
    },
    take: 3,
  });

  return randomUsers;
}

export async function toogleFollow(targetUserId: string) {
  const dbUserId = await getDBUserId();

  if (!dbUserId) {
    throw new Error("User not found");
  }

  if (targetUserId === dbUserId) {
    throw new Error("You can't follow yourself");
  }

  let message: Message;
  const existingFollowing = await prisma.follows.findUnique({
    where: {
      followerId_followingId: {
        followerId: dbUserId,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollowing) {
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: dbUserId,
          followingId: targetUserId,
        },
      },
    });

    message = "Unfollow";
    console.log("User unfollowed successfully");
  } else {
    await prisma.$transaction([
      prisma.follows.create({
        data: {
          followerId: dbUserId,
          followingId: targetUserId,
        },
      }),
      prisma.notification.create({
        data: {
          type: "FOLLOW",
          userId: targetUserId, //user being followed
          creatorId: dbUserId, // user who follow
        },
      }),
    ]);
    message = "Follow";
    console.log("User followed successfully");
  }
  revalidatePath("/"); //purge the cache for the home page
  return { success: true, message };
}
