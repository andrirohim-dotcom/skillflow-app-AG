export default function VerifyEmailPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <div className="text-5xl mb-4">📬</div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Cek Inbox Kamu</h1>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Kami sudah kirim link verifikasi ke emailmu. Klik link tersebut untuk mengaktifkan akun dan mulai belajar.
      </p>
      <p className="text-xs text-gray-400">
        Tidak dapat email?{" "}
        <a href="/register" className="text-sky-600 font-semibold hover:underline">
          Coba daftar ulang
        </a>
      </p>
    </div>
  );
}
