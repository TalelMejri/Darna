import { useState } from "react"
import { Home, Shield, Star, MapPin, CreditCard, Users, GraduationCap, Building, Heart, CheckCircle } from "lucide-react"

const onboardingSteps = [
  {
    id: 1,
    title: "Find Your Perfect Home",
    description: "Whether you're a student or young professional, discover thousands of homes tailored to your budget and lifestyle.",
    icon: Home,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    emoji: "🎯",
    audience: "both"
  },
  {
    id: 2,
    title: "Exclusive Student Solutions",
    description: "Simplified rental guarantees, verified shared apartments, and homes near campuses. Specially designed for students!",
    icon: GraduationCap,
    color: "text-green-500",
    bgColor: "bg-green-50",
    emoji: "🎓",
    audience: "student"
  },
  {
    id: 3,
    title: "For Young Professionals",
    description: "Furnished apartments, service residences, and long-term rentals. Perfect for your new professional life.",
    icon: Building,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    emoji: "💼",
    audience: "professional"
  },
  {
    id: 4,
    title: "Safe & Secure Platform",
    description: "All our landlords are verified. Secure platform with personalized support throughout your journey.",
    icon: Shield,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    emoji: "🛡️",
    audience: "both"
  },
  {
    id: 5,
    title: "Flexible Payment Options",
    description: "Student payment plans, security deposit alternatives, and transparent pricing for everyone.",
    icon: CreditCard,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
    emoji: "💳",
    audience: "both"
  },
]

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const totalSteps = onboardingSteps.length

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setIsTransitioning(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      setCurrentStep(currentStep + 1)
      setIsTransitioning(false)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  const handleDotClick = async (index: number) => {
    if (index !== currentStep) {
      setIsTransitioning(true)
      await new Promise(resolve => setTimeout(resolve, 200))
      setCurrentStep(index)
      setIsTransitioning(false)
    }
  }
  const currentStepData = onboardingSteps[currentStep]
  const IconComponent = currentStepData.icon
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex flex-col">
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-2">
          <Home className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-bold text-blue-600">Darna</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            {currentStep + 1}/{totalSteps}
          </span>
          <button 
            onClick={handleSkip} 
            className="text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded-md text-sm"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Main Content with Animation */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className={`w-full max-w-md p-8 text-center bg-white rounded-3xl shadow-xl transition-all duration-500 transform ${
          isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}>
          {/* Animated Icon with Emoji */}
          <div className="mb-6 flex justify-center">
            <div className={`w-20 h-20 sm:w-25 sm:h-25 rounded-full ${currentStepData.bgColor} flex items-center justify-center transition-all duration-500 transform hover:scale-110 relative`}>
              <IconComponent className={`w-12 h-12 sm:w-15 sm:h-15 ${currentStepData.color} transition-all duration-500`} />
              <div className="absolute -top-2 -right-2 text-2xl">
                {currentStepData.emoji}
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-8 overflow-hidden">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          <h2 className=" font-bold text-[18px] md:text-lg text-gray-800 mb-4 transition-all duration-500 leading-tight">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-2 transition-all duration-500">
            {currentStepData.description}
          </p>
          <div className="flex justify-center gap-2 mt-6 flex-wrap">
            {currentStep === 0 && (
              <>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Apartments</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Villas</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Condos</span>
              </>
            )}
            {currentStep === 1 && (
              <>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">360° Tours</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Live Viewings</span>
              </>
            )}
            {currentStep === 2 && (
              <>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Verified</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Secure</span>
              </>
            )}
            {currentStep === 3 && (
              <>
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">AI Powered</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">Smart Match</span>
              </>
            )}
            {currentStep === 4 && (
              <>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Secure Pay</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Instant</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 mt-2 bg-white/80 backdrop-blur-sm border-t">
        <div className="flex justify-center gap-3 mb-3">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentStep 
                  ? "bg-gradient-to-r from-blue-500 to-emerald-500 scale-125" 
                  : index < currentStep 
                    ? "bg-green-500" 
                    : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button 
              onClick={() => handleDotClick(currentStep - 1)}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-4 px-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 hover:border-gray-400"
            >
              Back
            </button>
          )}
          <button 
            onClick={handleNext} 
            className={`flex-1 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white py-4 px-4 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
              currentStep === 0 ? 'flex-1' : 'flex-1'
            }`}
          >
            {currentStep === totalSteps - 1 ? (
              <span className="flex items-center justify-center text-sm">
                Find My Home <Home className="ml-2 w-5 h-5" />
              </span>
            ) : (
              <span className="flex items-center justify-center text-sm">
                Continue <CheckCircle className="ml-2 w-5 h-5" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}