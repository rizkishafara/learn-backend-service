<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Product;
use App\Http\Controllers\ProductController;

// Route::get('/products', function () {
//     return response()->json(Product::all());
// });
Route::get('/test', function () {
    return ['message' => 'API works'];
});
