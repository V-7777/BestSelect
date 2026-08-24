import Strategie from "@/components/strategie/Strategie";

export default function StrategiePage() {
  return (
    <>
      <Strategie />
      <noscript>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: 16,
            color: "#F7EFE9",
            textAlign: "center",
          }}
        >
          Diese Präsentation benötigt JavaScript.
        </div>
      </noscript>
    </>
  );
}
