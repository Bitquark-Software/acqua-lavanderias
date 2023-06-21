<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\ServiciosController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminOnlyMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::apiResource('catalogos', CatalogoController::class); // CRUD CATALOGOS
Route::apiResource('servicios', ServiciosController::class); // CRUD SERVICIOS

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('login', [AuthController::class, 'login'])
    ->middleware(['throttle'])
    ->name('login');

Route::post('logout', [AuthController::class, 'logout'])
    ->name('logout');
Route::middleware(['auth:api', AdminOnlyMiddleware::class])->group(function () {
    Route::resource('/admin/dashboard', UserController::class);
});
