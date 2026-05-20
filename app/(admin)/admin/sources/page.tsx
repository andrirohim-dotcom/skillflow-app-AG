import { getAllMasterSourcesAdmin } from "@/lib/db/masterSources.admin";
import MasterSourcesClient from "@/components/admin/MasterSourcesClient";

export const dynamic = "force-dynamic";

export default async function AdminSourcesPage() {
  const sources = await getAllMasterSourcesAdmin();

  const publishedCount = sources.filter((s) => s.isPublished).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Master Sumber Belajar</h1>
          <p className="text-sm text-gray-400 mt-1">
            {sources.length} sumber dalam katalog &mdash; {publishedCount} published
          </p>
        </div>
      </div>

      <MasterSourcesClient initialSources={sources} />
    </div>
  );
}
