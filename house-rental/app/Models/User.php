<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // protected $fillable = [
    //     'name',
    //     'email',
    //     'password',
    //     'role',
    //     'phone',
    //     'address',
    //     'cin',
    //     'university',
    //     'student_id',
    //     'is_verified',
    // ];

    protected $guarded = [];
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_verified' => 'boolean',
    ];

    // Relationships
    public function annonces()
    {
        return $this->hasMany(Annonce::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function signals()
    {
        return $this->hasMany(Signal::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(Feedback::class);
    }

    // Scopes
    public function scopeProprietaires($query)
    {
        return $query->where('role', 'proprietaire');
    }

    public function scopeEtudiants($query)
    {
        return $query->where('role', 'etudiant');
    }

    public function isProprietaire()
    {
        return $this->role === 'proprietaire';
    }

    public function isEtudiant()
    {
        return $this->role === 'etudiant';
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}
