require('ts-node').register({ transpileOnly: true });
const { getSourceProgress } = require('./lib/utils/sourceProgress.ts');

const source = {
    id: "bebdc217-a9b0-44a0-bab2-c23f675513df",
    title: "Prinsip ekonomi",
    creatorName: "Ferry Irwandi",
    url: "",
    topicTags: [
      "Perencanaan Keuangan"
    ],
    skillTargets: [
      "Financial Literacy"
    ],
    progress: {
      type: "book",
      totalPages: 261,
      currentPage: 17
    },
    status: "in_progress",
    difficultyLevel: "beginner",
    dailyPageTarget: null,
    targetCompletionDate: "2026-07-31",
    createdAt: "2026-05-04T10:01:37.417154+00:00",
    updatedAt: "2026-05-04T10:10:33.7+00:00",
    workspaceId: "4018cf86-7f69-410f-8215-c41895bf1037",
    visibility: "personal",
    createdBy: "266a051a-3846-4abe-b239-470850ddb4ac"
};

try {
  const stats = getSourceProgress(source);
  console.log('Stats:', stats);
  if (!stats) throw new Error("Stats undefined!");
  console.log("No error from getSourceProgress");
} catch (err) {
  console.error("Error:", err);
}
