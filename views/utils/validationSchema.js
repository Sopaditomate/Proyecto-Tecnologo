import * as Yup from "yup";

// Función para crear la validación de contraseña segura
const createPasswordValidation = () => {
  return Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(
      /^(?=.*[a-z])/,
      "La contraseña debe contener al menos una letra minúscula"
    )
    .matches(
      /^(?=.*[A-Z])/,
      "La contraseña debe contener al menos una letra mayúscula"
    )
    .matches(/^(?=.*\d)/, "La contraseña debe contener al menos un número")
    .matches(
      /^(?=.*[@$!%*?&])/,
      "La contraseña debe contener al menos un carácter especial (@$!%*?&)"
    )
    .required("Contraseña requerida");
};

export const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email("Correo electrónico inválido")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Formato de correo inválido (debe contener un dominio válido, como .com, .es)"
    )
    .required("Correo electrónico requerido"),

  password: createPasswordValidation(),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Las contraseñas no coinciden")
    .required("Confirmación de contraseña requerida"),

  nombres: Yup.string()
    .min(2, "Ingresa un nombre válido")
    .required("Nombre requerido"),

  apellidos: Yup.string()
    .min(2, "Ingresa un apellido válido")
    .required("Apellido requerido"),

  direccion: Yup.string(), // <--- opcional para agregar mas adelante
  telefono: Yup.string(), // <--- opcional para agregar mas adelante
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: createPasswordValidation(),

  confirm: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Las contraseñas no coinciden")
    .required("Debes confirmar la nueva contraseña"),
});

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Correo electrónico inválido")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Formato de correo inválido (debe contener un dominio válido, como .com, .es)"
    )
    .required("Correo electrónico requerido"),

  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es requerida"),
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(8, "La contraseña actual debe tener al menos 8 caracteres.")
    .required("La contraseña actual es requerida."),

  newPassword: createPasswordValidation().notOneOf(
    [Yup.ref("currentPassword"), null],
    "La nueva contraseña no puede ser igual a la actual."
  ),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Las contraseñas no coinciden.")
    .required("La confirmación de la nueva contraseña es requerida."),
});
