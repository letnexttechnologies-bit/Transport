const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL = `${BASE_URL}/api`;

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (formData) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // IMPORTANT
      body: JSON.stringify(formData)
    });

    const contentType = res.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await res.json()
        : null;

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Registration failed"
      };
    }

    return {
      success: true,
      message: data?.message || "Registration successful"
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: "Network error. Please try again."
    };
  }
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (formData) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // IMPORTANT
      body: JSON.stringify(formData)
    });

    const contentType = res.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await res.json()
        : null;

    if (!res.ok) {
      return {
        success: false,
        message: data?.message || "Login failed"
      };
    }

    return {
      success: true,
      token: data?.token,
      user: {
        _id: data?.user?.id,
        name: data?.user?.name,
        phone: data?.user?.phone,
        vehicleNumber: data?.user?.vehicleNumber,
        role: data?.user?.role
      }
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Network error. Please try again."
    };
  }
};

/* =========================
   USER NOTIFICATIONS
========================= */
export const getUserNotifications = async (userId) => {
  try {
    const res = await fetch(`${API_URL}/notifications/${userId}`, {
      credentials: "include"
    });

    return await res.json();
  } catch (error) {
    console.error("User notifications error:", error);
    return [];
  }
};

/* =========================
   ADMIN NOTIFICATIONS
========================= */
export const getAdminNotifications = async () => {
  try {
    const res = await fetch(`${API_URL}/admin-notifications`, {
      credentials: "include"
    });

    return await res.json();
  } catch (error) {
    console.error("Admin notifications error:", error);
    return [];
  }
};
