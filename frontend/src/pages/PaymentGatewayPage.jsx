import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  Building2,
  QrCode,
  Truck,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  X,
  Smartphone
} from 'lucide-react';
import { paymentGatewayService } from '../services/api';
import { useShopProfile } from '../context/ShopProfileContext';

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val || 0);
};

const PaymentGatewayPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { shopProfile } = useShopProfile();

  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(true);

  // Modal dialog pengalihan ke aplikasi bank / e-wallet
  const [redirectModal, setRedirectModal] = useState({
    isOpen: false,
    channel: '',
    title: '',
    iconColor: '',
    deepLink: '',
    webUrl: '',
    accountNumber: '',
    instructions: []
  });

  // Countdown timer state (simulasi 15 menit)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  // Fetch data invoice pesanan
  const fetchInvoice = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await paymentGatewayService.getInvoice(orderId);
      if (res?.data) {
        setOrder(res.data.order);
        setPaymentMethod(res.data.payment_method || res.data.order?.payment_method);
      } else {
        throw new Error('Data pesanan tidak ditemukan.');
      }
    } catch (err) {
      console.error('Gagal mengambil data transaksi:', err);
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        'Gagal memuat rincian transaksi pembayaran. Pastikan ID pesanan valid.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [orderId]);

  // Timer countdown
  useEffect(() => {
    if (order?.status_pembayaran === 'lunas') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [order?.status_pembayaran]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2500);
  };

  // Eksekusi pembayaran instan via Payment Gateway
  const handlePayNow = async (channelName) => {
    if (!orderId) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await paymentGatewayService.pay(orderId, channelName);
      if (res?.data) {
        setOrder(res.data);
        setRedirectModal(prev => ({ ...prev, isOpen: false }));
      }
    } catch (err) {
      console.error('Gagal memproses pembayaran:', err);
      setErrorMsg(
        err.response?.data?.message ||
        'Terjadi kendala saat memverifikasi pembayaran. Silakan coba kembali.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Fungsi pengalihan langsung ke aplikasi perbankan atau e-wallet (Deep Link & Web)
  const handleOpenAppOrWeb = ({
    channel,
    title,
    iconColor,
    deepLink,
    webUrl,
    accountNumber = '',
    instructions = []
  }) => {
    // 1. Jika ada nomor rekening, otomatis salin ke clipboard
    if (accountNumber) {
      handleCopy(accountNumber, 'auto_rek');
    }

    // Prioritaskan link custom dari Superadmin jika ada
    const targetUrl = paymentMethod?.payment_url || webUrl;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 2. Trigger redirect
    if (isMobile && deepLink) {
      // Buka aplikasi via Deep Link scheme di ponsel
      window.location.href = deepLink;
      // Cadangan buka web jika aplikasi belum terpasang
      setTimeout(() => {
        if (targetUrl) {
          window.open(targetUrl, '_blank');
        }
      }, 1500);
    } else if (targetUrl) {
      // Di laptop / PC, buka portal resmi di tab baru
      window.open(targetUrl, '_blank');
    }

    // 3. Tampilkan modal panduan & konfirmasi
    setRedirectModal({
      isOpen: true,
      channel,
      title,
      iconColor,
      deepLink,
      webUrl: targetUrl,
      accountNumber,
      instructions
    });
  };

  // Cek kategori metode pembayaran
  const methodName = (paymentMethod?.nama_metode || order?.motode_pembayaran || '').toLowerCase();
  const isQris = methodName.includes('qris') || methodName.includes('gopay') || methodName.includes('dana');
  const isBri = methodName.includes('bri');
  const isBca = methodName.includes('bca');
  const isCod = methodName.includes('cod') || methodName.includes('tunai') || methodName.includes('tempat');

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
        <h3 className="font-playfair font-bold text-xl text-gray-900">Memuat Gerbang Pembayaran...</h3>
        <p className="text-xs text-textMuted mt-1">Menghubungkan ke sistem transaksi aman Intan Buket</p>
      </div>
    );
  }

  if (errorMsg && !order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-rose-200 shadow-soft text-center space-y-4">
        <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-playfair font-bold text-2xl text-gray-900">Transaksi Tidak Ditemukan</h2>
        <p className="text-xs text-textMuted leading-relaxed">{errorMsg}</p>
        <div className="pt-2">
          <Link
            to="/pesanan-saya"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Lihat Riwayat Pesanan Saya</span>
          </Link>
        </div>
      </div>
    );
  }

  const isLunas = order?.status_pembayaran === 'lunas';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
      
      {/* Top Banner / Trust Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FBF9F6] border border-borderMuted/40 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-playfair font-bold text-lg text-gray-900">
                Payment Gateway Resmi
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Aman 256-bit SSL
              </span>
            </div>
            <p className="text-[11px] text-textMuted">
              {shopProfile?.nama_toko || 'Intan Buket Madiun'} • Transaksi Otomatis Terverifikasi
            </p>
          </div>
        </div>

        {/* Status / Expiration Badge */}
        {!isLunas && !isCod && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Selesaikan dalam: </span>
            <span className="font-mono font-bold text-amber-800 text-sm tracking-wider">
              {formatTimer(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Main Payment Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Transaction & Payment Interface */}
        <div className="lg:col-span-7 space-y-6">

          {/* SUCCESS STATE */}
          {isLunas ? (
            <div className="bg-white rounded-3xl border border-emerald-200 shadow-soft p-6 sm:p-8 text-center space-y-5 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  Lunas Terverifikasi
                </span>
                <h2 className="font-playfair font-bold text-2xl text-gray-900">
                  Pembayaran Berhasil!
                </h2>
                <p className="text-xs text-textMuted max-w-sm mx-auto">
                  Terima kasih, pembayaran Anda telah berhasil kami verifikasi secara otomatis. Pesanan buket Anda segera dipersiapkan dengan penuh cinta.
                </p>
              </div>

              {/* Order quick metadata */}
              <div className="bg-[#FBF9F6] p-4 rounded-2xl border border-borderMuted/30 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-textMuted">Kode Pesanan:</span>
                  <span className="font-mono font-bold text-gray-900">{order.kode_pesanan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Metode:</span>
                  <span className="font-semibold text-gray-900">{order.motode_pembayaran}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-textMuted">Waktu Bayar:</span>
                  <span className="font-semibold text-emerald-700">
                    {order.dibayar_pada ? new Date(order.dibayar_pada).toLocaleString('id-ID') : 'Baru saja'}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200/60 pt-2 font-bold text-sm">
                  <span>Total Dibayar:</span>
                  <span className="text-primary">{formatRupiah(order.total_harga)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                <Link
                  to={`/pesanan-saya?success=1&order_id=${order.id_pesanan}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-soft transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Lihat Status Pesanan Saya</span>
                </Link>

                {shopProfile?.whatsapp && (
                  <a
                    href={`https://wa.me/${shopProfile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Halo ${shopProfile?.nama_toko || 'Intan Buket'}, saya telah menyelesaikan pembayaran untuk pesanan ${order.kode_pesanan}. Mohon konfirmasi pesanan saya. Terima kasih!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Konfirmasi ke WhatsApp Toko</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* UNPAID / PROCESSING STATE */
            <div className="bg-white rounded-3xl border border-borderMuted/40 shadow-soft p-6 sm:p-8 space-y-6">
              
              {/* Nominal Tagihan Card */}
              <div className="bg-linear-to-r from-primary to-[#701524] text-white p-5 rounded-2xl shadow-soft space-y-2">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>Total Tagihan Pembayaran</span>
                  <span className="font-mono text-[11px] bg-white/20 px-2 py-0.5 rounded">
                    {order?.kode_pesanan || `#${orderId}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-playfair font-bold text-2xl sm:text-3xl tracking-tight">
                    {formatRupiah(order?.total_harga)}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(order?.total_harga), 'total_harga')}
                    className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedField === 'total_harga' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Nominal</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-white/70">
                  *Transfer nominal tepat hingga digit terakhir untuk kemudahan verifikasi otomatis.
                </p>
              </div>

              {/* PAYMENT METHOD DETAILS */}

              {/* 1. KASUS QRIS (DANA, GOPAY, OVO, SHOPEEPAY) */}
              {isQris && (
                <div className="space-y-5">
                  <div className="border border-borderMuted/60 rounded-2xl p-5 bg-[#FBF9F6] text-center space-y-4">
                    
                    {/* Header QRIS */}
                    <div className="flex items-center justify-between border-b border-borderMuted/30 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-wide text-gray-900 font-sans">
                          QRIS
                        </span>
                        <span className="text-[10px] text-textMuted border-l border-gray-300 pl-2">
                          GPN / Standar Pembayaran Nasional
                        </span>
                      </div>
                      <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
                        QRIS
                      </span>
                    </div>

                    {/* Merchant Info */}
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">
                        {paymentMethod?.atas_nama || 'INTAN BUKET MADIUN'}
                      </h4>
                      <p className="text-[11px] text-textMuted font-mono">
                        NMID: {paymentMethod?.nomor_rekening || 'ID102439812903'} • Acquirer: DANA / GOPAY / QRIS
                      </p>
                    </div>

                    {/* QR Code Frame */}
                    <div className="inline-block p-4 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-sm relative group">
                      {paymentMethod?.qr_image ? (
                        <img
                          src={paymentMethod.qr_image}
                          alt="QRIS Intan Buket"
                          className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-lg"
                        />
                      ) : (
                        /* Default Dynamic QR code visual */
                        <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 relative">
                          <svg
                            className="w-full h-full text-gray-900"
                            viewBox="0 0 200 200"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect width="200" height="200" fill="white" />
                            <rect x="15" y="15" width="50" height="50" fill="black" rx="6" />
                            <rect x="23" y="23" width="34" height="34" fill="white" rx="4" />
                            <rect x="31" y="31" width="18" height="18" fill="black" rx="2" />
                            <rect x="135" y="15" width="50" height="50" fill="black" rx="6" />
                            <rect x="143" y="23" width="34" height="34" fill="white" rx="4" />
                            <rect x="151" y="31" width="18" height="18" fill="black" rx="2" />
                            <rect x="15" y="135" width="50" height="50" fill="black" rx="6" />
                            <rect x="23" y="143" width="34" height="34" fill="white" rx="4" />
                            <rect x="31" y="151" width="18" height="18" fill="black" rx="2" />
                            <rect x="75" y="20" width="10" height="10" fill="black" />
                            <rect x="95" y="20" width="10" height="10" fill="black" />
                            <rect x="115" y="20" width="10" height="10" fill="black" />
                            <rect x="20" y="75" width="10" height="10" fill="black" />
                            <rect x="20" y="95" width="10" height="10" fill="black" />
                            <rect x="20" y="115" width="10" height="10" fill="black" />
                            <rect x="75" y="75" width="20" height="20" fill="black" />
                            <rect x="105" y="75" width="15" height="15" fill="black" />
                            <rect x="130" y="75" width="20" height="10" fill="black" />
                            <rect x="75" y="105" width="15" height="15" fill="black" />
                            <rect x="100" y="100" width="25" height="25" fill="#881337" rx="4" />
                            <text x="112" y="117" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">IB</text>
                            <rect x="135" y="105" width="15" height="15" fill="black" />
                            <rect x="75" y="135" width="15" height="20" fill="black" />
                            <rect x="100" y="135" width="20" height="10" fill="black" />
                            <rect x="135" y="135" width="20" height="20" fill="black" />
                            <rect x="165" y="135" width="15" height="15" fill="black" />
                            <rect x="165" y="160" width="15" height="15" fill="black" />
                            <rect x="135" y="165" width="20" height="10" fill="black" />
                            <rect x="75" y="165" width="20" height="10" fill="black" />
                          </svg>
                        </div>
                      )}

                      {/* E-Wallets badge bar underneath */}
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-bold text-gray-600">
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">DANA</span>
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">GoPay</span>
                        <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">OVO</span>
                        <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded border border-orange-200">ShopeePay</span>
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200">m-Banking</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-textMuted">
                      Scan kode QR di atas menggunakan aplikasi e-wallet apa saja (DANA, GoPay, OVO, ShopeePay) atau m-Banking Anda.
                    </p>
                  </div>

                  {/* Redirection to E-Wallet App Buttons */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                        <Smartphone className="w-4 h-4 text-primary" />
                        <span>Buka Langsung Aplikasi E-Wallet / Pembayaran:</span>
                      </div>
                      <span className="text-[10px] text-textMuted">Buka App / Web</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* DANA */}
                      <button
                        type="button"
                        onClick={() => handleOpenAppOrWeb({
                          channel: 'DANA',
                          title: 'Aplikasi DANA',
                          iconColor: 'bg-blue-600 text-white',
                          deepLink: 'dana://',
                          webUrl: paymentMethod?.payment_url || 'https://link.dana.id',
                          instructions: [
                            'Aplikasi DANA sedang dibuka di perangkat Anda.',
                            `Pastikan saldo Anda cukup untuk membayar ${formatRupiah(order?.total_harga)}.`,
                            'Lakukan scan QRIS toko atau selesaikan pembayaran.',
                            'Setelah transaksi selesai, klik tombol "Konfirmasi Sudah Bayar" di bawah ini.'
                          ]
                        })}
                        className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs group"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-blue-600" />
                          <span>Bayar via DANA</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-600" />
                      </button>

                      {/* GoPay */}
                      <button
                        type="button"
                        onClick={() => handleOpenAppOrWeb({
                          channel: 'GoPay',
                          title: 'Aplikasi Gojek / GoPay',
                          iconColor: 'bg-emerald-600 text-white',
                          deepLink: 'gojek://gopay',
                          webUrl: paymentMethod?.payment_url || 'https://gopay.co.id',
                          instructions: [
                            'Aplikasi Gojek / GoPay sedang dibuka di perangkat Anda.',
                            `Pastikan nominal transaksi tepat: ${formatRupiah(order?.total_harga)}.`,
                            'Scan barcode QRIS dan masukkan PIN GoPay Anda.',
                            'Setelah transaksi selesai, klik tombol "Konfirmasi Sudah Bayar" di bawah ini.'
                          ]
                        })}
                        className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs group"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-emerald-600" />
                          <span>Bayar via GoPay</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-600" />
                      </button>

                      {/* OVO / ShopeePay */}
                      <button
                        type="button"
                        onClick={() => handleOpenAppOrWeb({
                          channel: 'OVO / ShopeePay',
                          title: 'Aplikasi OVO / ShopeePay',
                          iconColor: 'bg-purple-600 text-white',
                          deepLink: 'shopeepay://',
                          webUrl: paymentMethod?.payment_url || 'https://shopee.co.id/m/shopeepay',
                          instructions: [
                            'Buka aplikasi e-wallet (OVO atau ShopeePay) di perangkat Anda.',
                            'Pilih menu Scan / Bayar dan pindai kode QRIS toko.',
                            `Selesaikan pembayaran ${formatRupiah(order?.total_harga)} menggunakan PIN Anda.`,
                            'Setelah selesai, klik tombol "Konfirmasi Sudah Bayar" di bawah ini.'
                          ]
                        })}
                        className="py-2.5 px-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-xs group"
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-purple-600" />
                          <span>Bayar via OVO / Shopee</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-600" />
                      </button>

                      {/* Direct Verification */}
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handlePayNow('Scan QRIS Sukses')}
                        className="py-2.5 px-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        )}
                        <span>Konfirmasi QRIS Sudah Bayar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. KASUS TRANSFER BANK BRI */}
              {isBri && (
                <div className="space-y-5">
                  <div className="border border-blue-200 bg-blue-50/40 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                          BRI
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">Bank Rakyat Indonesia (BRI)</h4>
                          <span className="text-[10px] text-textMuted">Transfer Antar Bank / Sesama BRI</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                        Bank BRI
                      </span>
                    </div>

                    {/* Nomor Rekening */}
                    <div className="bg-white p-4 rounded-xl border border-blue-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">
                          Nomor Rekening BRI
                        </span>
                        <div className="font-mono font-bold text-lg text-gray-900 tracking-wider">
                          {paymentMethod?.nomor_rekening || '0123-01-098765-50-8'}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          Atas Nama: <strong className="text-gray-900">{paymentMethod?.atas_nama || 'Intan Permata'}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(paymentMethod?.nomor_rekening || '012301098765508', 'bri_rek')}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-blue-200 shrink-0"
                      >
                        {copiedField === 'bri_rek' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin No. Rek</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Step-by-step instructions */}
                    <div className="text-xs text-gray-700 space-y-1.5 bg-white/70 p-3.5 rounded-xl border border-blue-100">
                      <div className="font-bold text-gray-900 text-xs mb-1">Panduan Transfer via BRImo:</div>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600">
                        <li>Buka aplikasi <strong>BRImo</strong> di ponsel Anda.</li>
                        <li>Pilih menu <strong>Transfer</strong> &gt; <strong>Tambah Penerima Baru</strong>.</li>
                        <li>Pilih <strong>Bank BRI</strong> dan tempel nomor rekening di atas.</li>
                        <li>Masukkan nominal transfer: <strong>{formatRupiah(order?.total_harga)}</strong>.</li>
                        <li>Konfirmasi transaksi dan masukkan PIN BRImo Anda.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Actions for Bank BRI: Open App & Instant Confirmation */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenAppOrWeb({
                        channel: 'Bank BRI (BRImo)',
                        title: 'Aplikasi BRImo / Internet Banking BRI',
                        iconColor: 'bg-blue-600 text-white',
                        deepLink: 'brimo://',
                        webUrl: paymentMethod?.payment_url || 'https://ib.bri.co.id',
                        accountNumber: paymentMethod?.nomor_rekening || '0123-01-098765-50-8',
                        instructions: [
                          `Nomor rekening Bank BRI (${paymentMethod?.nomor_rekening}) telah otomatis disalin ke clipboard!`,
                          'Buka aplikasi BRImo atau web Internet Banking BRI.',
                          'Pilih menu Transfer ke Bank BRI.',
                          `Masukkan nominal persis: ${formatRupiah(order?.total_harga)}.`,
                          'Setelah transfer selesai, klik tombol "Konfirmasi Sudah Bayar" di bawah ini.'
                        ]
                      })}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka Aplikasi BRImo / Web Bank BRI (Salin Rekening)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handlePayNow('Bank BRI (BRImo)')}
                      className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>Saya Sudah Transfer via BRI (Konfirmasi Lunas)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 3. KASUS TRANSFER BANK BCA */}
              {isBca && (
                <div className="space-y-5">
                  <div className="border border-indigo-200 bg-indigo-50/40 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-200/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-800 text-white font-bold flex items-center justify-center text-xs">
                          BCA
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">Bank Central Asia (BCA)</h4>
                          <span className="text-[10px] text-textMuted">Transfer Antar Bank / Sesama BCA</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                        Bank BCA
                      </span>
                    </div>

                    {/* Nomor Rekening BCA */}
                    <div className="bg-white p-4 rounded-xl border border-indigo-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">
                          Nomor Rekening BCA
                        </span>
                        <div className="font-mono font-bold text-lg text-gray-900 tracking-wider">
                          {paymentMethod?.nomor_rekening || '821-098-7654'}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          Atas Nama: <strong className="text-gray-900">{paymentMethod?.atas_nama || 'Intan Permata'}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(paymentMethod?.nomor_rekening || '8210987654', 'bca_rek')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-indigo-200 shrink-0"
                      >
                        {copiedField === 'bca_rek' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin No. Rek</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Steps */}
                    <div className="text-xs text-gray-700 space-y-1.5 bg-white/70 p-3.5 rounded-xl border border-indigo-100">
                      <div className="font-bold text-gray-900 text-xs mb-1">Panduan Transfer via BCA Mobile:</div>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600">
                        <li>Buka aplikasi <strong>BCA Mobile</strong> &gt; pilih <strong>m-Transfer</strong>.</li>
                        <li>Daftarkan nomor rekening di menu <strong>Daftar Transfer Antar Rekening</strong>.</li>
                        <li>Pilih <strong>Transfer Antar Rekening</strong> dan pilih nomor rekening di atas.</li>
                        <li>Masukkan nominal: <strong>{formatRupiah(order?.total_harga)}</strong>.</li>
                        <li>Pastikan nama penerima cocok dan masukkan PIN m-BCA.</li>
                      </ol>
                    </div>
                  </div>

                  {/* Actions for Bank BCA */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenAppOrWeb({
                        channel: 'Bank BCA (m-BCA)',
                        title: 'Aplikasi BCA Mobile / myBCA',
                        iconColor: 'bg-indigo-900 text-white',
                        deepLink: 'bca://',
                        webUrl: paymentMethod?.payment_url || 'https://mybca.bca.co.id',
                        accountNumber: paymentMethod?.nomor_rekening || '821-098-7654',
                        instructions: [
                          `Nomor rekening Bank BCA (${paymentMethod?.nomor_rekening}) telah otomatis disalin ke clipboard!`,
                          'Buka aplikasi BCA Mobile / myBCA atau KlikBCA.',
                          'Pilih menu m-Transfer ke Rekening BCA.',
                          `Masukkan nominal transfer: ${formatRupiah(order?.total_harga)}.`,
                          'Setelah transfer selesai, klik tombol "Konfirmasi Sudah Bayar" di bawah ini.'
                        ]
                      })}
                      className="w-full py-3 px-4 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Buka Aplikasi BCA Mobile / myBCA (Salin Rekening)</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handlePayNow('Bank BCA (m-BCA)')}
                      className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>Saya Sudah Transfer via BCA (Konfirmasi Lunas)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. KASUS COD (BAYAR DI TEMPAT) */}
              {isCod && (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-playfair font-bold text-lg text-gray-900">
                      Metode Pembayaran COD (Bayar di Tempat)
                    </h4>
                    <p className="text-xs text-textMuted max-w-md mx-auto mt-1">
                      Pesanan Anda akan langsung diproses oleh Florist Intan Buket. Siapkan uang tunai sejumlah <strong>{formatRupiah(order?.total_harga)}</strong> saat kurir mengantarkan pesanan atau saat Anda mengambil buket di toko.
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/pesanan-saya?success=1&order_id=${order.id_pesanan}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-sm"
                    >
                      <span>Konfirmasi & Lihat Pesanan Saya</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Right Column: Order Summary & Delivery Details */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-borderMuted/40 shadow-soft p-5 sm:p-6 space-y-4">
            
            {/* Header Accordion */}
            <div
              className="flex items-center justify-between cursor-pointer border-b border-gray-100 pb-3"
              onClick={() => setShowOrderDetails(!showOrderDetails)}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-playfair font-bold text-base text-gray-900">
                  Ringkasan Pesanan Buket
                </h3>
              </div>
              <button type="button" className="text-textMuted">
                {showOrderDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Order Items */}
            {showOrderDetails && (
              <div className="space-y-3 pt-1 animate-fadeIn">
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
                  {order?.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {item.product?.nama_produk || item.nama_produk || 'Buket Eksklusif'}
                        </p>
                        <p className="text-[11px] text-textMuted">
                          {formatRupiah(item.harga_satuan)} × {item.jumlah}
                        </p>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0">
                        {formatRupiah(item.subtotal || item.harga_satuan * item.jumlah)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Ongkir calculation */}
                <div className="border-t border-gray-100 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-textMuted">
                    <span>Subtotal Buket</span>
                    <span className="font-medium text-gray-800">
                      {formatRupiah(order?.total_harga - (order?.biaya_ongkir || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between text-textMuted">
                    <span>Biaya Pengiriman</span>
                    <span className="font-medium text-gray-800">
                      {order?.biaya_ongkir ? formatRupiah(order.biaya_ongkir) : 'Gratis / Standar'}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-gray-900 border-t border-gray-100 pt-2">
                    <span>Total Pembayaran</span>
                    <span className="text-primary">{formatRupiah(order?.total_harga)}</span>
                  </div>
                </div>

                {/* Delivery destination card */}
                <div className="bg-[#FBF9F6] p-3.5 rounded-2xl border border-borderMuted/30 space-y-1.5 text-xs mt-3">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900">
                    <MapPin className="w-3.5 h-3.5 text-secondary" />
                    <span>Tujuan Pengiriman</span>
                  </div>
                  <p className="font-semibold text-gray-800">{order?.nama_penerima} ({order?.telp_penerima})</p>
                  <p className="text-[11px] text-textMuted leading-relaxed">{order?.alamat_pengiriman}</p>

                  {order?.catatan && (
                    <div className="pt-2 border-t border-gray-200/50 text-[11px] text-gray-700">
                      <span className="font-semibold text-gray-900">Kartu Ucapan / Catatan: </span>
                      <span className="italic">"{order.catatan}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Need Help Support Card */}
          <div className="bg-white rounded-3xl border border-borderMuted/40 shadow-soft p-5 text-xs space-y-2">
            <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
              <span>Butuh Bantuan Transaksi?</span>
            </h4>
            <p className="text-textMuted text-[11px] leading-relaxed">
              Jika mengalami kendala transfer atau butuh konfirmasi manual, hubungi staf layanan pelanggan kami.
            </p>
            {shopProfile?.whatsapp && (
              <a
                href={`https://wa.me/${shopProfile.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-secondary hover:text-primary font-bold transition-colors pt-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp: {shopProfile.whatsapp}</span>
              </a>
            )}
          </div>
        </div>

      </div>

      {/* MODAL DIALOG PENGALIHAN APLIKASI / BANK EKSTERNAL */}
      {redirectModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-elevated border border-borderMuted/40">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${redirectModal.iconColor || 'bg-primary text-white'}`}>
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-base text-gray-900">
                    {redirectModal.title}
                  </h3>
                  <p className="text-[11px] text-textMuted">
                    Mengarahkan transaksi ke aplikasi / website pembayaran
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setRedirectModal(prev => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rekening & Tagihan Details if available */}
            {redirectModal.accountNumber && (
              <div className="bg-[#FBF9F6] p-4 rounded-2xl border border-borderMuted/30 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-textMuted">Nomor Rekening Tujuan:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-gray-900">{redirectModal.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(redirectModal.accountNumber, 'modal_rek')}
                      className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-700 hover:text-primary cursor-pointer"
                    >
                      {copiedField === 'modal_rek' ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200/50 pt-2">
                  <span className="text-textMuted">Nominal Transfer:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-primary font-bold">{formatRupiah(order?.total_harga)}</strong>
                    <button
                      type="button"
                      onClick={() => handleCopy(String(order?.total_harga), 'modal_total')}
                      className="px-2 py-1 rounded bg-white border border-gray-200 text-[10px] font-bold text-gray-700 hover:text-primary cursor-pointer"
                    >
                      {copiedField === 'modal_total' ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instruction Steps */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-textMuted">
                Panduan Selesaikan Pembayaran:
              </span>
              <ul className="space-y-1.5 text-xs text-gray-700 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                {redirectModal.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-1">
              {/* Buka Ulang Link / App */}
              {redirectModal.webUrl && (
                <a
                  href={redirectModal.webUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl border border-primary/40 text-primary hover:bg-primary/5 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Ulang Aplikasi / Halaman Transaksi</span>
                </a>
              )}

              {/* Konfirmasi Pembayaran Selesai */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handlePayNow(redirectModal.channel)}
                className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-soft transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                )}
                <span>Ya, Saya Sudah Menyelesaikan Pembayaran</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentGatewayPage;
