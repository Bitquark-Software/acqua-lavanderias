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
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\LavadoraController;
use App\Http\Controllers\PrendaController;
use App\Http\Controllers\PrendasTicketController;
use App\Http\Controllers\SecadoraController;
use App\Http\Controllers\ProcesoController;
use App\Http\Controllers\SucursalController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\ProcesoTicketController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\RepotDetalladoVetasController;
use App\Http\Controllers\ProdPersonalReportController;
use App\Http\Controllers\ProdSucursalReportController;
use App\Http\Controllers\AnticiposTicketsController;
use App\Http\Controllers\ServicioTicketController;
use App\Http\Controllers\CancelacionCodigoController;
use App\Http\Controllers\WhatsAppController;

// * Bloque de Encargado
Route::middleware('auth:api', 'role:administrador,encargado')->group(function () {
    Route::apiResource('catalogos', CatalogoController::class)->only('index', 'store', 'show', 'update');
    Route::apiResource('servicios', ServiciosController::class)->only('index', 'store', 'show', 'update');
    // Bloque de Reportes
    Route::prefix('stats')->group(function () {
        // Generacion de Reporte General de Ventas PDF
        Route::post('/reporte-general-ventas-pdf', [StatsController::class, 'repGenVentPdf'])->name('stats.rep-gen-vent-Pdf');
        // Generacion de Reporte de Produccion PDF
        Route::post('/reporte-produccion-pdf', [ProdSucursalReportController::class, 'repProdPdf'])->name('stats.rep-prod-pdf');
    });
});

// * Bloque de cajero y algunos de Encargado
Route::middleware('auth:api', 'role:administrador,encargado,cajero')->group(function () {

    Route::apiResource('tickets', TicketController::class);


    // Rutas para buscar Clientes por Nombre y Telefono
    Route::post('/clientes/nombre', [ClienteController::class, 'buscarPorNombre'])
        ->name('clientes.buscarPorNombre');
    Route::post('/clientes/telefono', [ClienteController::class, 'buscarPorTelefono'])
        ->name('clientes.buscarPorTelefono');

    // Catalogos y Servicios
    Route::apiResource('catalogos', CatalogoController::class)->only('index', 'show');
    Route::apiResource('servicios', ServiciosController::class)->only('index', 'show');

    // Agrega las lavadoras extras para ropa de color

    Route::prefix('stats')->middleware('auth:api', 'role:administrador,encargado,cajero')->group(function () {
        // Tracks Tickets
        Route::get('/tracks/{ticket_id}', [StatsController::class, 'statsTracks'])->name('stats.tracks');
    });
});

// * Bloque de Operativo
Route::middleware('auth:api', 'role:administrador,encargado,cajero,operativo')->group(function () {
    Route::get('/anticipoTickets', [AnticiposTicketsController::class, 'index'])->name('anticipo.index');
    Route::post('/anticipoTickets', [AnticiposTicketsController::class, 'store'])->name('anticipo.store'); // * COBRAR ANTICIPOS

    // Agrega las lavadoras extras para ropa de color
    Route::post('lavadora-secadora-adicional', [ProcesoTicketController::class, 'addLavadorasSecadoras'])->name('procesotickets.addLavSec');

    Route::apiResource('lavadoras', LavadoraController::class)->only('index', 'show');
    Route::apiResource('secadoras', SecadoraController::class)->only('index', 'show');

    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('direcciones', DireccionController::class);

    Route::apiResource('sucursales', SucursalController::class)->only('index', 'show');

    Route::apiResource('prendas', PrendaController::class)->only('index', 'show');
    // Show Tickets
    Route::apiResource('tickets', TicketController::class)->only('index', 'show');
    // Verificar si tambien nececita el metodo Index en Tickets
    Route::apiResource('proceso-tickets', ProcesoTicketController::class)->except('destroy');

    Route::get('/proceso', [ProcesoController::class, 'index'])->name('proceso.index');

    Route::get('/prendas_tickets', [PrendasTicketController::class, 'index'])->name('prendasticket.index');
    Route::post('/prendas_tickets', [PrendasTicketController::class, 'store'])->name('prendasticket.store');
    Route::put('/prendas_tickets/{id}', [PrendasTicketController::class, 'update'])->name('prendasticket.update');
    Route::delete('/prendas_tickets/{id}', [PrendasTicketController::class, 'destroy'])->name('prendasticket.destroy');
});

// Administradores, Encargados y Cajeros
Route::middleware('auth:api', 'role:administrador,encargado,cajero')->group(function () {

    Route::apiResource('servicios-ticket', ServicioTicketController::class)->except('destroy');


    Route::post('/comentario', [ComentarioController::class, 'store'])->name('comentarios.store');
});

Route::middleware(['auth:api', 'role:administrador'])->group(function () {
    Route::apiResource('catalogos', CatalogoController::class)->except('index', 'store', 'show', 'update');
    Route::apiResource('servicios', ServiciosController::class)->except('index', 'store', 'show', 'update');

    Route::apiResource('sucursales', SucursalController::class)->except('index', 'show');
    Route::apiResource('prendas', PrendaController::class)->except('index', 'show');

    Route::post('/proceso', [ProcesoController::class, 'store'])->name('proceso.store');

    // Horarios por Sucursal
    Route::apiResource('horarios', HorarioController::class);

    // Generacion de Codigos de Cancelacion Tickets
    Route::apiResource('cancelacion_codigo', CancelacionCodigoController::class);
});

Route::middleware(['auth:api', 'role:administrador'])->group(function () {
    Route::apiResource('lavadoras', LavadoraController::class)->except('index', 'show');
    Route::apiResource('secadoras', SecadoraController::class)->except('index', 'show');
});

Route::prefix('stats')->middleware(['auth:api', 'role:administrador'])->group(function () {
    // Datos de Reportes
    Route::get('/ingresos', [StatsController::class, 'generateReport'])->name('stats.ingresos');
    // Clientes nuevos
    Route::get('/clientes', [ClienteController::class, 'statsClientes'])->name('stats.clientes');
    // Reportes General de Ventas
    Route::get('/reporte-general-ventas', [StatsController::class, 'reportGenVent'])->name('stats.reporte-general-ventas');
    // Generacion de Reporte Detallado PDF
    Route::post('/reporte-detallado-ventas-pdf', [RepotDetalladoVetasController::class, 'repDetPdf'])->name('stats.rep-deta-vent-pdf');
    // Generacion de Reporte de Usuarios PDF
    Route::post('/reporte-produccion-usuario-pdf', [ProdPersonalReportController::class, 'repProdUsuarioPdf'])->name('stats.rep-prod-usua-pdf');
});

Route::prefix('whatsapp')->group(function () {
    // Enviar mensaje
    Route::post('/enviar-mensaje-conteo', [WhatsAppController::class, 'mensajeConteo'])->name('whatsapp.mensaje-conteo');
    Route::post('/enviar-mensaje-entrega', [WhatsAppController::class, 'mensajeEntrega'])->name('whatsapp.mensaje-entrega');
});

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// Middleware para Administrador CRUD Admin,Empledos
Route::middleware(['auth:api', AdminOnlyMiddleware::class])->group(function () {
    Route::resource('/admin/dashboard', UserController::class);
});
// Rutas para Iniciar Sesion
Route::post('login', [AuthController::class, 'login'])->name('login');

Route::post('logout', [AuthController::class, 'logout'])
    ->name('logout');
