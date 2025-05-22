// Componente para el encabezado de los formularios de autenticación
export function HeadProfile({ titleHead, subtittleHead }) {
  return (
    <section className="header-icon-profile">
      <header id="section-header-profile">
        <figure className="circle-icon-profile">
          <img
            src="/assets/profileicon.svg"
            alt="Icono de perfil"
            className="profile-icon"
          />
        </figure>
        <h3 className="title-head">{titleHead}</h3>
        {subtittleHead && <p className="subtittle-head">{subtittleHead}</p>}
      </header>
    </section>
  );
}
