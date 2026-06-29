"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(_prev: unknown, formData: FormData) {
  const raw = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Invalid credentials format" };
  }

  const { username, password } = parsed.data;

  try {
    // The backend uses 'email' instead of username, so we map username -> email
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });

    const data = await res.json();
    
    if (!res.ok) {
      return { error: data.message || "Invalid username or password" };
    }

    // Extract cookie from Set-Cookie header sent by Express
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      const match = setCookie.match(/accessToken=([^;]+)/);
      if (match) {
        const cookieStore = await cookies();
        cookieStore.set("accessToken", match[1], {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 15 * 60, // 15 mins
        });
      }
    }
  } catch (err) {
    return { error: "Authentication failed. Backend unreachable." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    await fetch(`${apiUrl}/api/v1/auth/logout`, { method: 'POST' });
  } catch {}
  
  redirect("/login");
}

export async function changePasswordAction(
  _prev: unknown, 
  _formData: FormData
): Promise<{ error?: string; success?: boolean; message?: string }> {
  // The new Express backend API currently does not expose a change password route.
  // This is a stub to prevent build errors and notify the user gracefully.
  return { error: "Password changes are disabled in the new backend system. Please contact an administrator." };
}
