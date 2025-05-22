import * as Yup from "yup";

export const registerSchema = Yup.object().shape({
  email: Yup.string()
    .email("Correo electrónico inválido")
    .required("Correo electrónico requerido"),
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
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
  direccion: Yup.string().required("Dirección requerida"),
  telefono: Yup.string()
    .matches(/^\d+$/, "Ingresa solo números")
    .required("Teléfono requerido"),
});
