<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Notification;
use App\Models\Reservation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReservationController extends Controller
{
     public function index(Request $request)
    {
        $user = $request->user();

        if ($user->isProprietaire()) {
            $reservations = Reservation::with(['user', 'annonce.photos'])
                ->whereHas('annonce', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->latest()
                ->paginate(10);
        } else {
            $reservations = Reservation::with(['annonce.photos'])
                ->where('user_id', $user->id)
                ->latest()
                ->paginate(10);
        }

        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'annonce_id' => 'required|exists:annonces,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'message' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $annonce = Annonce::findOrFail($request->annonce_id);

        // Check if annonce is available
        if ($annonce->status !== 'approved') {
            return response()->json(['message' => 'This annonce is not available for reservation'], 400);
        }

        // Check for overlapping reservations
        $overlapping = Reservation::where('annonce_id', $annonce->id)
            ->where('status', 'confirmed')
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_date', '<=', $request->start_date)
                            ->where('end_date', '>=', $request->end_date);
                    });
            })->exists();

        if ($overlapping) {
            return response()->json(['message' => 'The selected dates are not available'], 400);
        }

        // Calculate total price
        $days = (strtotime($request->end_date) - strtotime($request->start_date)) / (60 * 60 * 24);
        $totalPrice = $annonce->price * $days;

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'annonce_id' => $annonce->id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'total_price' => $totalPrice,
            'message' => $request->message,
        ]);

        // Create notification for proprietaire
        Notification::create([
            'user_id' => $annonce->user_id,
            'title' => 'New Reservation Request',
            'message' => 'You have a new reservation request for: ' . $annonce->title,
            'type' => 'reservation',
            'data' => ['reservation_id' => $reservation->id],
        ]);

        $reservation->load(['annonce.photos']);

        return response()->json($reservation, 201);
    }

    public function updateStatus(Request $request, Reservation $reservation)
    {
        if ($reservation->annonce->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:confirmed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reservation->update(['status' => $request->status]);

        // Create notification for tenant
        Notification::create([
            'user_id' => $reservation->user_id,
            'title' => 'Reservation Status Updated',
            'message' => 'Your reservation for ' . $reservation->annonce->title . ' has been ' . $request->status,
            'type' => 'reservation',
            'data' => ['reservation_id' => $reservation->id],
        ]);

        return response()->json($reservation);
    }

    public function show(Reservation $reservation)
    {
        $reservation->load(['user', 'annonce.photos', 'annonce.user']);

        return response()->json($reservation);
    }
}
