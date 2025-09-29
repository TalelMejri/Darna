<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'annonce_id',
        'start_date',
        'end_date',
        'total_price',
        'nbr_persons',
        'still_nbr_persons',
        'status',
        'message',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_price' => 'decimal:2',
        'nbr_persons' => 'integer',
        'still_nbr_persons' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }

    public function feedback()
    {
        return $this->hasOne(Feedback::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    // Methods for roommate system
    public function hasAvailableSpots()
    {
        return $this->still_nbr_persons > 0;
    }

    public function decrementSpots()
    {
        if ($this->still_nbr_persons > 0) {
            $this->decrement('still_nbr_persons');
        }
    }

    public function incrementSpots()
    {
        if ($this->still_nbr_persons < $this->nbr_persons) {
            $this->increment('still_nbr_persons');
        }
    }

    // Calculate total price based on number of persons
    public function calculateTotalPrice($pricePerPerson, $days)
    {
        return $pricePerPerson * $this->nbr_persons * $days;
    }
}
