import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Loader2, MessageCircle } from 'lucide-react';
import { authService } from '../services/authService';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await authService.forgotPassword(email);
      setSuccessInfo(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Terjadi kesalahan saat memproses permintaan.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-borderMuted/40 shadow-elevated space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-playfair font-bold text-2xl mx-auto border border-primary/20 group-hover:scale-105 transition-transform">
              IB
            </div>
          </Link>
          <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-gray-900">
            Pemulihan Kata Sandi
          </h2>
          <p className="text-xs text-textMuted max-w-xs mx-auto">
            Masukkan alamat email yang terdaftar untuk menerima tautan pengaturan ulang kata sandi
          </p>
        </div>

        {/* Tampilan Jika Berhasil Terkirim */}
        {successInfo ? (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-base">Tautan Terkirim!</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Kami telah mengirimkan instruksi dan tautan pemulihan kata sandi ke:
              </p>
              <p className="text-xs font-bold text-primary bg-primary/5 py-1.5 px-3 rounded-lg inline-block">
                {email}
              </p>
              <p className="text-[11px] text-textMuted mt-2">
                Tautan berlaku selama <strong>60 menit</strong>. Jika tidak muncul di kotak masuk utama, mohon periksa folder <em>Spam</em> atau <em>Promosi</em>.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSuccessInfo(null);
                  setEmail('');
                }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Kirim Ulang dengan Email Lain
              </button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Masuk</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Form Input Email */
          <>
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Gagal Mengirim</p>
                  <p className="text-rose-700 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alamat Email Terdaftar
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderMuted/60 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-primary text-white font-bold text-xs rounded-2xl hover:bg-primary-hover shadow-elevated transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirimkan Tautan...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Tautan Pemulihan</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bantuan Alternatif via WhatsApp */}
            <div className="pt-2 border-t border-gray-100 space-y-4">
              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-borderMuted/30 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-gray-900">Kendala Email?</p>
                  <p className="text-[11px] text-textMuted">Hubungi admin WhatsApp butik</p>
                </div>
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20Intan%20Buket,%20saya%20butuh%20bantuan%20reset%20kata%20sandi%20akun%20saya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs shadow-sm transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-textMuted hover:text-primary font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
