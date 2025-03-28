"use client";

import Image from "next/image";
import { useState } from "react";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconMailFilled,
  IconPhoneFilled,
  IconUserFilled,
  IconEdit,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const ProfileScreen = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const user = session?.user;
  console.log("user", user);
  if (!user) {
    return (
      <div className="relative flex h-[90vh] w-[80vw] items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-red-500"></div>
      </div>
    );
  }
  return (
    <div className="m-8 h-full rounded-lg bg-white p-6 shadow-lg">
      {/* Header Image */}
      <div className="relative h-48 w-full overflow-hidden rounded-lg">
        <Image
          src={"/images/profile-header.png"}
          alt="Header"
          layout="fill"
          objectFit="cover"
          //   height={1000}
          //   width={1000}
        />
      </div>

      {/* Profile Image */}
      {/* <div className="relative flex justify-center -mt-16">
        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
          {user?.providerImageUrl ? (
            <Image
              src={user?.providerImageUrl}
              alt="Profile"
              width={144}
              height={144}
              className="rounded-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <IconUser size={80} className="text-gray-400" />
            </div>
          )}
        </div>
      </div> */}

      {/* Name & Role */}
      <div className="-mt-8 flex items-center gap-4 pl-5">
        {/* Profile Image / Icon */}
        <div className="relative flex items-end justify-end overflow-visible">
          <Image
            // src={user?.providerImageUrl??"/images/profile-icon.png"}
            src={"/images/profile-icon.png"}
            alt="Profile"
            width={120}
            height={120}
            // className="object-cover"
          />

          {/* Edit Icon */}
          <div className="absolute bottom-0 right-0 translate-x-[25%] translate-y-[25%] transform rounded-full bg-primary p-1.5 shadow-md">
            <IconEdit size={20} className="text-white" />
          </div>
        </div>

        {/* Name & Role */}
        <div>
          <h1 className="mt-1 text-xl font-bold capitalize">{user?.name}</h1>
          <p className="capitalize text-gray-500">
            {user?.role !== "UNDEFINED"
              ? user?.role === "WORKER"
                ? "CONTRACTOR"
                : user?.role
              : ""}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <h2 className="mb-2 ml-5 mt-4 text-sm font-semibold text-gray-500">
        Basic Information
      </h2>
      <div className="ml-5 rounded-xl bg-gray-100 p-4 shadow">
        {/* {user?.phoneNumber && ( */}
        <div className="mb-2 flex items-center gap-2">
          <IconPhoneFilled size={16} className="text-primary" />
          <span className="text-gray-700">0412345678</span>
        </div>
        {/* )} */}
        <div className="mb-2 flex items-center gap-2">
          <IconMailFilled size={16} className="text-primary" />
          <span className="text-gray-700">{user?.email}</span>
        </div>
      </div>

      {/* Edit Profile Button */}
      {/* <button
        className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-white shadow transition hover:bg-blue-700"
        onClick={() => router.push("/edit-profile")}
      >
        Edit Profile
      </button> */}

      {/* Gallery */}
      {/* <div className="mt-6">
        <h2 className="text-sm text-gray-500 font-semibold mb-2">Gallery</h2>
        <div className="flex flex-wrap gap-2 relative">
          {images.slice(0, 3).map((item) => (
            <Image
              key={item.id}
              src={item.url}
              alt="Gallery Image"
              width={100}
              height={100}
              className="shadow w-24 h-24 rounded-lg object-cover"
            />
          ))}
          {images.length > 4 && (
            <button
              onClick={() => router.push('/gallery')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full shadow"
            >
              →
            </button>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default ProfileScreen;
