<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Signal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function dashboardStats()
    {
        $stats = [
            'total_users' => User::count(),
            'total_annonces' => Annonce::count(),
            'pending_annonces' => Annonce::pending()->count(),
            'total_reservations' => \App\Models\Reservation::count(),
            'pending_signals' => Signal::pending()->count(),
        ];

        return response()->json($stats);
    }

    public function pendingAnnonces()
    {
        $annonces = Annonce::with(['user', 'photos'])
            ->pending()
            ->latest()
            ->paginate(10);

        return response()->json($annonces);
    }

    public function updateAnnonceStatus(Request $request, Annonce $annonce)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $annonce->update(['status' => $request->status]);

        // Create notification for proprietaire
        \App\Models\Notification::create([
            'user_id' => $annonce->user_id,
            'title' => 'Annonce Status Updated',
            'message' => 'Your annonce "' . $annonce->title . '" has been ' . $request->status,
            'type' => 'system',
            'data' => ['annonce_id' => $annonce->id],
        ]);

        return response()->json($annonce);
    }

    public function pendingSignals()
    {
        $signals = Signal::with(['user', 'annonce.photos'])
            ->pending()
            ->latest()
            ->paginate(10);

        return response()->json($signals);
    }

    public function updateSignalStatus(Request $request, Signal $signal)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:resolved,dismissed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $signal->update(['status' => $request->status]);

        return response()->json($signal);
    }

    public function users()
    {
        $users = User::where('role', '!=', 'admin')->latest()->paginate(15);
        return response()->json($users);
    }

    public function updateUserStatus(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'is_verified' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update(['is_verified' => $request->is_verified]);

        return response()->json($user);
    }


    public function destroyUser(User $user){
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
