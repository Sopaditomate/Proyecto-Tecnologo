import { useState, useEffect } from "react";
import { RegisterWizard } from "./RegisterWizard.jsx";

export function RegisterPage() {
  const [step, setStep] = useState(-1);

  useEffect(() => {
    document.body.classList.add("register-body");
    return () => {
      document.body.classList.remove("register-body");
    };
  }, []);

  return (
    <section
      id="section-login"
      className={`register-page ${step !== -1 ? "in-step" : ""}`}
      style={{ minHeight: step !== -1 ? "auto" : "600px" }}
    >
      <RegisterWizard onStepChange={setStep} />
    </section>
  );
}
