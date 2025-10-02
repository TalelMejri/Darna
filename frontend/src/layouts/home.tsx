import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone, MapPin, IdCard, GraduationCap, Home, CreditCard, AlertCircle } from "lucide-react";
import logo from "../assets/images/logo_darna.png";
import { register, login } from "../services/auth/authService.ts"
import { useAuth } from "@/AuthStore/AuthContext.ts";
import { useNavigate } from 'react-router-dom';
import InstallPrompt from "@/components/utils/InstallPrompt.tsx";

export default function HomeScreen() {
    const [showLogin, setShowLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const { LoginUser } = useAuth();
    const [selectedRole, setSelectedRole] = useState<'student' | 'non-student' | 'owner' | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        prenom: '',
        email: '',
        password: '',
        cin: '',
        phone: '',
        address: '',
        university: '',
        studentCard: null as File | null,
        successCertificate: null as File | null,
        paymentMethod: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [backendError, setBackendError] = useState<string>(''); // Erreur générale du backend
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^[0-9]{8}$/;
        return phoneRegex.test(phone);
    };

    const validateCIN = (cin: string) => {
        return cin.length >= 6;
    };

    const validateRequired = (value: string) => {
        return value.trim().length > 0;
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        // Effacer l'erreur backend quand l'utilisateur tape
        if (backendError) {
            setBackendError('');
        }
    };

    const handleFileChange = (field: string, file: File | null) => {
        setFormData(prev => ({ ...prev, [field]: file }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateLoginForm = () => {
        const newErrors: Record<string, string> = {};

        if (!validateRequired(formData.email)) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!validateRequired(formData.password)) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRegistrationForm = () => {
        const newErrors: Record<string, string> = {};

        if (!validateRequired(formData.name)) newErrors.name = 'Name is required';
        if (!validateRequired(formData.prenom)) newErrors.prenom = 'Last name is required';
        if (!validateRequired(formData.email)) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!validateRequired(formData.password)) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!validateRequired(formData.cin)) {
            newErrors.cin = 'CIN is required';
        } else if (!validateCIN(formData.cin)) {
            newErrors.cin = 'CIN must be at least 6 characters';
        }
        if (!validateRequired(formData.phone)) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid 8-digit phone number';
        }
        if (!validateRequired(formData.address)) newErrors.address = 'Address is required';

        if (selectedRole === 'student') {
            if (!validateRequired(formData.university)) newErrors.university = 'University is required';
            if (!formData.studentCard && !formData.successCertificate) {
                newErrors.studentCard = 'Student card or success certificate is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setBackendError('');

        if (validateLoginForm()) {
            setLoading(true);
            try {
                const response = await login({ email: formData.email, password: formData.password });
                if (response.status === 200) {
                    LoginUser(response.data.user);
                    localStorage.setItem('token', response.data.access_token);
                    const userRole = response.data.user.role;
                    switch (userRole) {
                        case 'admin':
                            navigate('/admin/dashboard');
                            break;
                        case 'student':                            
                            navigate('/user/dashboard');
                            break;
                        case 'non-student':
                            navigate('/nonstudent/dashboard');
                            break;
                        case 'owner':
                            navigate('/owner/dashboard');
                            break;
                        default:
                            navigate('/');
                            break;
                    }
                }
            } catch (error: any) {
                console.error('Login error:', error);

                // Gestion des erreurs du backend
                if (error.response) {
                    const errorMessage = error.response.data?.message ||
                        error.response.data?.error ||
                        'Erreur de connexion';
                    setBackendError(errorMessage);

                    // Mapper les erreurs spécifiques aux champs si nécessaire
                    if (error.response.data?.errors) {
                        const fieldErrors = error.response.data.errors;
                        setErrors(fieldErrors);
                    }
                } else if (error.request) {
                    setBackendError('Erreur de réseau. Veuillez vérifier votre connexion.');
                } else {
                    setBackendError('Une erreur inattendue est survenue.');
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setBackendError('');

        if (validateRegistrationForm()) {
            setLoading(true);
            try {
                const userRegister = new FormData();
                userRegister.append('name', formData.name);
                userRegister.append('prenom', formData.prenom);
                userRegister.append('email', formData.email);
                userRegister.append('password', formData.password);
                userRegister.append('role', selectedRole || '');
                userRegister.append('phone', formData.phone);
                userRegister.append('address', formData.address);
                userRegister.append('cin', formData.cin);

                if (selectedRole === 'student') {
                    userRegister.append('university', formData.university);
                    if (formData.studentCard) {
                        userRegister.append('student_card', formData.studentCard);
                    }
                    if (formData.successCertificate) {
                        userRegister.append('success_certificate', formData.successCertificate);
                    }
                }

                const response = await register(userRegister);

                if (response.status === 201) {
                    setShowLogin(true);
                    resetForm();
                    // Optionnel: Afficher un message de succès
                    setBackendError('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                    setTimeout(() => setBackendError(''), 5000);
                }
            } catch (error: any) {
                console.error('Registration error:', error);

                // Gestion détaillée des erreurs du backend
                if (error.response) {
                    const errorData = error.response.data;

                    // Erreur générale
                    const errorMessage = errorData?.message ||
                        errorData?.error ||
                        "Erreur lors de l'inscription";
                    setBackendError(errorMessage);

                    // Mapper les erreurs de validation des champs
                    if (errorData.errors) {
                        const fieldErrors: Record<string, string> = {};

                        // Gestion des erreurs Laravel typiques
                        Object.keys(errorData.errors).forEach(field => {
                            const fieldName = field === 'student_card' ? 'studentCard' :
                                field === 'success_certificate' ? 'successCertificate' : field;
                            fieldErrors[fieldName] = errorData.errors[field][0];
                        });

                        setErrors(fieldErrors);
                    }

                    // Gestion spécifique des erreurs communes
                    if (errorMessage.includes('email') || errorMessage.includes('Email')) {
                        setErrors(prev => ({ ...prev, email: 'Cet email est déjà utilisé' }));
                    }
                    if (errorMessage.includes('cin') || errorMessage.includes('CIN')) {
                        setErrors(prev => ({ ...prev, cin: 'Ce CIN est déjà utilisé' }));
                    }
                    if (errorMessage.includes('phone') || errorMessage.includes('téléphone')) {
                        setErrors(prev => ({ ...prev, phone: 'Ce numéro de téléphone est déjà utilisé' }));
                    }

                } else if (error.request) {
                    setBackendError('Erreur de réseau. Veuillez vérifier votre connexion.');
                } else {
                    setBackendError("Une erreur inattendue est survenue lors de l'inscription.");
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            prenom: '',
            email: '',
            password: '',
            cin: '',
            phone: '',
            address: '',
            university: '',
            studentCard: null,
            successCertificate: null,
            paymentMethod: '',
        });
        setErrors({});
        setBackendError('');
        setSelectedRole(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex flex-col relative overflow-hidden">
            <InstallPrompt />
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-r from-teal-200/20 to-blue-200/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-slate-200/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-teal-100/10 to-blue-100/10 rounded-full blur-2xl" />
            </div>

            <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
                <div className={`w-full max-w-md transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <div className="text-center mb-12">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-500 hover:scale-105">
                                <img
                                    src={logo}
                                    alt="Darna Logo"
                                    className="w-20 h-20 object-contain filter brightness-0 invert"
                                />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-teal-700 bg-clip-text text-transparent mb-3">
                            Dar<span className="font-light">na</span>
                        </h1>
                        <p className="text-gray-600 text-lg font-light">
                            Your gateway to amazing experiences
                        </p>
                    </div>

                    {/* Form Container */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 p-6">

                        {/* Toggle Switch */}
                        <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-8">
                            <button
                                onClick={() => { setShowLogin(true); resetForm(); }}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${showLogin
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => { setShowLogin(false); resetForm(); }}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${!showLogin
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Register
                            </button>
                        </div>

                        {/* Message d'erreur/succès backend */}
                        {backendError && (
                            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 ${backendError.includes('réussie')
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-red-50 border border-red-200 text-red-800'
                                }`}>
                                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${backendError.includes('réussie') ? 'text-green-500' : 'text-red-500'
                                    }`} />
                                <p className="text-sm font-medium">{backendError}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        {showLogin ? (
                            <form onSubmit={handleLogin} className="space-y-5">
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                }`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                        {errors.password && (
                                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Forgot Password */}
                                <div className="text-right">
                                    <button type="button" className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
                                        Forgot password?
                                    </button>
                                </div>

                                {/* Login Button */}
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            <span>Connexion...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        ) : (
                            /* Registration Flow */
                            <div className="space-y-6">
                                {/* Role Selection */}
                                {!selectedRole ? (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Choose Your Role</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <button
                                                onClick={() => setSelectedRole('student')}
                                                className="p-4 border-2 border-green-200 rounded-2xl hover:border-green-400 hover:bg-green-50 transition-all duration-300 text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <GraduationCap className="w-8 h-8 text-green-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">Student</h4>
                                                        <p className="text-sm text-gray-600">Find student housing with special benefits</p>
                                                    </div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setSelectedRole('non-student')}
                                                className="p-4 border-2 border-blue-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <User className="w-8 h-8 text-blue-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">Non-Student</h4>
                                                        <p className="text-sm text-gray-600">Find apartments and houses</p>
                                                    </div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setSelectedRole('owner')}
                                                className="p-4 border-2 border-purple-200 rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 text-left"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Home className="w-8 h-8 text-purple-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">Property Owner</h4>
                                                        <p className="text-sm text-gray-600">List and manage your properties</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Registration Form */
                                    <form onSubmit={handleRegister} className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedRole(null)}
                                                className="text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                <ArrowRight className="w-5 h-5 transform rotate-180" />
                                            </button>
                                            <span className="text-sm font-medium text-gray-600 capitalize">{selectedRole} Registration</span>
                                        </div>

                                        {/* Common Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    value={formData.name}
                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                        }`}
                                                />
                                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={formData.prenom}
                                                    onChange={(e) => handleInputChange('prenom', e.target.value)}
                                                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.prenom ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                        }`}
                                                />
                                                {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="email"
                                                placeholder="Email address"
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                    }`}
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                        </div>

                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create password"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                className={`w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative">
                                                <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="text"
                                                    placeholder="CIN"
                                                    value={formData.cin}
                                                    onChange={(e) => handleInputChange('cin', e.target.value)}
                                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.cin ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                        }`}
                                                />
                                                {errors.cin && <p className="text-red-500 text-sm mt-1">{errors.cin}</p>}
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                <input
                                                    type="tel"
                                                    placeholder="Phone Number"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                        }`}
                                                />
                                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                placeholder="Address"
                                                value={formData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.address ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                    }`}
                                            />
                                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                                        </div>

                                        {/* Student Specific Fields */}
                                        {selectedRole === 'student' && (
                                            <>
                                                <div className="relative">
                                                    <GraduationCap className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                                    <input
                                                        type="text"
                                                        placeholder="University"
                                                        value={formData.university}
                                                        onChange={(e) => handleInputChange('university', e.target.value)}
                                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-300 ${errors.university ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-teal-500'
                                                            }`}
                                                    />
                                                    {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Student Card or Success Certificate *</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-400 cursor-pointer transition-colors">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept=".jpg,.jpeg,.png,.pdf"
                                                                onChange={(e) => handleFileChange('studentCard', e.target.files?.[0] || null)}
                                                            />
                                                            <IdCard className="w-6 h-6 text-gray-400 mb-1" />
                                                            <span className="text-xs text-gray-600">Student Card</span>
                                                        </label>
                                                        <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-teal-400 cursor-pointer transition-colors">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept=".jpg,.jpeg,.png,.pdf"
                                                                onChange={(e) => handleFileChange('successCertificate', e.target.files?.[0] || null)}
                                                            />
                                                            <GraduationCap className="w-6 h-6 text-gray-400 mb-1" />
                                                            <span className="text-xs text-gray-600">Success Certificate</span>
                                                        </label>
                                                    </div>
                                                    {errors.studentCard && <p className="text-red-500 text-sm mt-1">{errors.studentCard}</p>}
                                                </div>
                                            </>
                                        )}

                                        {/* Non-Student Payment Notice */}
                                        {selectedRole === 'non-student' && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-yellow-600" />
                                                    <p className="text-sm text-yellow-800">
                                                        Your account will be activated after payment verification.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Terms Agreement */}
                                        <div className="text-center text-sm text-gray-600">
                                            By registering, you agree to our{" "}
                                            <button type="button" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
                                                Terms
                                            </button>{" "}
                                            and{" "}
                                            <button type="button" className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
                                                Privacy Policy
                                            </button>
                                        </div>

                                        {/* Register Button */}
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                    <span>Inscription...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <span>Create {selectedRole} Account</span>
                                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Toggle between Login/Register */}
                    <div className="text-center mt-8">
                        <p className="text-gray-500 text-sm">
                            {showLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => { setShowLogin(!showLogin); resetForm(); }}
                                className="text-teal-600 hover:text-teal-700 font-medium transition-colors"
                            >
                                {showLogin ? "Sign up" : "Sign in"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}