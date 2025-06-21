import * as Yup from "yup";

export const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email("Correo electrónico inválido")
    .matches(
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
      "Formato de correo inválido (debe contener un dominio válido, como .com, .es)"
    )
    .required("Correo electrónico requerido"),

  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("Contraseña requerida"),

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
  newPassword: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La nueva contraseña es requerida"),
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
