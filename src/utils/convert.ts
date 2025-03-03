/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

export async function Convert(image: File): Promise<string> {
  try {
    if (typeof window !== "undefined") {
      const buffer = await image.arrayBuffer();
      const blob = new Blob([buffer], { type: image.type });
      const heic2any = (await import("heic2any")).default;
      const conversionResult = await heic2any({
        blob,
        toType: "image/jpeg",
        quality: 1,
      });
      const url = URL.createObjectURL(conversionResult as Blob | MediaSource);
      return url;
    } else {
      console.log("Window is not defined");
      return URL.createObjectURL(image);
    }
  } catch (error) {
    console.error("Error converting image:", error);
    return URL.createObjectURL(image);
  }
}
