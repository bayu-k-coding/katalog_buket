<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'eKatalog Intan Buket REST API',
        'version' => '1.0.0',
        'framework' => 'Laravel 12',
        'status' => 'online',
        'api_documentation' => [
            'products' => url('/api/products'),
            'categories' => url('/api/categories'),
            'shop_profile' => url('/api/shop-profile'),
            'payment_methods' => url('/api/payment-methods')
        ]
    ]);
});
