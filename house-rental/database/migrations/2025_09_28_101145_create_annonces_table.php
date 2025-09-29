<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('address');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->decimal('price', 10, 2);
            $table->integer('surface');
            $table->integer('rooms');
            $table->integer('bathrooms');
            $table->string('type'); //apartment, house, studio
            $table->boolean('is_furnished')->default(false);
            $table->boolean('has_kitchen')->default(false);
            $table->boolean('has_wifi')->default(false);
            $table->boolean('has_parking')->default(false);
            $table->enum('roommate_gender_preference', ['any', 'male', 'female'])->default('any');
            $table->enum('status', ['pending', 'approved', 'rejected', 'rented'])->default('pending');
            $table->date('available_from');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('annonces');
    }
};
