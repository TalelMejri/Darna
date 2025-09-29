<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Signal extends Model
{
    use HasFactory;

        // protected $fillable = [
        //     'user_id',
        //     'annonce_id',
        //     'reason',
        //     'description',
        //     'status',
        // ];
        protected $guarded = [];
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
