// Controlador para la autenticación y validación de formularios

// Validación de email usando expresión regular
export const validateEmail = (email) => {
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regexEmail.test(email);
};

// Validación de contraseña con requisitos específicos
export const validatePassword = (password) => {
  // Verifica requisitos de seguridad
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);

  // Lista de requisitos con su estado
  const requirements = [
    {
      text: "Debe tener al menos una letra mayúscula",
      valid: hasUpperCase,
    },
    {
      text: "Debe tener ocho caracteres o más",
      valid: hasLength,
    },
    {
      text: "Debe tener al menos un número",
      valid: hasNumber,
    },
  ];

  const isValid = requirements.every((req) => req.valid);

  return {
    isValid,
    requirements,
    text: isValid ? "" : "La contraseña no cumple con los requisitos",
  };
};

// Validación de nombre
export const validateName = (value) => {
  const invalidRegex = /[^A-Za-z]/;
  if (value.length > 3 && !invalidRegex.test(value)) {
    return "green";
  } else if (value.length > 0) {
    return "red";
  } else {
    return "black";
  }
};

// Validación de teléfono (10 dígitos)
export const validatePhone = (phone) => {
  const telRegex = /^\d{10}$/;
  return telRegex.test(phone) && phone.length === 10;
};

// Validación de dirección
export const validateAddress = (address) => {
  const addressRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]+$/;
  return addressRegex.test(address);
};

// Verifica si las contraseñas coinciden
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Función simulada de inicio de sesión
export const loginUser = (email, password) => {
  // En una app real, esto conectaría con un backend
  if (validateEmail(email) && password.length >= 8) {
    return { success: true };
  }
  return { success: false, error: "Credenciales inválidas" };
};

// Función simulada de registro
export const registerUser = (userData) => {
  // En una app real, esto haría una llamada API
  return { success: true };
};
