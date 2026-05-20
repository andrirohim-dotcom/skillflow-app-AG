import AppInitializer from "@/components/AppInitializer";
import SourceDetailShell from "@/components/source-detail/SourceDetailShell";
import Link from "next/link";

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <AppInitializer />
      {/* Back navigation */}
      <div className="mb-5">
        <Link
          href="/dashboard/sources"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Semua Sumber Belajar
        </Link>
      </div>
      <SourceDetailShell sourceId={id} />
    </>
  );
}
