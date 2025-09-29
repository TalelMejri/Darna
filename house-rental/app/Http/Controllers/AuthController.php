<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        try {
            $userData = [
                'first_name' => $request->name,
                'last_name' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'phone' => $request->phone,
                'address' => $request->address,
                'cin' => $request->cin,
                'university' => $request->university,
                'is_verified' => $request->role !== 'non-student',
            ];

            if ($request->role === 'student') {
                if ($request->hasFile('student_card')) {
                    $studentCardPath = $request->file('student_card')->store('student_cards', 'public');
                    $userData['etudiant_card'] = $studentCardPath;
                }

                if ($request->hasFile('success_certificate')) {
                    $certificatePath = $request->file('success_certificate')->store('success_certificates', 'public');
                    $userData['etudiant_certif_success'] = $certificatePath;
                }
            }

            $user = User::create($userData);
            $token = $user->createToken('auth-token')->plainTextToken;
            return response()->json([
                'message' => 'User created successfully',
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        if (Auth::attempt($request->only('email', 'password'))) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'access_token' => $token
            ]);
        } else {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }
    }

    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
