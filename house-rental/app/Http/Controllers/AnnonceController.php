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
        $query = Annonce::with(['photos', 'user:id,first_name,last_name'])
            ->where("status", "approved")->get();

        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }

        if ($request->has('minPrice') && $request->minPrice !== '') {
            $query->where('price', '>=', $request->minPrice);
        }

        if ($request->has('maxPrice') && $request->maxPrice !== '') {
            $query->where('price', '<=', $request->maxPrice);
        }

        if ($request->has('rooms') && $request->rooms !== '') {
            $query->where('rooms', $request->rooms);
        }

        if ($request->has('minSurface') && $request->minSurface !== '') {
            $query->where('surface', '>=', $request->minSurface);
        }

        if ($request->has('maxSurface') && $request->maxSurface !== '') {
            $query->where('surface', '<=', $request->maxSurface);
        }

        if ($request->has('is_furnished') && $request->is_furnished) {
            $query->where('is_furnished', true);
        }

        if ($request->has('has_wifi') && $request->has_wifi) {
            $query->where('has_wifi', true);
        }

        if ($request->has('has_parking') && $request->has_parking) {
            $query->where('has_parking', true);
        }

        $annonces = $query;

        return response()->json($annonces);
    }

    public function university()
    {
        $universities = [
            [
                'id' => 1,
                'name' => 'University of Tunis',
                'latitude' => 36.8000,
                'longitude' => 10.1800,
                'address' => 'Tunis, Tunisia'
            ],
            [
                'id' => 2,
                'name' => 'University of Carthage',
                'latitude' => 36.8500,
                'longitude' => 10.3300,
                'address' => 'Carthage, Tunisia'
            ],
            [
                'id' => 3,
                'name' => 'University of Sfax',
                'latitude' => 34.7400,
                'longitude' => 10.7600,
                'address' => 'Sfax, Tunisia'
            ],
            // Ajoutez d'autres universités...
        ];

        return response()->json($universities);
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
