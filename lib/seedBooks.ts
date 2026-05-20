// Extended seed data — 50 buku lintas topik.
// Gated by "skillflow:seeded_books_v1" agar independent dari seed awal
// dan tetap masuk untuk user yang sudah punya data existing.

import type { LearningSource, SkillProgress } from "./types";
import { generateActionPlan } from "./utils/actionPlanGenerator";
import { saveSource, saveSkillProgress } from "./storage";

const BOOKS_SEED_KEY = "skillflow:seeded_books_v1";

// ─── Helper ───────────────────────────────────────────────────────────────────

interface CreateBookInput {
  n: number;
  title: string;
  creatorName: string;
  topicTags: string[];
  skillTargets: string[];
  difficultyLevel: LearningSource["difficultyLevel"];
  totalPages: number;
  currentPage?: number;
  status?: LearningSource["status"];
  createdAt?: string;
}

function createBook({
  n,
  title,
  creatorName,
  topicTags,
  skillTargets,
  difficultyLevel,
  totalPages,
  currentPage = 0,
  status = "not_started",
  createdAt = "2025-01-01T08:00:00.000Z",
}: CreateBookInput): LearningSource {
  return {
    id: `seed-book-${n}`,
    title,
    creatorName,
    url: "",
    topicTags,
    skillTargets,
    status,
    difficultyLevel,
    progress: { type: "book", totalPages, currentPage },
    createdAt,
    updatedAt: createdAt,
  };
}

// ─── 50 Buku ──────────────────────────────────────────────────────────────────

const SEED_BOOKS: LearningSource[] = [
  // ── Produktivitas & Kebiasaan ──
  createBook({
    n: 1,
    title: "Getting Things Done",
    creatorName: "David Allen",
    topicTags: ["produktivitas", "organisasi", "manajemen tugas"],
    skillTargets: ["Manajemen Tugas", "Kebiasaan Produktif"],
    difficultyLevel: "beginner",
    totalPages: 267,
    status: "in_progress",
    currentPage: 80,
    createdAt: "2025-02-01T08:00:00.000Z",
  }),
  createBook({
    n: 2,
    title: "Essentialism: The Disciplined Pursuit of Less",
    creatorName: "Greg McKeown",
    topicTags: ["fokus", "prioritas", "produktivitas"],
    skillTargets: ["Fokus Mendalam", "Manajemen Prioritas"],
    difficultyLevel: "beginner",
    totalPages: 260,
    createdAt: "2025-01-15T08:00:00.000Z",
  }),
  createBook({
    n: 3,
    title: "The One Thing",
    creatorName: "Gary Keller & Jay Papasan",
    topicTags: ["fokus", "produktivitas", "tujuan"],
    skillTargets: ["Fokus Mendalam", "Manajemen Waktu"],
    difficultyLevel: "beginner",
    totalPages: 240,
    createdAt: "2025-01-20T08:00:00.000Z",
  }),
  createBook({
    n: 4,
    title: "The 4-Hour Workweek",
    creatorName: "Tim Ferriss",
    topicTags: ["produktivitas", "otomasi", "lifestyle design"],
    skillTargets: ["Manajemen Waktu", "Kebiasaan Produktif"],
    difficultyLevel: "intermediate",
    totalPages: 396,
    createdAt: "2025-02-10T08:00:00.000Z",
  }),
  createBook({
    n: 5,
    title: "The Miracle Morning",
    creatorName: "Hal Elrod",
    topicTags: ["rutinitas pagi", "kebiasaan", "mindset"],
    skillTargets: ["Manajemen Kebiasaan", "Mindset Pertumbuhan"],
    difficultyLevel: "beginner",
    totalPages: 220,
    status: "completed",
    currentPage: 220,
    createdAt: "2024-11-01T08:00:00.000Z",
  }),

  // ── Psikologi & Perilaku ──
  createBook({
    n: 6,
    title: "Thinking, Fast and Slow",
    creatorName: "Daniel Kahneman",
    topicTags: ["psikologi", "kognitif", "pengambilan keputusan"],
    skillTargets: ["Psikologi Perilaku", "Pengambilan Keputusan"],
    difficultyLevel: "advanced",
    totalPages: 499,
    status: "in_progress",
    currentPage: 150,
    createdAt: "2025-01-05T08:00:00.000Z",
  }),
  createBook({
    n: 7,
    title: "Influence: The Psychology of Persuasion",
    creatorName: "Robert B. Cialdini",
    topicTags: ["persuasi", "psikologi", "marketing"],
    skillTargets: ["Psikologi Perilaku", "Komunikasi Persuasif"],
    difficultyLevel: "intermediate",
    totalPages: 336,
    createdAt: "2025-02-15T08:00:00.000Z",
  }),
  createBook({
    n: 8,
    title: "Predictably Irrational",
    creatorName: "Dan Ariely",
    topicTags: ["ekonomi perilaku", "psikologi", "pengambilan keputusan"],
    skillTargets: ["Ekonomi Perilaku", "Pengambilan Keputusan"],
    difficultyLevel: "intermediate",
    totalPages: 304,
    createdAt: "2025-03-01T08:00:00.000Z",
  }),
  createBook({
    n: 9,
    title: "Mindset: The New Psychology of Success",
    creatorName: "Carol S. Dweck",
    topicTags: ["mindset", "psikologi", "pengembangan diri"],
    skillTargets: ["Mindset Pertumbuhan", "Belajar Adaptif"],
    difficultyLevel: "beginner",
    totalPages: 320,
    status: "completed",
    currentPage: 320,
    createdAt: "2024-10-01T08:00:00.000Z",
  }),
  createBook({
    n: 10,
    title: "Grit: The Power of Passion and Perseverance",
    creatorName: "Angela Duckworth",
    topicTags: ["ketekunan", "motivasi", "psikologi"],
    skillTargets: ["Konsistensi", "Mindset Pertumbuhan"],
    difficultyLevel: "beginner",
    totalPages: 352,
    createdAt: "2025-03-10T08:00:00.000Z",
  }),

  // ── Bisnis & Kewirausahaan ──
  createBook({
    n: 11,
    title: "Zero to One",
    creatorName: "Peter Thiel & Blake Masters",
    topicTags: ["startup", "inovasi", "bisnis"],
    skillTargets: ["Kewirausahaan", "Inovasi Produk"],
    difficultyLevel: "intermediate",
    totalPages: 224,
    status: "in_progress",
    currentPage: 100,
    createdAt: "2025-01-25T08:00:00.000Z",
  }),
  createBook({
    n: 12,
    title: "The Lean Startup",
    creatorName: "Eric Ries",
    topicTags: ["startup", "agile", "produk"],
    skillTargets: ["Manajemen Produk", "Strategi Bisnis"],
    difficultyLevel: "intermediate",
    totalPages: 336,
    createdAt: "2025-02-20T08:00:00.000Z",
  }),
  createBook({
    n: 13,
    title: "Good to Great",
    creatorName: "Jim Collins",
    topicTags: ["kepemimpinan", "bisnis", "organisasi"],
    skillTargets: ["Leadership", "Manajemen Organisasi"],
    difficultyLevel: "intermediate",
    totalPages: 320,
    createdAt: "2025-01-10T08:00:00.000Z",
  }),
  createBook({
    n: 14,
    title: "The Hard Thing About Hard Things",
    creatorName: "Ben Horowitz",
    topicTags: ["startup", "kepemimpinan", "manajemen"],
    skillTargets: ["Leadership", "Manajemen Tim"],
    difficultyLevel: "advanced",
    totalPages: 304,
    createdAt: "2025-03-05T08:00:00.000Z",
  }),
  createBook({
    n: 15,
    title: "Blue Ocean Strategy",
    creatorName: "W. Chan Kim & Renée Mauborgne",
    topicTags: ["strategi", "bisnis", "inovasi"],
    skillTargets: ["Strategi Bisnis", "Inovasi Produk"],
    difficultyLevel: "advanced",
    totalPages: 256,
    createdAt: "2025-02-05T08:00:00.000Z",
  }),
  createBook({
    n: 16,
    title: "The Innovator's Dilemma",
    creatorName: "Clayton M. Christensen",
    topicTags: ["inovasi", "teknologi", "bisnis"],
    skillTargets: ["Inovasi Produk", "Strategi Bisnis"],
    difficultyLevel: "advanced",
    totalPages: 286,
    createdAt: "2025-03-20T08:00:00.000Z",
  }),
  createBook({
    n: 17,
    title: "Crossing the Chasm",
    creatorName: "Geoffrey A. Moore",
    topicTags: ["startup", "marketing", "teknologi"],
    skillTargets: ["Strategi Bisnis", "Pemasaran Produk"],
    difficultyLevel: "advanced",
    totalPages: 256,
    createdAt: "2025-04-01T08:00:00.000Z",
  }),
  createBook({
    n: 18,
    title: "Hooked: How to Build Habit-Forming Products",
    creatorName: "Nir Eyal",
    topicTags: ["product design", "psikologi", "ux"],
    skillTargets: ["Desain Produk", "Psikologi Perilaku"],
    difficultyLevel: "intermediate",
    totalPages: 256,
    createdAt: "2025-02-28T08:00:00.000Z",
  }),

  // ── Pemrograman & Teknologi ──
  createBook({
    n: 19,
    title: "Clean Code",
    creatorName: "Robert C. Martin",
    topicTags: ["pemrograman", "software engineering", "kode bersih"],
    skillTargets: ["Clean Code", "Software Engineering"],
    difficultyLevel: "intermediate",
    totalPages: 431,
    status: "in_progress",
    currentPage: 200,
    createdAt: "2025-01-08T08:00:00.000Z",
  }),
  createBook({
    n: 20,
    title: "Design Patterns: Elements of Reusable Object-Oriented Software",
    creatorName: "Gang of Four",
    topicTags: ["pemrograman", "desain pola", "OOP"],
    skillTargets: ["Software Engineering", "Arsitektur Sistem"],
    difficultyLevel: "advanced",
    totalPages: 395,
    createdAt: "2025-03-15T08:00:00.000Z",
  }),
  createBook({
    n: 21,
    title: "Refactoring: Improving the Design of Existing Code",
    creatorName: "Martin Fowler",
    topicTags: ["pemrograman", "refactoring", "software engineering"],
    skillTargets: ["Clean Code", "Software Engineering"],
    difficultyLevel: "advanced",
    totalPages: 448,
    createdAt: "2025-04-05T08:00:00.000Z",
  }),
  createBook({
    n: 22,
    title: "The Mythical Man-Month",
    creatorName: "Fred Brooks",
    topicTags: ["software engineering", "manajemen proyek", "pemrograman"],
    skillTargets: ["Manajemen Proyek", "Software Engineering"],
    difficultyLevel: "advanced",
    totalPages: 322,
    createdAt: "2025-04-10T08:00:00.000Z",
  }),
  createBook({
    n: 23,
    title: "A Philosophy of Software Design",
    creatorName: "John Ousterhout",
    topicTags: ["software design", "pemrograman", "kompleksitas"],
    skillTargets: ["Arsitektur Sistem", "Software Engineering"],
    difficultyLevel: "advanced",
    totalPages: 190,
    createdAt: "2025-03-25T08:00:00.000Z",
  }),
  createBook({
    n: 24,
    title: "JavaScript: The Good Parts",
    creatorName: "Douglas Crockford",
    topicTags: ["javascript", "pemrograman web", "frontend"],
    skillTargets: ["Pemrograman JavaScript", "Frontend Development"],
    difficultyLevel: "intermediate",
    totalPages: 172,
    createdAt: "2025-02-12T08:00:00.000Z",
  }),
  createBook({
    n: 25,
    title: "Designing Data-Intensive Applications",
    creatorName: "Martin Kleppmann",
    topicTags: ["database", "sistem terdistribusi", "software engineering"],
    skillTargets: ["Arsitektur Sistem", "Database Engineering"],
    difficultyLevel: "advanced",
    totalPages: 616,
    createdAt: "2025-04-08T08:00:00.000Z",
  }),

  // ── Kepemimpinan & Manajemen ──
  createBook({
    n: 26,
    title: "Leaders Eat Last",
    creatorName: "Simon Sinek",
    topicTags: ["kepemimpinan", "tim", "budaya organisasi"],
    skillTargets: ["Leadership", "Membangun Tim"],
    difficultyLevel: "beginner",
    totalPages: 368,
    createdAt: "2025-01-30T08:00:00.000Z",
  }),
  createBook({
    n: 27,
    title: "High Output Management",
    creatorName: "Andrew S. Grove",
    topicTags: ["manajemen", "kepemimpinan", "produktivitas"],
    skillTargets: ["Manajemen Tim", "Leadership"],
    difficultyLevel: "intermediate",
    totalPages: 272,
    createdAt: "2025-02-18T08:00:00.000Z",
  }),
  createBook({
    n: 28,
    title: "Radical Candor",
    creatorName: "Kim Scott",
    topicTags: ["manajemen", "feedback", "kepemimpinan"],
    skillTargets: ["Manajemen Tim", "Komunikasi Efektif"],
    difficultyLevel: "intermediate",
    totalPages: 272,
    createdAt: "2025-03-08T08:00:00.000Z",
  }),
  createBook({
    n: 29,
    title: "Drive: The Surprising Truth About What Motivates Us",
    creatorName: "Daniel H. Pink",
    topicTags: ["motivasi", "kepemimpinan", "psikologi kerja"],
    skillTargets: ["Leadership", "Motivasi Tim"],
    difficultyLevel: "beginner",
    totalPages: 272,
    createdAt: "2025-01-22T08:00:00.000Z",
  }),
  createBook({
    n: 30,
    title: "The Manager's Path",
    creatorName: "Camille Fournier",
    topicTags: ["manajemen engineering", "kepemimpinan teknis", "karir"],
    skillTargets: ["Manajemen Tim", "Leadership"],
    difficultyLevel: "intermediate",
    totalPages: 256,
    createdAt: "2025-04-02T08:00:00.000Z",
  }),

  // ── Keuangan & Investasi ──
  createBook({
    n: 31,
    title: "Rich Dad Poor Dad",
    creatorName: "Robert T. Kiyosaki",
    topicTags: ["keuangan", "investasi", "mindset uang"],
    skillTargets: ["Literasi Keuangan", "Investasi"],
    difficultyLevel: "beginner",
    totalPages: 336,
    createdAt: "2025-01-12T08:00:00.000Z",
  }),
  createBook({
    n: 32,
    title: "The Intelligent Investor",
    creatorName: "Benjamin Graham",
    topicTags: ["investasi", "saham", "value investing"],
    skillTargets: ["Investasi", "Analisis Keuangan"],
    difficultyLevel: "advanced",
    totalPages: 640,
    createdAt: "2025-02-22T08:00:00.000Z",
  }),
  createBook({
    n: 33,
    title: "The Psychology of Money",
    creatorName: "Morgan Housel",
    topicTags: ["keuangan", "psikologi", "investasi"],
    skillTargets: ["Literasi Keuangan", "Psikologi Perilaku"],
    difficultyLevel: "beginner",
    totalPages: 256,
    status: "in_progress",
    currentPage: 130,
    createdAt: "2025-01-18T08:00:00.000Z",
  }),
  createBook({
    n: 34,
    title: "I Will Teach You to Be Rich",
    creatorName: "Ramit Sethi",
    topicTags: ["keuangan pribadi", "investasi", "otomasi keuangan"],
    skillTargets: ["Perencanaan Keuangan", "Investasi"],
    difficultyLevel: "beginner",
    totalPages: 352,
    createdAt: "2025-03-12T08:00:00.000Z",
  }),
  createBook({
    n: 35,
    title: "A Random Walk Down Wall Street",
    creatorName: "Burton G. Malkiel",
    topicTags: ["pasar modal", "investasi", "indeks fund"],
    skillTargets: ["Investasi", "Analisis Keuangan"],
    difficultyLevel: "advanced",
    totalPages: 496,
    createdAt: "2025-04-07T08:00:00.000Z",
  }),

  // ── Komunikasi & Menulis ──
  createBook({
    n: 36,
    title: "How to Win Friends and Influence People",
    creatorName: "Dale Carnegie",
    topicTags: ["komunikasi", "interpersonal", "pengaruh"],
    skillTargets: ["Komunikasi Persuasif", "Kecerdasan Sosial"],
    difficultyLevel: "beginner",
    totalPages: 288,
    createdAt: "2025-01-03T08:00:00.000Z",
  }),
  createBook({
    n: 37,
    title: "Crucial Conversations",
    creatorName: "Kerry Patterson et al.",
    topicTags: ["komunikasi", "konflik", "negosiasi"],
    skillTargets: ["Komunikasi Efektif", "Manajemen Konflik"],
    difficultyLevel: "intermediate",
    totalPages: 272,
    createdAt: "2025-02-08T08:00:00.000Z",
  }),
  createBook({
    n: 38,
    title: "Never Split the Difference",
    creatorName: "Chris Voss",
    topicTags: ["negosiasi", "komunikasi", "persuasi"],
    skillTargets: ["Negosiasi", "Komunikasi Persuasif"],
    difficultyLevel: "intermediate",
    totalPages: 288,
    status: "in_progress",
    currentPage: 90,
    createdAt: "2025-02-25T08:00:00.000Z",
  }),
  createBook({
    n: 39,
    title: "On Writing Well",
    creatorName: "William Zinsser",
    topicTags: ["menulis", "komunikasi", "non-fiksi"],
    skillTargets: ["Menulis Non-Fiksi", "Komunikasi Tertulis"],
    difficultyLevel: "beginner",
    totalPages: 321,
    createdAt: "2025-03-18T08:00:00.000Z",
  }),
  createBook({
    n: 40,
    title: "Talk Like TED",
    creatorName: "Carmine Gallo",
    topicTags: ["public speaking", "presentasi", "komunikasi"],
    skillTargets: ["Public Speaking", "Presentasi"],
    difficultyLevel: "beginner",
    totalPages: 272,
    createdAt: "2025-01-28T08:00:00.000Z",
  }),

  // ── Kreativitas & Inovasi ──
  createBook({
    n: 41,
    title: "Steal Like an Artist",
    creatorName: "Austin Kleon",
    topicTags: ["kreativitas", "seni", "inspirasi"],
    skillTargets: ["Kreativitas", "Pengembangan Ide"],
    difficultyLevel: "beginner",
    totalPages: 160,
    createdAt: "2025-01-07T08:00:00.000Z",
  }),
  createBook({
    n: 42,
    title: "The War of Art",
    creatorName: "Steven Pressfield",
    topicTags: ["kreativitas", "disiplin", "menulis"],
    skillTargets: ["Kreativitas", "Disiplin Berkarya"],
    difficultyLevel: "beginner",
    totalPages: 192,
    createdAt: "2025-02-03T08:00:00.000Z",
  }),
  createBook({
    n: 43,
    title: "Creative Confidence",
    creatorName: "Tom Kelley & David Kelley",
    topicTags: ["kreativitas", "design thinking", "inovasi"],
    skillTargets: ["Design Thinking", "Inovasi"],
    difficultyLevel: "beginner",
    totalPages: 288,
    createdAt: "2025-03-02T08:00:00.000Z",
  }),
  createBook({
    n: 44,
    title: "Big Magic: Creative Living Beyond Fear",
    creatorName: "Elizabeth Gilbert",
    topicTags: ["kreativitas", "inspirasi", "keberanian berkarya"],
    skillTargets: ["Kreativitas", "Mindset Pertumbuhan"],
    difficultyLevel: "beginner",
    totalPages: 288,
    createdAt: "2025-03-22T08:00:00.000Z",
  }),

  // ── Kesehatan & Sains ──
  createBook({
    n: 45,
    title: "Why We Sleep",
    creatorName: "Matthew Walker",
    topicTags: ["tidur", "kesehatan", "sains otak"],
    skillTargets: ["Manajemen Energi", "Kesehatan Optimal"],
    difficultyLevel: "intermediate",
    totalPages: 368,
    createdAt: "2025-01-14T08:00:00.000Z",
  }),
  createBook({
    n: 46,
    title: "Lifespan: Why We Age — and Why We Don't Have To",
    creatorName: "David A. Sinclair",
    topicTags: ["longevitas", "biologi", "kesehatan"],
    skillTargets: ["Kesehatan Optimal", "Sains Biologi"],
    difficultyLevel: "advanced",
    totalPages: 432,
    createdAt: "2025-04-04T08:00:00.000Z",
  }),

  // ── Filsafat & Pengembangan Diri ──
  createBook({
    n: 47,
    title: "Meditations",
    creatorName: "Marcus Aurelius",
    topicTags: ["filsafat", "stoikisme", "pengembangan diri"],
    skillTargets: ["Stoikisme", "Ketahanan Mental"],
    difficultyLevel: "beginner",
    totalPages: 254,
    createdAt: "2025-01-01T08:00:00.000Z",
  }),
  createBook({
    n: 48,
    title: "Man's Search for Meaning",
    creatorName: "Viktor E. Frankl",
    topicTags: ["filsafat", "makna hidup", "psikologi"],
    skillTargets: ["Ketahanan Mental", "Mindset Pertumbuhan"],
    difficultyLevel: "beginner",
    totalPages: 165,
    createdAt: "2024-12-01T08:00:00.000Z",
  }),
  createBook({
    n: 49,
    title: "The Obstacle Is the Way",
    creatorName: "Ryan Holiday",
    topicTags: ["stoikisme", "ketahanan", "pengembangan diri"],
    skillTargets: ["Stoikisme", "Ketahanan Mental"],
    difficultyLevel: "beginner",
    totalPages: 224,
    createdAt: "2025-02-16T08:00:00.000Z",
  }),
  createBook({
    n: 50,
    title: "Thinking in Systems: A Primer",
    creatorName: "Donella H. Meadows",
    topicTags: ["sistem thinking", "kompleksitas", "problem solving"],
    skillTargets: ["Systems Thinking", "Problem Solving"],
    difficultyLevel: "intermediate",
    totalPages: 236,
    createdAt: "2025-04-12T08:00:00.000Z",
  }),
];

// ─── Initializer ──────────────────────────────────────────────────────────────

export function initializeBookSeedData(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(BOOKS_SEED_KEY) === "true") return;

  SEED_BOOKS.forEach((source) => {
    saveSource(source);

    source.skillTargets.forEach((skillName, idx) => {
      const sp: SkillProgress = {
        id: `seed-sp-${source.id}-${idx}`,
        sourceId: source.id,
        skillName,
        category: "general",
        actionItems: generateActionPlan(skillName).map((text, pi) => ({
          id: `seed-ai-${source.id}-${idx}-${pi}`,
          skillProgressId: `seed-sp-${source.id}-${idx}`,
          text,
          completed: false,
        })),
        createdAt: source.createdAt,
      };
      saveSkillProgress(sp);
    });
  });

  localStorage.setItem(BOOKS_SEED_KEY, "true");
}

// ─── Seed V2 — 22 curated books (1–22) with specific action items ─────────────

const BOOKS_SEED_V2_KEY = "skillflow:seeded_books_v2";

interface BookV2Data {
  n: number;
  title: string;
  creatorName: string;
  topicTags: string[];
  skillTargets: string[];
  difficultyLevel: LearningSource["difficultyLevel"];
  totalPages: number;
  isbn: string;
  actions: string[]; // 5 specific action items (applied to first SkillProgress)
}

function createBookV2(data: BookV2Data): LearningSource {
  return {
    id: `seed-book-v2-${data.n}`,
    title: data.title,
    creatorName: data.creatorName,
    url: `https://covers.openlibrary.org/b/isbn/${data.isbn}-L.jpg`,
    topicTags: data.topicTags,
    skillTargets: data.skillTargets,
    status: "not_started",
    difficultyLevel: data.difficultyLevel,
    progress: { type: "book", totalPages: data.totalPages, currentPage: 0 },
    createdAt: "2025-01-01T08:00:00.000Z",
    updatedAt: "2025-01-01T08:00:00.000Z",
  };
}

const SEED_BOOKS_V2_DATA: BookV2Data[] = [
  {
    n: 1,
    title: "Leaders Eat Last",
    creatorName: "Simon Sinek",
    totalPages: 256,
    difficultyLevel: "advanced",
    isbn: "1591845327",
    skillTargets: ["Kepemimpinan Berbasis Nilai", "Manajemen Tim", "Motivasi & Engagement"],
    topicTags: ["leadership", "manajemen", "budaya", "organisasi"],
    actions: [
      "Identifikasi 1 anggota tim yang merasa tidak aman dan cari tahu alasannya",
      'Buat "circle of safety" dalam timmu minggu ini',
      "Kurangi 1 kebijakan yang menciptakan rasa takut",
      "Jadwalkan 1:1 dengan anggota tim paling junior",
      "Tulis nilai kepemimpinanmu dalam 3 kalimat",
    ],
  },
  {
    n: 2,
    title: "Start With Why",
    creatorName: "Simon Sinek",
    totalPages: 256,
    difficultyLevel: "intermediate",
    isbn: "1591846447",
    skillTargets: ["Kepemimpinan Berbasis Nilai", "Komunikasi Efektif", "Entrepreneurship"],
    topicTags: ["leadership", "purpose", "visi", "inspirasi"],
    actions: [
      'Tulis WHY bisnismu dalam 1 kalimat yang dimulai "Saya percaya bahwa..."',
      "Evaluasi apakah komunikasi timmu dimulai dari Why atau What",
      "Identifikasi 1 kompetitor yang hanya bicara WHAT",
      "Bagikan WHY-mu kepada 3 orang hari ini",
      "Susun ulang elevator pitch menggunakan Golden Circle",
    ],
  },
  {
    n: 3,
    title: "The Five Dysfunctions of a Team",
    creatorName: "Patrick Lencioni",
    totalPages: 229,
    difficultyLevel: "intermediate",
    isbn: "0787960756",
    skillTargets: ["Manajemen Tim", "Kepercayaan Organisasi", "Manajemen Konflik"],
    topicTags: ["tim", "kolaborasi", "kepercayaan", "disfungsi"],
    actions: [
      "Lakukan asesmen 5 disfungsi untuk timmu sekarang",
      "Identifikasi disfungsi paling dominan di timmu",
      "Jadwalkan sesi vulnerability-based trust dengan tim",
      "Buat norma konflik sehat dalam 3 poin",
      "Ukur akuntabilitas peer-to-peer di timmu",
    ],
  },
  {
    n: 4,
    title: "Dare to Lead",
    creatorName: "Brené Brown",
    totalPages: 320,
    difficultyLevel: "intermediate",
    isbn: "0399592520",
    skillTargets: ["Kepemimpinan Berbasis Nilai", "Kecerdasan Emosional", "Komunikasi Efektif"],
    topicTags: ["leadership", "keberanian", "empati", "vulnerabilitas"],
    actions: [
      "Identifikasi 1 momen saat kamu menghindari percakapan sulit",
      'Praktikkan "rumble" — bicara jujur tanpa defensif hari ini',
      "Tulis nilai-nilai terpentingmu dan cara kamu melanggarnya",
      "Ganti 1 armor pelindungmu dengan keberanian",
      "Minta feedback langsung dari 1 orang yang kamu pimpin",
    ],
  },
  {
    n: 5,
    title: "Good to Great",
    creatorName: "Jim Collins",
    totalPages: 300,
    difficultyLevel: "advanced",
    isbn: "0066620996",
    skillTargets: ["Kepemimpinan Strategis", "Strategi Bisnis", "Eksekusi Strategi"],
    topicTags: ["leadership", "greatness", "disiplin", "strategi"],
    actions: [
      'Temukan "Hedgehog Concept" bisnismu (irisan: passion, terbaik, ekonomi)',
      "Identifikasi 1 hal yang harus dihentikan agar bisa menjadi great",
      "Evaluasi apakah pemimpinmu adalah tipe Level 5",
      'Terapkan "culture of discipline" di 1 proses hari ini',
      "Buat Flywheel bisnismu dalam diagram sederhana",
    ],
  },
  {
    n: 6,
    title: "The 21 Irrefutable Laws of Leadership",
    creatorName: "John C. Maxwell",
    totalPages: 336,
    difficultyLevel: "beginner",
    isbn: "0785274316",
    skillTargets: ["Kepemimpinan Strategis", "Pengaruh & Persuasi", "Pengembangan Diri"],
    topicTags: ["leadership", "hukum", "pengaruh", "karakter"],
    actions: [
      "Nilai dirimu di 21 hukum dari 1–10",
      "Pilih 3 hukum terlemah dan buat rencana perbaikan",
      "Praktikkan Law of Connection dengan 1 orang hari ini",
      "Temukan mentor yang merepresentasikan Law of Modeling",
      "Tulis bagaimana kamu menerapkan Law of Legacy",
    ],
  },
  {
    n: 7,
    title: "Extreme Ownership",
    creatorName: "Jocko Willink",
    totalPages: 320,
    difficultyLevel: "intermediate",
    isbn: "1250183863",
    skillTargets: ["Ownership & Akuntabilitas", "Kepemimpinan Strategis", "Eksekusi Strategi"],
    topicTags: ["leadership", "militer", "tanggung jawab", "eksekusi"],
    actions: [
      "Identifikasi 1 kegagalan tim yang selama ini kamu salahkan ke orang lain",
      'Ambil ownership penuh atas 1 masalah yang bukan "tugasmu"',
      "Terapkan Decentralized Command di 1 keputusan tim",
      "Buat after-action review untuk proyek yang gagal",
      "Eliminasi 1 alasan/excuse dari cara kamu berkomunikasi",
    ],
  },
  {
    n: 8,
    title: "Multipliers",
    creatorName: "Liz Wiseman",
    totalPages: 336,
    difficultyLevel: "advanced",
    isbn: "0062663070",
    skillTargets: ["Manajemen Tim", "Delegasi Efektif", "Kepemimpinan Strategis"],
    topicTags: ["leadership", "leverage", "talenta", "organisasi"],
    actions: [
      "Identifikasi apakah kamu lebih sering menjadi Multiplier atau Diminisher",
      "Hentikan 1 kebiasaan Diminisher minggu ini",
      "Tanyakan pertanyaan bukan berikan jawaban di rapat berikutnya",
      'Temukan "Native Genius" 3 anggota timmu',
      "Berikan tantangan yang cukup besar untuk 1 orang berbakat",
    ],
  },
  {
    n: 9,
    title: "The One Minute Manager",
    creatorName: "Ken Blanchard",
    totalPages: 112,
    difficultyLevel: "beginner",
    isbn: "0688014291",
    skillTargets: ["Manajemen Tim", "Delegasi Efektif", "Motivasi & Engagement"],
    topicTags: ["manajemen", "efisiensi", "feedback", "tim"],
    actions: [
      "Berikan 1 one-minute praise yang spesifik hari ini",
      "Tetapkan 3 goal utama untuk setiap anggota tim dalam 1 menit",
      "Berikan 1 one-minute redirect ketika ada kesalahan",
      "Jadwalkan check-in 60 detik dengan tim setiap pagi",
      "Tulis goal mingguan timmu dalam 1 kalimat per goal",
    ],
  },
  {
    n: 10,
    title: "Measure What Matters",
    creatorName: "John Doerr",
    totalPages: 320,
    difficultyLevel: "advanced",
    isbn: "0525536221",
    skillTargets: ["Eksekusi Strategi", "Kepemimpinan Strategis", "OKR & Goal Setting"],
    topicTags: ["OKR", "goals", "eksekusi", "pengukuran"],
    actions: [
      "Tulis 1 Objective dan 3 Key Results untuk kuartal ini",
      "Bedakan mana goal committed vs aspirational",
      "Lakukan weekly check-in OKR pertamamu",
      "Eliminasi metric yang tidak terhubung ke Objective",
      "Cascade OKR dari level organisasi ke level personal",
    ],
  },
  {
    n: 11,
    title: "Rich Dad Poor Dad",
    creatorName: "Robert Kiyosaki",
    totalPages: 336,
    difficultyLevel: "beginner",
    isbn: "1612680194",
    skillTargets: ["Mindset Kekayaan", "Literasi Keuangan", "Investasi & Portofolio"],
    topicTags: ["keuangan", "aset", "mindset", "investasi"],
    actions: [
      "Buat daftar aset dan liabilitas yang kamu miliki sekarang",
      "Identifikasi 1 pengeluaran liabilitas yang bisa dikonversi ke aset",
      "Hitung berapa persen income yang masuk ke kolom aset",
      "Pelajari 1 instrumen investasi yang menghasilkan passive income",
      'Tulis definisi "kaya" menurut versi Rich Dad',
    ],
  },
  {
    n: 12,
    title: "The Psychology of Money",
    creatorName: "Morgan Housel",
    totalPages: 256,
    difficultyLevel: "beginner",
    isbn: "0857197681",
    skillTargets: ["Mindset Kekayaan", "Pengambilan Keputusan Keuangan", "Perencanaan Jangka Panjang"],
    topicTags: ["keuangan", "psikologi", "perilaku", "uang"],
    actions: [
      "Identifikasi 1 bias keuangan yang pernah merugikanmu",
      "Hitung berapa lama kamu akan aman jika kehilangan penghasilan hari ini",
      'Tulis apa arti "cukup" untukmu secara finansial',
      "Evaluasi keputusan keuangan terbesar yang dipengaruhi ego",
      "Buat rencana tabungan yang tidak bergantung pada disiplin harian",
    ],
  },
  {
    n: 13,
    title: "I Will Teach You to Be Rich",
    creatorName: "Ramit Sethi",
    totalPages: 352,
    difficultyLevel: "beginner",
    isbn: "1523505745",
    skillTargets: ["Perencanaan Keuangan Pribadi", "Manajemen Arus Kas", "Otomasi Keuangan"],
    topicTags: ["keuangan", "tabungan", "otomasi", "milenial"],
    actions: [
      "Buka rekening tabungan terpisah hari ini",
      "Otomasi transfer 10% gaji ke rekening investasi",
      "Negosiasi 1 tagihan bulanan (kartu kredit, internet, langganan)",
      "Batalkan 2 langganan yang jarang digunakan",
      "Buat sistem amplop digital untuk 4 kategori pengeluaran utama",
    ],
  },
  {
    n: 14,
    title: "The Millionaire Next Door",
    creatorName: "Thomas Stanley",
    totalPages: 272,
    difficultyLevel: "intermediate",
    isbn: "1589795474",
    skillTargets: ["Mindset Kekayaan", "Perencanaan Keuangan Pribadi", "Manajemen Aset"],
    topicTags: ["keuangan", "kekayaan", "gaya hidup", "hemat"],
    actions: [
      "Hitung net worth riilmu hari ini",
      "Bandingkan gaya hidupmu vs income-mu — apakah proporsional?",
      "Identifikasi 1 pengeluaran status yang bisa dikurangi",
      "Pelajari profil millionaire di sekitarmu yang tidak terlihat kaya",
      "Buat anggaran tahunan berbasis frugal lifestyle",
    ],
  },
  {
    n: 15,
    title: "The Intelligent Investor",
    creatorName: "Benjamin Graham",
    totalPages: 640,
    difficultyLevel: "advanced",
    isbn: "0060555661",
    skillTargets: ["Investasi & Portofolio", "Analisis Fundamental", "Manajemen Risiko"],
    topicTags: ["investasi", "saham", "value investing", "pasar modal"],
    actions: [
      "Pelajari cara membaca laporan keuangan dasar hari ini",
      "Tentukan margin of safety minimum sebelum membeli saham",
      "Buat watchlist 5 saham dan analisis valuasinya",
      "Bedakan investasi vs spekulasi dalam portofoliomu",
      "Hitung intrinsic value 1 saham yang kamu minati",
    ],
  },
  {
    n: 16,
    title: "A Random Walk Down Wall Street",
    creatorName: "Burton Malkiel",
    totalPages: 432,
    difficultyLevel: "advanced",
    isbn: "0393358380",
    skillTargets: ["Investasi & Portofolio", "Analisis Pasar", "Diversifikasi"],
    topicTags: ["investasi", "pasar saham", "diversifikasi", "indeks"],
    actions: [
      "Bandingkan return reksa dana aktif vs indeks 5 tahun terakhir",
      "Alokasikan minimal 60% portofolio ke index fund",
      "Hitung total biaya (expense ratio) dari investasimu saat ini",
      "Buat jadwal rebalancing portofolio setiap 6 bulan",
      "Eliminasi 1 saham spekulatif dari portofoliomu",
    ],
  },
  {
    n: 17,
    title: "Your Money or Your Life",
    creatorName: "Vicki Robin",
    totalPages: 368,
    difficultyLevel: "intermediate",
    isbn: "0143115766",
    skillTargets: ["Perencanaan Keuangan Pribadi", "Mindset Kekayaan", "Manajemen Energi"],
    topicTags: ["keuangan", "kebebasan finansial", "hidup sederhana", "FIRE"],
    actions: [
      "Hitung hourly rate riilmu (gaji ÷ total jam yang dikorbankan untuk kerja)",
      "Evaluasi apakah setiap pengeluaran sepadan dengan energi hidupmu",
      "Hitung FI number-mu (biaya hidup bulanan × 300)",
      'Buat grafik "crossover point" antara income dan pengeluaran',
      "Identifikasi 3 pengeluaran yang tidak menambah kebahagiaan nyata",
    ],
  },
  {
    n: 18,
    title: "Die with Zero",
    creatorName: "Bill Perkins",
    totalPages: 256,
    difficultyLevel: "intermediate",
    isbn: "0358099765",
    skillTargets: ["Perencanaan Keuangan Pribadi", "Mindset Kekayaan", "Manajemen Waktu"],
    topicTags: ["keuangan", "pengalaman", "hidup penuh", "alokasi"],
    actions: [
      'Buat "memory dividend" — daftar 5 pengalaman yang ingin dibuat sebelum usia tertentu',
      "Hitung berapa yang akan kamu wariskan vs nikmati sendiri",
      "Identifikasi aktivitas yang hanya bisa dilakukan di usia sekarang",
      "Alokasikan anggaran khusus untuk pengalaman bulan ini",
      "Evaluasi apakah kamu menabung terlalu banyak untuk masa depan yang tidak pasti",
    ],
  },
  {
    n: 19,
    title: "Zero to One",
    creatorName: "Peter Thiel",
    totalPages: 224,
    difficultyLevel: "advanced",
    isbn: "0804139296",
    skillTargets: ["Inovasi Produk", "Strategi Bisnis", "Entrepreneurship"],
    topicTags: ["startup", "monopoli", "inovasi", "teknologi"],
    actions: [
      'Jawab: "Kebenaran penting apa yang sangat sedikit orang setuju denganmu?"',
      "Identifikasi apakah bisnismu 0→1 atau 1→n",
      "Temukan 1 pasar kecil yang bisa kamu dominasi sepenuhnya",
      "Evaluasi secret yang menjadi dasar bisnismu",
      "Buat distribusi plan sebelum produkmu selesai",
    ],
  },
  {
    n: 20,
    title: "The Lean Startup",
    creatorName: "Eric Ries",
    totalPages: 299,
    difficultyLevel: "intermediate",
    isbn: "0307887898",
    skillTargets: ["Customer Development", "Product-Market Fit", "Model Bisnis"],
    topicTags: ["startup", "lean", "MVP", "iterasi"],
    actions: [
      "Definisikan hipotesis terbesar bisnismu sekarang",
      "Buat MVP dalam 1 minggu untuk menguji hipotesis tersebut",
      "Tentukan 1 Actionable Metric yang paling penting bulan ini",
      "Jadwalkan sesi customer interview dengan 5 pengguna",
      "Lakukan pivot kecil berdasarkan data, bukan asumsi",
    ],
  },
  {
    n: 21,
    title: "Built to Last",
    creatorName: "Jim Collins",
    totalPages: 368,
    difficultyLevel: "advanced",
    isbn: "0060516402",
    skillTargets: ["Strategi Bisnis", "Pengembangan Budaya Organisasi", "Kepemimpinan Strategis"],
    topicTags: ["bisnis", "visi", "budaya", "keberlanjutan"],
    actions: [
      "Definisikan BHAG (Big Hairy Audacious Goal) bisnismu",
      "Tulis core ideology yang tidak boleh berubah meskipun strategi berubah",
      "Identifikasi apa yang kamu preserve vs apa yang harus berubah",
      "Evaluasi apakah budaya organisasimu self-sustaining",
      "Buat program pengembangan pemimpin internal",
    ],
  },
  {
    n: 22,
    title: "The E-Myth Revisited",
    creatorName: "Michael Gerber",
    totalPages: 288,
    difficultyLevel: "beginner",
    isbn: "0887307280",
    skillTargets: ["Operasional Bisnis", "Model Bisnis", "Entrepreneurship"],
    topicTags: ["bisnis", "sistem", "UKM", "operasional"],
    actions: [
      "Identifikasi apakah kamu lebih banyak berperan sebagai technician, manager, atau entrepreneur",
      "Dokumentasikan 1 proses bisnis yang masih ada di kepalamu",
      "Buat SOP sederhana untuk 1 aktivitas yang berulang",
      "Bayangkan bisnismu sebagai franchise — apa yang harus distandardisasi?",
      "Delegasikan 1 tugas teknisi yang selama ini kamu kerjakan sendiri",
    ],
  },
];

export function initializeBookSeedDataV2(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(BOOKS_SEED_V2_KEY) === "true") return;

  SEED_BOOKS_V2_DATA.forEach((bookData) => {
    const source = createBookV2(bookData);
    saveSource(source);

    bookData.skillTargets.forEach((skillName, idx) => {
      const spId = `seed-sp-${source.id}-${idx}`;
      // First skill gets the curated action items; remaining use auto-generation
      const actionTexts = idx === 0 ? bookData.actions : generateActionPlan(skillName);
      const sp: SkillProgress = {
        id: spId,
        sourceId: source.id,
        skillName,
        category: "general",
        level: "awareness",
        actionItems: actionTexts.map((text, pi) => ({
          id: `seed-ai-${source.id}-${idx}-${pi}`,
          skillProgressId: spId,
          text,
          completed: false,
        })),
        createdAt: source.createdAt,
      };
      saveSkillProgress(sp);
    });
  });

  localStorage.setItem(BOOKS_SEED_V2_KEY, "true");
}
