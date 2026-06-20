"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidBgColor, BG_COLOR_DEFAULT, BG_COLOR_COOKIE, type BgColorValue } from "./bg-color-constants";

export async function setBgColor(color: BgColorValue) {
  const store = await cookies();
  store.set(BG_COLOR_COOKIE, color, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}

export async function getBgColor(): Promise<BgColorValue> {
  const store = await cookies();
  const v = store.get(BG_COLOR_COOKIE)?.value;
  if (isValidBgColor(v)) return v;
  return BG_COLOR_DEFAULT;
}
