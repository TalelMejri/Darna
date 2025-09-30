<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;
 protected $table = 'feedbacks';
    protected $fillable = [
        'user_id',
        'annonce_id',
        'reservation_id',
        'rating',
        'comment',
        'type',
    ];

     public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function scopeAnnonceFeedback($query)
    {
        return $query->where('type', 'annonce');
    }

    public function scopeUserFeedback($query)
    {
        return $query->where('type', 'user');
    }
}
