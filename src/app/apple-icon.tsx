import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/lib/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Icona per la schermata home di iOS: stesso marchio, più respiro. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: "#14130e",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandMarkDataUri()} alt="" width={112} height={112} />
        <div style={{ display: "flex", color: "#f6f4ef", fontSize: 15, letterSpacing: 6 }}>IANES</div>
      </div>
    ),
    size,
  );
}
