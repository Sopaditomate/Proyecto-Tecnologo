import { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    const SCRIPT_ID = 'voiceflow-chatbot-script';
    const BUTTON_ID = 'voiceflow-chat-button';

    // Verificar si el script ya está agregado al documento
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
      script.id = SCRIPT_ID;
      script.onload = () => {
        // Solo cargar si el botón no está presente
        if (!document.getElementById(BUTTON_ID)) {
          window.voiceflow.chat.load({
            verify: { projectID: '68586fbc210563ada9429c49' },
            url: 'https://general-runtime.voiceflow.com',
            versionID: 'production',
            voice: {
              url: "https://runtime-api.voiceflow.com"
            }
          });
        }
      };
      document.body.appendChild(script);
    } else {
      // Si ya existe el script, solo carga el chatbot si no está el botón
      if (window.voiceflow && !document.getElementById(BUTTON_ID)) {
        window.voiceflow.chat.load({
          verify: { projectID: '68586fbc210563ada9429c49' },
          url: 'https://general-runtime.voiceflow.com',
          versionID: 'production',
          voice: {
            url: "https://runtime-api.voiceflow.com"
          }
        });
      }
    }

    // Limpieza: NO eliminamos el script si se reutiliza en otras páginas
    // return () => {
    //   const existingScript = document.getElementById(SCRIPT_ID);
    //   if (existingScript) {
    //     document.body.removeChild(existingScript);
    //   }
    // };
  }, []);

  return <div id="chatbot-container" />;
};

export default Chatbot;
