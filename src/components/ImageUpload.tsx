"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative size-40">
        <Image
          src={value}
          alt="Upload"
          className="size-40 rounded-md object-cover"
          width={160}
          height={160}
        />
        <button
          onClick={() => onChange("")}
          className="absolute top-0 right-0 rounded-full bg-red-500 p-1 shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }
  return (
    <div>
      <UploadDropzone
        endpoint={endpoint}
        className="h-[300px]"
        onClientUploadComplete={res => {
          onChange(res?.[0].ufsUrl);
        }}
        onUploadError={(error: Error) => {
          console.log(error);
        }}
      />
    </div>
  );
}
export default ImageUpload;
