import { Metadata } from "next";
import VRViewer from "@/components/VRViewer";

type SearchParams = { id?: string; name?: string; [key: string]: string | string[] | undefined };

export async function generateMetadata(props: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const name = typeof searchParams.name === "string" ? searchParams.name : "Recorrido Virtual 360";
  const id = typeof searchParams.id === "string" ? searchParams.id : "test";

  // URL de la imagen (Open Graph)
  const imageUrl = `/temp/${id}.png`;

  return {
    title: `${name} | backESTUDIO`,
    description: "Explora este recorrido virtual inmersivo en 360 grados.",
    openGraph: {
      title: `${name} | backESTUDIO`,
      description: "Explora este recorrido virtual inmersivo en 360 grados.",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Vista 360 de ${name}`,
        },
      ],
      type: "website",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "backVR",
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export default async function TourPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const id = typeof searchParams.id === "string" ? searchParams.id : "test";
  const name = typeof searchParams.name === "string" ? searchParams.name : "Recorrido";

  // Hardcoded fallback a /temp/test.png si no hay ID o falla
  const initialUrl = `/temp/${id}.png`;

  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <VRViewer mode="player" initialSceneUrl={initialUrl} sceneName={name} />
    </main>
  );
}
