import React, { useState, useEffect, useRef } from 'react';
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
  Zap
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

const loadSnapScript = (snapUrl, clientKey) => {
  if (!snapUrl) return;
  const existingScript = document.getElementById('midtrans-snap-script');
  if (existingScript) {
    if (existingScript.src === snapUrl) return;
    existingScript.remove();
  }
  const script = document.createElement('script');
  script.id = 'midtrans-snap-script';
  script.src = snapUrl;
  if (clientKey) {
    script.setAttribute('data-client-key', clientKey);
  }
  script.async = true;
  document.body.appendChild(script);
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

  // State Midtrans Snap
  const [midtransLoading, setMidtransLoading] = useState(false);
  const [snapToken, setSnapToken] = useState(null);
  const [snapRedirectUrl, setSnapRedirectUrl] = useState(null);
  const [isProduction, setIsProduction] = useState(false);

  // Countdown timer state (simulasi 30 menit)
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  // Fetch data invoice pesanan
  const fetchInvoice = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await paymentGatewayService.getInvoice(orderId);
      if (res?.data) {
        setOrder(res.data.order);
        setPaymentMethod(res.data.payment_method || res.data.order?.payment_method);
        setIsProduction(Boolean(res.data.midtrans?.is_production));
        if (res.data.midtrans?.snap_js) {
          loadSnapScript(res.data.midtrans.snap_js, res.data.midtrans.client_key);
        }
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

  // Real-time auto-polling: Pantau status pembayaran otomatis setiap 2.5 detik
  // Begitu transaksi diselesaikan di HP / simulator, layar otomatis berganti ke LUNAS
  useEffect(() => {
    if (!orderId || order?.status_pembayaran === 'lunas') return;

    const interval = setInterval(async () => {
      try {
        const res = await paymentGatewayService.getInvoice(orderId);
        if (res?.data?.order?.status_pembayaran === 'lunas') {
          setOrder(res.data.order);
          clearInterval(interval);
        }
      } catch (e) {
        // silent fail during background polling
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [orderId, order?.status_pembayaran]);

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

  // Pemicu Jendela Pembayaran Otomatis Midtrans Snap
  const handleOpenSnapPayment = async () => {
    if (!orderId) return;
    setMidtransLoading(true);
    setErrorMsg('');

    try {
      const res = await paymentGatewayService.createMidtransToken(orderId);
      if (res?.is_lunas) {
        setOrder(prev => ({ ...prev, status_pembayaran: 'lunas' }));
        return;
      }

      if (res?.token) {
        setSnapToken(res.token);
        setSnapRedirectUrl(res.redirect_url);

        // Jika Snap script sudah siap di browser
        if (window.snap && typeof window.snap.pay === 'function') {
          window.snap.pay(res.token, {
            onSuccess: async (result) => {
              console.log('Payment Success:', result);
              await handlePayNow(`Midtrans Otomatis (${result?.payment_type || 'Online'})`);
            },
            onPending: (result) => {
              console.log('Payment Pending:', result);
              fetchInvoice();
            },
            onError: (result) => {
              console.error('Payment Error:', result);
              setErrorMsg('Transaksi dibatalkan atau terkendala.');
            },
            onClose: () => {
              console.log('Payment Window Closed');
            }
          });
        } else if (res.redirect_url) {
          // Fallback jika browser memblokir iframe: buka tab baru
          window.open(res.redirect_url, '_blank');
        }
      } else {
        throw new Error(res?.message || 'Gagal memuat sesi pembayaran.');
      }
    } catch (err) {
      console.error('Snap trigger error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Gagal memanggil gerbang pembayaran.');
    } finally {
      setMidtransLoading(false);
    }
  };

  // Cek apakah metode pembayaran adalah COD
  const methodName = (paymentMethod?.nama_metode || order?.motode_pembayaran || order?.metode_pembayaran || '').toLowerCase();
  const isCod = methodName.includes('cod') || methodName.includes('tunai') || methodName.includes('tempat');

  // Auto-open Midtrans Snap popup ketika pertama kali masuk ke halaman jika order belum lunas dan bukan COD
  const autoTriggeredRef = useRef(false);
  useEffect(() => {
    if (order && !isCod && order.status_pembayaran !== 'lunas' && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      const timer = setTimeout(() => {
        handleOpenSnapPayment();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [order, isCod]);

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
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FBF9F6] border border-borderMuted/40 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-playfair font-bold text-lg text-gray-900">
                Payment Gateway Otomatis
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Verifikasi Otomatis 24/7
              </span>
            </div>
            <p className="text-[11px] text-textMuted">
              {shopProfile?.nama_toko || 'Intan Buket Madiun'} • Transaksi Aman, Cepat & Terenkripsi
            </p>
          </div>
        </div>

        {/* Status / Expiration Badge */}
        {!isLunas && !isCod && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Batas Pembayaran: </span>
            <span className="font-mono font-bold text-amber-800 text-sm tracking-wider">
              {formatTimer(timeLeft)}
            </span>
          </div>
        )}
      </div>

      {/* Main Payment Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Transaction & Automatic Payment Interface */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. SUCCESS STATE (Otomatis Aktif Begitu Pembayaran Berhasil) */}
          {isLunas ? (
            <div className="bg-white rounded-3xl border border-emerald-200 shadow-soft p-6 sm:p-8 text-center space-y-5 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                  Lunas Terverifikasi Otomatis
                </span>
                <h2 className="font-playfair font-bold text-2xl text-gray-900">
                  Pembayaran Berhasil!
                </h2>
                <p className="text-xs text-textMuted max-w-sm mx-auto">
                  Terima kasih, pembayaran Anda telah berhasil diterima dan diverifikasi secara instan oleh sistem. Rangkaian buket Anda segera dipersiapkan oleh florist.
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
                  <span className="font-semibold text-gray-900">{order.motode_pembayaran || 'QRIS Otomatis'}</span>
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
            /* 2. UNPAID / READY TO PAY STATE */
            <div className="bg-white rounded-3xl border border-borderMuted/40 shadow-soft p-6 sm:p-8 space-y-6">
              
              {/* Total Tagihan Card */}
              <div className="bg-gradient-to-r from-primary to-[#701524] text-white p-5 rounded-2xl shadow-soft space-y-2">
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
                  *Nominal tagihan sudah otomatis terkunci di barcode QRIS (pembeli tidak perlu mengetik nominal).
                </p>
              </div>

              {/* JIKA COD (BAYAR DI TEMPAT) */}
              {isCod ? (
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-playfair font-bold text-lg text-gray-900">
                      Metode Pembayaran COD (Bayar di Tempat)
                    </h4>
                    <p className="text-xs text-textMuted max-w-md mx-auto mt-1 leading-relaxed">
                      Pesanan Anda akan langsung dipersiapkan oleh Florist Intan Buket. Siapkan uang tunai sejumlah <strong>{formatRupiah(order?.total_harga)}</strong> saat kurir mengantarkan pesanan atau saat Anda mengambil buket di butik.
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
              ) : (
                /* JIKA ONLINE: POP-UP MIDTRANS SNAP OTOMATIS */
                <div className="border border-borderMuted/60 rounded-3xl p-6 bg-[#FBF9F6] space-y-5">
                  <div className="flex items-start justify-between border-b border-borderMuted/30 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-gray-900">
                          Pembayaran Otomatis Pop-Up
                        </h4>
                        <p className="text-[11px] text-textMuted">
                          Scan QRIS Otomatis (GoPay, ShopeePay, DANA) & Transfer Bank (BRI, BCA)
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Real-Time
                    </span>
                  </div>

                  {/* Channel Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200">QRIS (GoPay / ShopeePay / DANA)</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200">Bank BRI</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-gray-200">Bank BCA</span>
                  </div>

                  {/* Auto-Detection Notification Box */}
                  <div className="bg-white p-4 rounded-2xl border border-borderMuted/40 text-xs text-gray-700 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                      <span>Nominal Terisi Otomatis & Verifikasi Real-Time:</span>
                    </div>
                    <p className="text-[11px] text-textMuted leading-relaxed">
                      Klik tombol di bawah untuk membuka jendela pembayaran resmi. Saat QRIS di-scan di HP, <strong>nominal tagihan otomatis muncul tanpa perlu diketik manual</strong>. Layar ini akan <strong>otomatis berubah menjadi Lunas</strong> detik itu juga begitu Anda selesai membayar.
                    </p>
                  </div>

                  {/* Main Action Button: Opens Snap Popup */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      disabled={midtransLoading}
                      onClick={handleOpenSnapPayment}
                      className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2.5 shadow-elevated transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                    >
                      {midtransLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Mempersiapkan Jendela Pembayaran...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 text-amber-300" />
                          <span>Bayar Sekarang (Buka Jendela Pembayaran)</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {snapRedirectUrl && (
                      <a
                        href={snapRedirectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 text-center text-[11px] text-secondary hover:text-primary underline block transition-colors font-medium"
                      >
                        Buka Halaman Pembayaran di Tab Baru &rarr;
                      </a>
                    )}
                  </div>

                  {/* Sandbox helper box untuk pengujian di localhost */}
                  {!isProduction && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-amber-950 block">Uji Coba Pengembang (Mode Sandbox):</span>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Karena masih di mode Sandbox, scan langsung dari HP asli akan ditolak oleh bank (karena belum Production). Untuk menguji alur lunas otomatis, klik tombol instan di bawah:
                          </p>
                        </div>
                      </div>

                      <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handlePayNow('Simulasi QRIS Sandbox')}
                          className="flex-1 py-2.5 px-3 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Simulasikan Bayar Lunas (Instan)</span>
                        </button>

                        <a
                          href="https://simulator.sandbox.midtrans.com/qris/index"
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-3 bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                          <span>Simulator Midtrans</span>
                        </a>
                      </div>
                    </div>
                  )}

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
              <button type="button" className="text-textMuted cursor-pointer">
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
                    <span>Total Tagihan</span>
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
              Jika mengalami kendala transfer atau membutuhkan informasi pesanan, hubungi layanan pelanggan kami.
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
    </div>
  );
};

export default PaymentGatewayPage;
