<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\NotifController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\SignalController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Annonces
    Route::get('/annonces', [AnnonceController::class, 'index']);
    Route::get('/annonces/{annonce}', [AnnonceController::class, 'show']);
    Route::post('/annonces', [AnnonceController::class, 'store']);
    Route::put('/annonces/{annonce}', [AnnonceController::class, 'update']);
    Route::delete('/annonces/{annonce}', [AnnonceController::class, 'destroy']);
    Route::get('/my-annonces', [AnnonceController::class, 'myAnnonces']);

    // Reservations
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservations/{reservation}', [ReservationController::class, 'show']);
    Route::put('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);

    // Signals
    // Route::post('/signals', [SignalController::class, 'store']);
    // Route::get('/my-signals', [SignalController::class, 'mySignals']);

    // Chat
    // Route::get('/chats', [ChatController::class, 'index']);
    // Route::get('/chats/{userId}', [ChatController::class, 'getOrCreateChat']);
    // Route::get('/chats/{chat}/messages', [ChatController::class, 'getMessages']);
    // Route::post('/chats/{chat}/messages', [ChatController::class, 'sendMessage']);

    // Notifications
    // Route::get('/notifications', [NotificationController::class, 'index']);
    // Route::put('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    // Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Feedback
    // Route::post('/feedback', [FeedbackController::class, 'store']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'dashboardStats']);
        Route::get('/pending-annonces', [AdminController::class, 'pendingAnnonces']);
        Route::put('/annonces/{annonce}/status', [AdminController::class, 'updateAnnonceStatus']);
        Route::get('/pending-signals', [AdminController::class, 'pendingSignals']);
        Route::put('/signals/{signal}/status', [AdminController::class, 'updateSignalStatus']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{user}/status', [AdminController::class, 'updateUserStatus']);
    });


    Route::get('/notifications', [NotifController::class, 'index']);
    Route::put('/notifications/{notification}/read', [NotifController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotifController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotifController::class, 'destroy']);
});
