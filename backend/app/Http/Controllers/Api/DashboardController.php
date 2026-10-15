<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Pelanggan;
use App\Models\Product;

class DashboardController extends Controller
{
    public function stats()
    {
        $totalRevenue = Order::where('status_pembayaran', 'lunas')->sum('total_harga');
        $pendingOrders = Order::where('status_pesanan', 'baru')->count();
        $totalProducts = Product::count();
        $lowStockProducts = Product::where('stok', '<=', 5)->count();
        $totalCustomers = Pelanggan::count();

        $recentOrders = Order::with(['pelanggan', 'items.product'])
            ->orderBy('id_pesanan', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'total_revenue' => (float) $totalRevenue,
            'pending_orders' => $pendingOrders,
            'total_products' => $totalProducts,
            'low_stock_products' => $lowStockProducts,
            'total_customers' => $totalCustomers,
            'recent_orders' => $recentOrders,
        ]);
    }
}
