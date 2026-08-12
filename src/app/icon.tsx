import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/lib/brand-mark";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Favicon: l'emblema del marchio, non un'immagine caricata a mano.
 * Generata con ImageResponse così resta allineata al logo del sito
 * e non serve manutenere un .ico binario.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14130e",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandMarkDataUri()} alt="" width={54} height={54} />
      </div>
    ),
    size,
  );
}
