import { useEffect } from 'react';

const Chatbot = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.voiceflow.com/widget-next/bundle.mjs';
    script.onload = () => {
      window.voiceflow.chat.load({
        verify: { projectID: '68586fbc210563ada9429c49' },
        url: 'https://general-runtime.voiceflow.com',
        versionID: 'production',
        voice: {
          url: "https://runtime-api.voiceflow.com"
        }
      });
    };
    document.body.appendChild(script);

    return () => {
      // Eliminar el script al desmontar el componente (limpieza)
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div id="chatbot-container">
      <h3>Chatbot Cargado</h3>
    </div>
  );
};

export default Chatbot;