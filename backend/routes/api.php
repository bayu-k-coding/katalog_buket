<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentMethodController;
use App\Http\Controllers\Api\ShopProfileController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes — eKatalog Intan Buket
|--------------------------------------------------------------------------
*/

// ==========================================
// 1. Publik / Storefront (Tanpa Login)
// ==========================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

Route::get('/payment-methods', [PaymentMethodController::class, 'index']);
Route::get('/shop-profile', [ShopProfileController::class, 'show']);

// Checkout pesanan (dapat dilakukan publik / dengan customer session)
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders/{id}/upload-proof', [OrderController::class, 'uploadProof']);


// ==========================================
// 2. Pelanggan & Profil Terotentikasi
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);
    Route::put('/profile/password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/my-orders', [OrderController::class, 'customerOrders']);
});

// Fallback direct order endpoints for dev/preview testing
Route::get('/my-orders-preview', [OrderController::class, 'index']);


// ==========================================
// 3. Admin & Superadmin Backoffice
// ==========================================
Route::prefix('admin')->group(function () {
    Route::get('/stats', [DashboardController::class, 'stats']);

    // Manajemen Pesanan
    Route::get('/orders', [OrderController::class, 'index']);
    Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    Route::patch('/orders/{id}/payment', [OrderController::class, 'verifyPayment']);

    // Manajemen Produk
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);

    // Manajemen Kategori
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Manajemen Profil Toko
    Route::put('/shop-profile', [ShopProfileController::class, 'update']);
});

// ==========================================
// 4. Manajemen Pengguna (Superadmin Saja)
// ==========================================
Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/admin/users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::apiResource('admin/users', UserController::class);
});

// Also expose unscoped versions for flexible frontend direct calls
Route::get('/orders', [OrderController::class, 'index']);
Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::patch('/orders/{id}/payment', [OrderController::class, 'verifyPayment']);
Route::post('/products', [ProductController::class, 'store']);
Route::put('/products/{id}', [ProductController::class, 'update']);
Route::delete('/products/{id}', [ProductController::class, 'destroy']);
Route::post('/categories', [CategoryController::class, 'store']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);
Route::put('/shop-profile', [ShopProfileController::class, 'update']);
