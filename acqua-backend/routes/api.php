<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminOnlyMiddleware;
use App\Http\Middleware\CheckAuthResponseMiddleware;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\ServiciosController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\DireccionController;

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

Route::middleware(CheckAuthResponseMiddleware::class)->group(function () {
    Route::apiResource('catalogos', CatalogoController::class)->only('index', 'show'); //para Empleados
    Route::apiResource('servicios', ServiciosController::class)->only('index', 'show'); //para Empleados
});

Route::middleware(['auth:api', AdminOnlyMiddleware::class])->group(function () {
    Route::apiResource('catalogos', CatalogoController::class)->except('index', 'show'); // CRUD CATALOGOS
    Route::apiResource('servicios', ServiciosController::class)->except('index', 'show'); // CRUD SERVICIOS
});

Route::middleware(CheckAuthResponseMiddleware::class)->group(function () {
    Route::apiResource('direcciones', DireccionController::class); // CRUD DIRECCIONES
    Route::apiResource('clientes', ClienteController::class); // CRUD CLIENTE
    // Rutas para buscar Clientes por Nombre y Telefono
    Route::post('/clientes/nombre', [ClienteController::class,'buscarPorNombre'])
        ->name('clientes.buscarPorNombre');
    Route::post('/clientes/telefono', [ClienteController::class,'buscarPorTelefono'])
        ->name('clientes.buscarPorTelefono');
});

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// Middleware para Administrador CRUD Admin,Empledos
Route::middleware(['auth:api', AdminOnlyMiddleware::class])->group(function () {
    Route::resource('/admin/dashboard', UserController::class);
});
// Rutas para Iniciar Sesion
Route::post('login', [AuthController::class, 'login'])
    ->middleware(['throttle'])
    ->name('login');

Route::post('logout', [AuthController::class, 'logout'])
    ->name('logout');
