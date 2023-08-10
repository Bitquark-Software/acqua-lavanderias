<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Middleware\AdminOnlyMiddleware;
use App\Http\Controllers\CatalogoController;
use App\Http\Controllers\ServiciosController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ComentarioController;
use App\Http\Controllers\DireccionController;
use App\Http\Controllers\LavadoraController;
use App\Http\Controllers\PrendaController;
use App\Http\Controllers\PrendasTicketController;
use App\Http\Controllers\SecadoraController;
use App\Http\Controllers\ProcesoController;
use App\Http\Controllers\SucursalController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\ProcesoTicketController;

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

Route::middleware('auth:api')->group(function () { // Para Empleados
    Route::apiResource('catalogos', CatalogoController::class)->only('index', 'show'); 
    Route::apiResource('servicios', ServiciosController::class)->only('index', 'show');
    Route::apiResource('prendas', PrendaController::class)->only('index', 'show'); 
});

Route::middleware(['auth:api',AdminOnlyMiddleware::class])->group(function () {
    Route::apiResource('catalogos', CatalogoController::class)->except('index', 'show'); // CRUD CATALOGOS
    Route::apiResource('servicios', ServiciosController::class)->except('index', 'show'); // CRUD SERVICIOS
    Route::apiResource('prendas', PrendaController::class)->except('index', 'show'); // CRUD PRENDAS
});

Route::middleware('auth:api')->group(function () {
    Route::apiResource('direcciones', DireccionController::class); // CRUD DIRECCIONES
    Route::apiResource('clientes', ClienteController::class); // CRUD CLIENTE
    // Rutas para buscar Clientes por Nombre y Telefono
    Route::post('/clientes/nombre', [ClienteController::class,'buscarPorNombre'])
        ->name('clientes.buscarPorNombre');
    Route::post('/clientes/telefono', [ClienteController::class,'buscarPorTelefono'])
        ->name('clientes.buscarPorTelefono');
});

Route::middleware('auth:api')->group( function () {
    Route::post('/comentario', [ComentarioController::class, 'store'])->name('comentarios.store');

    Route::apiResource('tickets', TicketController::class)->only('index', 'show', 'store');

    Route::get('/prendas_tickets', [PrendasTicketController::class, 'index'])->name('prendasticket.index');
    Route::post('/prendas_tickets', [PrendasTicketController::class, 'store'])->name('prendasticket.store');

    Route::apiResource('lavadoras', LavadoraController::class)->only('index', 'show', 'store');

    Route::apiResource('secadoras', SecadoraController::class)->only('index', 'show', 'store');

    Route::get('/proceso', [ProcesoController::class, 'index'])->name('proceso.index');
    Route::post('/proceso', [ProcesoController::class, 'store'])->name('proceso.store');

    Route::apiResource('proceso-tickets', ProcesoTicketController::class)->except('destroy');
});

Route::middleware(['auth:api', AdminOnlyMiddleware::class])->group( function () {
    Route::apiResource('sucursales', SucursalController::class);

    Route::apiResource('tickets', TicketController::class)->except('index', 'show', 'store');

    Route::apiResource('lavadoras', LavadoraController::class)->except('index', 'show', 'store');

    Route::apiResource('secadoras', SecadoraController::class)->except('index', 'show', 'store');
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
