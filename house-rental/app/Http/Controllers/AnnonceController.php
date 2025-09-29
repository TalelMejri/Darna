<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Validator;
use App\Models\Annonce;
use App\Models\AnnoncePhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AnnonceController extends Controller
{
    public function index(Request $request)
    {
        $query = Annonce::with(['photos', 'user'])->approved();

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by rooms
        if ($request->has('rooms')) {
            $query->where('rooms', '>=', $request->rooms);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by location
        if ($request->has(['latitude', 'longitude', 'radius'])) {
            $query->nearby($request->latitude, $request->longitude, $request->radius);
        }

        // Search by title or description
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $annonces = $query->paginate(12);

        return response()->json($annonces);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'price' => 'required|numeric|min:0',
            'surface' => 'required|integer|min:1',
            'rooms' => 'required|integer|min:1',
            'bathrooms' => 'required|integer|min:1',
            'type' => 'required|in:apartment,house,studio,room',
            'is_furnished' => 'boolean',
            'has_kitchen' => 'boolean',
            'has_wifi' => 'boolean',
            'has_parking' => 'boolean',
            'available_from' => 'required|date',
            'photos' => 'required|array|min:1',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $annonce = Annonce::create(array_merge(
            $request->except('photos'),
            ['user_id' => $request->user()->id]
        ));

        // Handle photos upload
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $index => $photo) {
                $path = $photo->store('annonces', 'public');

                AnnoncePhoto::create([
                    'annonce_id' => $annonce->id,
                    'photo_path' => $path,
                    'is_main' => $index === 0,
                ]);
            }
        }

        $annonce->load('photos');

        return response()->json($annonce, 201);
    }

    public function show(Annonce $annonce)
    {
        $annonce->load(['photos', 'user', 'feedbacks.user']);

        return response()->json($annonce);
    }

    public function update(Request $request, Annonce $annonce)
    {
        if ($annonce->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'address' => 'sometimes|string',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'price' => 'sometimes|numeric|min:0',
            'surface' => 'sometimes|integer|min:1',
            'rooms' => 'sometimes|integer|min:1',
            'bathrooms' => 'sometimes|integer|min:1',
            'type' => 'sometimes|in:apartment,house,studio,room',
            'is_furnished' => 'boolean',
            'has_kitchen' => 'boolean',
            'has_wifi' => 'boolean',
            'has_parking' => 'boolean',
            'available_from' => 'sometimes|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $annonce->update($request->all());

        return response()->json($annonce);
    }

    public function destroy(Request $request, Annonce $annonce)
    {
        if ($annonce->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete photos from storage
        foreach ($annonce->photos as $photo) {
            Storage::disk('public')->delete($photo->photo_path);
        }

        $annonce->delete();

        return response()->json(['message' => 'Annonce deleted successfully']);
    }

    public function myAnnonces(Request $request)
    {
        $annonces = Annonce::with('photos')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($annonces);
    }
}
