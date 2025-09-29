<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnnoncePhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'annonce_id',
        'photo_path',
        'is_main',
    ];

    protected $casts = [
        'is_main' => 'boolean',
    ];

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }
}
