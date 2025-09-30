<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Annonce extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'price' => 'decimal:2',
        'is_furnished' => 'boolean',
        'has_kitchen' => 'boolean',
        'has_wifi' => 'boolean',
        'has_parking' => 'boolean',
        'available_from' => 'date',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function photos()
    {
        return $this->hasMany(AnnoncePhoto::class);
    }

    // Ajoutez cette relation pour la photo principale
    public function mainPhoto()
    {
        return $this->hasOne(AnnoncePhoto::class)->oldestOfMany(); // Première photo comme photo principale
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function signals()
    {
        return $this->hasMany(Signal::class);
    }



    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class, 'user_id');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'approved')->where('available_from', '<=', now());
    }

    public function scopeNearby($query, $latitude, $longitude, $radius = 10)
    {
        $haversine = "(6371 * acos(cos(radians($latitude)) * cos(radians(latitude)) * cos(radians(longitude) - radians($longitude)) + sin(radians($latitude)) * sin(radians(latitude))))";

        return $query->select('*')
            ->selectRaw("$haversine AS distance")
            ->whereRaw("$haversine < ?", [$radius])
            ->orderBy('distance');
    }

    // Accessor pour la photo principale (fallback)
    public function getMainPhotoAttribute()
    {
        return $this->photos->first();
    }
}
