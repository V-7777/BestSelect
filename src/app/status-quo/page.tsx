import StatusQuo from "@/components/status-quo/StatusQuo";

export default function StatusQuoPage() {
  return (
    <>
      <StatusQuo />
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
