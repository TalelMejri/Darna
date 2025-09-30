<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\AnnoncePhoto;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class OwnerController extends Controller
{
    // Get owner's annonces
    public function myAnnonces(Request $request)
    {
        $user = $request->user();

        // Chargez seulement les relations photos et mainPhoto, pas feedbacks
        $annonces = Annonce::with(['photos', 'mainPhoto'])
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        return response()->json($annonces);
    }

    // Create new annonce
    public function storeAnnonce(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'price' => 'required|numeric|min:0',
            'surface' => 'required|integer|min:1',
            'rooms' => 'required|integer|min:1',
            'bathrooms' => 'required|integer|min:1',
            'type' => 'required|in:studio,apartment,house,room',
            'is_furnished' => 'required|boolean',
            'has_kitchen' => 'required|boolean',
            'has_wifi' => 'required|boolean',
            'has_parking' => 'required|boolean',
            'roommate_gender_preference' => 'nullable|in:male,female,any',
            'available_from' => 'required|date',
            'photos' => 'required|array|min:1|max:10',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Convert string booleans to actual booleans if needed
        $isFurnished = filter_var($request->is_furnished, FILTER_VALIDATE_BOOLEAN);
        $hasKitchen = filter_var($request->has_kitchen, FILTER_VALIDATE_BOOLEAN);
        $hasWifi = filter_var($request->has_wifi, FILTER_VALIDATE_BOOLEAN);
        $hasParking = filter_var($request->has_parking, FILTER_VALIDATE_BOOLEAN);

        // Create annonce
        $annonce = Annonce::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'address' => $request->address,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'price' => $request->price,
            'surface' => $request->surface,
            'rooms' => $request->rooms,
            'bathrooms' => $request->bathrooms,
            'type' => $request->type,
            'is_furnished' => $isFurnished,
            'has_kitchen' => $hasKitchen,
            'has_wifi' => $hasWifi,
            'has_parking' => $hasParking,
            'roommate_gender_preference' => $request->roommate_gender_preference,
            'status' => 'pending',
            'available_from' => $request->available_from,
        ]);

        // Upload photos (same as before)
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('annonces', 'public');

                AnnoncePhoto::create([
                    'annonce_id' => $annonce->id,
                    'photo_path' => $path,
                    'is_main' => $index === 0
                ]);
            }
        }

        // Create notification for admin (same as before)
        Notification::create([
            'user_id' => 1,
            'title' => 'New Annonce Created',
            'message' => $user->first_name . ' ' . $user->last_name . ' created a new annonce: ' . $annonce->title,
            'type' => 'info',
            'data' => [
                'annonce_id' => $annonce->id,
                'owner_id' => $user->id,
                'action' => 'annonce_created'
            ]
        ]);

        return response()->json([
            'message' => 'Annonce created successfully and is pending approval',
            'annonce' => $annonce->load('photos')
        ], 201);
    }
    // Update annonce
    public function updateAnnonce(Request $request, Annonce $annonce)
    {
        // Check if user owns this annonce
        if ($annonce->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'address' => 'sometimes|required|string|max:500',
            'latitude' => 'sometimes|required|numeric',
            'longitude' => 'sometimes|required|numeric',
            'price' => 'sometimes|required|numeric|min:0',
            'surface' => 'sometimes|required|integer|min:1',
            'rooms' => 'sometimes|required|integer|min:1',
            'bathrooms' => 'sometimes|required|integer|min:1',
            'type' => 'sometimes|required|in:studio,apartment,house,room',
            'is_furnished' => 'boolean',
            'has_kitchen' => 'boolean',
            'has_wifi' => 'boolean',
            'has_parking' => 'boolean',
            'roommate_gender_preference' => 'nullable|in:male,female,any',
            'available_from' => 'sometimes|required|date',
            'photos' => 'sometimes|array|min:1|max:10',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Update annonce
        $annonce->update($request->only([
            'title',
            'description',
            'address',
            'latitude',
            'longitude',
            'price',
            'surface',
            'rooms',
            'bathrooms',
            'type',
            'is_furnished',
            'has_kitchen',
            'has_wifi',
            'has_parking',
            'roommate_gender_preference',
            'available_from'
        ]));

        // Reset status to pending if updated
        if ($annonce->status !== 'pending') {
            $annonce->update(['status' => 'pending']);
        }

        // Upload new photos if provided
        if ($request->hasFile('photos')) {
            // Delete old photos
            foreach ($annonce->photos as $photo) {
                Storage::disk('public')->delete($photo->photo_path);
                $photo->delete();
            }

            // Upload new photos
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('annonces', 'public');

                AnnoncePhoto::create([
                    'annonce_id' => $annonce->id,
                    'photo_path' => $path,
                    'is_main' => $index === 0
                ]);
            }
        }

        // Create notification for admin
        Notification::create([
            'user_id' => 1, // Admin user ID
            'title' => 'Annonce Updated',
            'message' => $request->user()->first_name . ' ' . $request->user()->last_name . ' updated their annonce: ' . $annonce->title,
            'type' => 'info',
            'data' => [
                'annonce_id' => $annonce->id,
                'owner_id' => $request->user()->id,
                'action' => 'annonce_updated'
            ]
        ]);

        return response()->json([
            'message' => 'Annonce updated successfully and is pending re-approval',
            'annonce' => $annonce->load('photos')
        ]);
    }

    // Delete annonce
    public function deleteAnnonce(Request $request, Annonce $annonce)
    {
        // Check if user owns this annonce
        if ($annonce->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete photos from storage
        foreach ($annonce->photos as $photo) {
            Storage::disk('public')->delete($photo->photo_path);
        }

        // Delete annonce
        $annonce->delete();

        // Create notification for admin
        Notification::create([
            'user_id' => 1, // Admin user ID
            'title' => 'Annonce Deleted',
            'message' => $request->user()->first_name . ' ' . $request->user()->last_name . ' deleted their annonce: ' . $annonce->title,
            'type' => 'warning',
            'data' => [
                'annonce_id' => $annonce->id,
                'owner_id' => $request->user()->id,
                'action' => 'annonce_deleted'
            ]
        ]);

        return response()->json(['message' => 'Annonce deleted successfully']);
    }

    // Get annonce statistics for owner
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        $stats = [
            'total_annonces' => Annonce::byOwner($user->id)->count(),
            'approved_annonces' => Annonce::byOwner($user->id)->approved()->count(),
            'pending_annonces' => Annonce::byOwner($user->id)->pending()->count(),
            'rejected_annonces' => Annonce::byOwner($user->id)->rejected()->count(),
        ];

        return response()->json($stats);
    }

    public function show($id)
    {
        try {
            // Chargez seulement les relations existantes
            $annonce = Annonce::with([
                'photos',
                'user:id,first_name,last_name,email,phone'
                // Supprimez 'feedbacks' de la liste
            ])
                ->approved()
                ->findOrFail($id);

            return response()->json($annonce);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Annonce not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error loading annonce'], 500);
        }
    }
}
