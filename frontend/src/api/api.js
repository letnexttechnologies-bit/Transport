const BASE_URL = "http://localhost:8080/api";

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (formData) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Registration failed"
      };
    }

    return {
      success: true,
      message: data.message || "Registration successful"
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
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data.message || "Login failed"
      };
    }

    return {
      success: true,
      token: data.token,
      user: {
        _id: data.user.id, // normalize id
        name: data.user.name,
        phone: data.user.phone,
        vehicleNumber: data.user.vehicleNumber,
        role: data.user.role
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
