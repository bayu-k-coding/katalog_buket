<?php

return [
    'server_key' => env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-18lCGy2EhiHSpt8jJ9Bl4B9C'),
    'client_key' => env('MIDTRANS_CLIENT_KEY', 'Mid-client-pDgZI-OMnkti_hva'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions',
    'snap_js' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',
];

