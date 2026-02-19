"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Pendaftaran gagal" };
    }

    return { success: true, user: data.user };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    return { error: `Koneksi ke server pendaftaran gagal: ${errorMessage}` };
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let data;

  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Email atau kata sandi salah" };
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    return { error: `Koneksi ke server login gagal: ${errorMessage}` };
  }

  // Store the token in a secure HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set("session_token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  // Store the full name for the dashboard
  if (data.user?.full_name) {
    cookieStore.set("user_name", data.user.full_name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  // Store the role for the dashboard
  if (data.user?.role) {
    cookieStore.set("user_role", data.user.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  cookieStore.delete("user_name");
  cookieStore.delete("user_role");
  redirect("/");
}

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const isAdmin = formData.get("is_admin") === "true";
  const role = formData.get("role") as string;

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        is_admin: isAdmin,
        role,
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Gagal membuat pengguna" };
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function createParameter(formData: FormData) {
  const param_type = formData.get("param_type") as string;
  const param_name = formData.get("param_name") as string;
  const param_code = (formData.get("param_code") as string) || param_type;
  const is_active = formData.get("is_active") === "true";

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/parameters`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        param_type,
        param_name,
        param_code,
        param_value: formData.get("param_value"),
        description: formData.get("description"),
        sort_order: formData.get("sort_order")
          ? parseInt(formData.get("sort_order") as string)
          : 0,
        is_active,
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Gagal membuat parameter" };
    }

    revalidatePath("/dashboard/master");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Create Parameter Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function updateUser(id: string, formData: FormData) {
  const email = formData.get("email") as string;
  const fullName = formData.get("full_name") as string;
  const isActive = formData.get("is_active") === "true";
  const isAdmin = formData.get("is_admin") === "true";
  const role = formData.get("role") as string;
  const password = formData.get("password") as string;

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        full_name: fullName,
        is_active: isActive,
        is_admin: isAdmin,
        role,
        ...(password ? { password } : {}),
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Gagal memperbarui pengguna" };
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function getParameters() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/parameters`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Gagal mengambil data parameter" };
    }

    return { success: true, data };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Fetch Parameters Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function updateParameter(id: string, formData: FormData) {
  const param_name = formData.get("param_name") as string;
  const is_active = formData.get("is_active") === "true";

  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/parameters/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        param_name,
        param_value: formData.get("param_value"),
        description: formData.get("description"),
        sort_order: formData.get("sort_order")
          ? parseInt(formData.get("sort_order") as string)
          : 0,
        is_active,
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Gagal memperbarui parameter" };
    }

    revalidatePath("/dashboard/master");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Update Parameter Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function deleteParameter(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/parameters/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Gagal menghapus parameter" };
    }

    revalidatePath("/dashboard/master");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Delete Parameter Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function createRegistration(data: Record<string, unknown>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resultText = await response.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = { message: resultText };
    }

    if (!response.ok) {
      return { error: result.message || "Gagal membuat pendaftaran operasi" };
    }

    revalidatePath("/dashboard/schedule");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Create Registration Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function getRegistrations(
  params: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  const { startDate, endDate, page, pageSize } = params;
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  if (page) queryParams.append("page", page.toString());
  if (pageSize) queryParams.append("pageSize", pageSize.toString());

  const url = `${apiUrl}/api/registrations${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return { error: data.message || "Gagal mengambil data pendaftaran" };
    }

    return { success: true, data };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Fetch Registrations Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function updateRegistration(
  id: string,
  data: Record<string, unknown>,
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/registrations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resultText = await response.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = { message: resultText };
    }

    if (!response.ok) {
      return {
        error: result.message || "Gagal memperbarui pendaftaran operasi",
      };
    }

    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Update Registration Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}

export async function deleteRegistration(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  try {
    const response = await fetch(`${apiUrl}/api/registrations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const resultText = await response.text();
    let result;
    try {
      result = JSON.parse(resultText);
    } catch {
      result = { message: resultText };
    }

    if (!response.ok) {
      return { error: result.message || "Gagal menghapus pendaftaran operasi" };
    }

    revalidatePath("/dashboard/schedule");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Delete Registration Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}
export async function getMonthlyReport(year: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  const url = `${apiUrl}/api/report/yearly-summary?year=${year}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Avoid caching for reports to ensure fresh data
      cache: "no-store",
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return {
        error: data.error || data.message || "Gagal mengambil data laporan",
      };
    }

    // Transform uppercase keys to lowercase for the widget
    if (Array.isArray(data)) {
      data = data.map(
        (item: { BULAN: string; ELEKTIF: number; CITO: number }) => ({
          bulan: item.BULAN,
          elektif: item.ELEKTIF,
          cito: item.CITO,
        }),
      );
    }

    return { success: true, data };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Fetch Monthly Report Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}
export async function getInsuranceReport(year: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  const url = `${apiUrl}/api/report/yearly-summary-penjamin?year=${year}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return {
        error:
          data.error || data.message || "Gagal mengambil data laporan penjamin",
      };
    }

    return { success: true, data };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Fetch Insurance Report Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}
export async function getPoliReport(year: string, poli: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const apiUrl = process.env.API_URL || "http://localhost:3002";

  const url = `${apiUrl}/api/report/yearly-summary-poli?year=${year}&poli=${encodeURIComponent(poli)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    if (!response.ok) {
      return {
        error:
          data.error || data.message || "Gagal mengambil data laporan poli",
      };
    }

    // Transform uppercase keys to lowercase for the widget
    if (Array.isArray(data)) {
      data = data.map(
        (item: {
          BULAN: string;
          ELEKTIF: number;
          CITO: number;
          JUMLAH: number;
        }) => ({
          bulan: item.BULAN,
          elektif: item.ELEKTIF,
          cito: item.CITO,
          jumlah: item.JUMLAH,
        }),
      );
    }

    return { success: true, data };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error tidak diketahui";
    console.error("Fetch Poli Report Error:", err);
    return { error: `Koneksi ke server API gagal: ${errorMessage}` };
  }
}
