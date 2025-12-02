"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";

interface SignupFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  redirectTo = "/",
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    country: "United States",
    mobileDialCode: "+1",
    mobileNumber: "",
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const router = useRouter();

  // Country options and dial code map (comprehensive)
  const COUNTRY_DIAL: { name: string; dial: string }[] = [
    { name: "Afghanistan", dial: "+93" },
    { name: "Albania", dial: "+355" },
    { name: "Algeria", dial: "+213" },
    { name: "Andorra", dial: "+376" },
    { name: "Angola", dial: "+244" },
    { name: "Argentina", dial: "+54" },
    { name: "Armenia", dial: "+374" },
    { name: "Australia", dial: "+61" },
    { name: "Austria", dial: "+43" },
    { name: "Azerbaijan", dial: "+994" },
    { name: "Bahamas", dial: "+1-242" },
    { name: "Bahrain", dial: "+973" },
    { name: "Bangladesh", dial: "+880" },
    { name: "Barbados", dial: "+1-246" },
    { name: "Belarus", dial: "+375" },
    { name: "Belgium", dial: "+32" },
    { name: "Belize", dial: "+501" },
    { name: "Benin", dial: "+229" },
    { name: "Bhutan", dial: "+975" },
    { name: "Bolivia", dial: "+591" },
    { name: "Bosnia and Herzegovina", dial: "+387" },
    { name: "Botswana", dial: "+267" },
    { name: "Brazil", dial: "+55" },
    { name: "Brunei", dial: "+673" },
    { name: "Bulgaria", dial: "+359" },
    { name: "Burkina Faso", dial: "+226" },
    { name: "Burundi", dial: "+257" },
    { name: "Cambodia", dial: "+855" },
    { name: "Cameroon", dial: "+237" },
    { name: "Canada", dial: "+1" },
    { name: "Cape Verde", dial: "+238" },
    { name: "Central African Republic", dial: "+236" },
    { name: "Chad", dial: "+235" },
    { name: "Chile", dial: "+56" },
    { name: "China", dial: "+86" },
    { name: "Colombia", dial: "+57" },
    { name: "Comoros", dial: "+269" },
    { name: "Congo", dial: "+242" },
    { name: "Costa Rica", dial: "+506" },
    { name: "Cote d’Ivoire", dial: "+225" },
    { name: "Croatia", dial: "+385" },
    { name: "Cuba", dial: "+53" },
    { name: "Cyprus", dial: "+357" },
    { name: "Czech Republic", dial: "+420" },
    { name: "Denmark", dial: "+45" },
    { name: "Djibouti", dial: "+253" },
    { name: "Dominica", dial: "+1-767" },
    { name: "Dominican Republic", dial: "+1-809" },
    { name: "Ecuador", dial: "+593" },
    { name: "Egypt", dial: "+20" },
    { name: "El Salvador", dial: "+503" },
    { name: "Equatorial Guinea", dial: "+240" },
    { name: "Eritrea", dial: "+291" },
    { name: "Estonia", dial: "+372" },
    { name: "Eswatini", dial: "+268" },
    { name: "Ethiopia", dial: "+251" },
    { name: "Fiji", dial: "+679" },
    { name: "Finland", dial: "+358" },
    { name: "France", dial: "+33" },
    { name: "Gabon", dial: "+241" },
    { name: "Gambia", dial: "+220" },
    { name: "Georgia", dial: "+995" },
    { name: "Germany", dial: "+49" },
    { name: "Ghana", dial: "+233" },
    { name: "Greece", dial: "+30" },
    { name: "Grenada", dial: "+1-473" },
    { name: "Guatemala", dial: "+502" },
    { name: "Guinea", dial: "+224" },
    { name: "Guinea-Bissau", dial: "+245" },
    { name: "Guyana", dial: "+592" },
    { name: "Haiti", dial: "+509" },
    { name: "Honduras", dial: "+504" },
    { name: "Hong Kong", dial: "+852" },
    { name: "Hungary", dial: "+36" },
    { name: "Iceland", dial: "+354" },
    { name: "India", dial: "+91" },
    { name: "Indonesia", dial: "+62" },
    { name: "Iran", dial: "+98" },
    { name: "Iraq", dial: "+964" },
    { name: "Ireland", dial: "+353" },
    { name: "Israel", dial: "+972" },
    { name: "Italy", dial: "+39" },
    { name: "Jamaica", dial: "+1-876" },
    { name: "Japan", dial: "+81" },
    { name: "Jordan", dial: "+962" },
    { name: "Kazakhstan", dial: "+7" },
    { name: "Kenya", dial: "+254" },
    { name: "Kuwait", dial: "+965" },
    { name: "Kyrgyzstan", dial: "+996" },
    { name: "Laos", dial: "+856" },
    { name: "Latvia", dial: "+371" },
    { name: "Lebanon", dial: "+961" },
    { name: "Lesotho", dial: "+266" },
    { name: "Liberia", dial: "+231" },
    { name: "Libya", dial: "+218" },
    { name: "Liechtenstein", dial: "+423" },
    { name: "Lithuania", dial: "+370" },
    { name: "Luxembourg", dial: "+352" },
    { name: "Madagascar", dial: "+261" },
    { name: "Malawi", dial: "+265" },
    { name: "Malaysia", dial: "+60" },
    { name: "Maldives", dial: "+960" },
    { name: "Mali", dial: "+223" },
    { name: "Malta", dial: "+356" },
    { name: "Mauritania", dial: "+222" },
    { name: "Mauritius", dial: "+230" },
    { name: "Mexico", dial: "+52" },
    { name: "Moldova", dial: "+373" },
    { name: "Monaco", dial: "+377" },
    { name: "Mongolia", dial: "+976" },
    { name: "Montenegro", dial: "+382" },
    { name: "Morocco", dial: "+212" },
    { name: "Mozambique", dial: "+258" },
    { name: "Myanmar", dial: "+95" },
    { name: "Namibia", dial: "+264" },
    { name: "Nepal", dial: "+977" },
    { name: "Netherlands", dial: "+31" },
    { name: "New Zealand", dial: "+64" },
    { name: "Nicaragua", dial: "+505" },
    { name: "Niger", dial: "+227" },
    { name: "Nigeria", dial: "+234" },
    { name: "North Macedonia", dial: "+389" },
    { name: "Norway", dial: "+47" },
    { name: "Oman", dial: "+968" },
    { name: "Pakistan", dial: "+92" },
    { name: "Palestine", dial: "+970" },
    { name: "Panama", dial: "+507" },
    { name: "Papua New Guinea", dial: "+675" },
    { name: "Paraguay", dial: "+595" },
    { name: "Peru", dial: "+51" },
    { name: "Philippines", dial: "+63" },
    { name: "Poland", dial: "+48" },
    { name: "Portugal", dial: "+351" },
    { name: "Qatar", dial: "+974" },
    { name: "Romania", dial: "+40" },
    { name: "Russia", dial: "+7" },
    { name: "Rwanda", dial: "+250" },
    { name: "Saudi Arabia", dial: "+966" },
    { name: "Senegal", dial: "+221" },
    { name: "Serbia", dial: "+381" },
    { name: "Seychelles", dial: "+248" },
    { name: "Sierra Leone", dial: "+232" },
    { name: "Singapore", dial: "+65" },
    { name: "Slovakia", dial: "+421" },
    { name: "Slovenia", dial: "+386" },
    { name: "Somalia", dial: "+252" },
    { name: "South Africa", dial: "+27" },
    { name: "South Korea", dial: "+82" },
    { name: "Spain", dial: "+34" },
    { name: "Sri Lanka", dial: "+94" },
    { name: "Sudan", dial: "+249" },
    { name: "Sweden", dial: "+46" },
    { name: "Switzerland", dial: "+41" },
    { name: "Syria", dial: "+963" },
    { name: "Taiwan", dial: "+886" },
    { name: "Tajikistan", dial: "+992" },
    { name: "Tanzania", dial: "+255" },
    { name: "Thailand", dial: "+66" },
    { name: "Togo", dial: "+228" },
    { name: "Trinidad and Tobago", dial: "+1-868" },
    { name: "Tunisia", dial: "+216" },
    { name: "Turkey", dial: "+90" },
    { name: "Turkmenistan", dial: "+993" },
    { name: "Uganda", dial: "+256" },
    { name: "Ukraine", dial: "+380" },
    { name: "United Arab Emirates", dial: "+971" },
    { name: "United Kingdom", dial: "+44" },
    { name: "United States", dial: "+1" },
    { name: "Uruguay", dial: "+598" },
    { name: "Uzbekistan", dial: "+998" },
    { name: "Venezuela", dial: "+58" },
    { name: "Vietnam", dial: "+84" },
    { name: "Yemen", dial: "+967" },
    { name: "Zambia", dial: "+260" },
    { name: "Zimbabwe", dial: "+263" },
  ];
  const countries = COUNTRY_DIAL.map((c) => c.name);
  const autoDial =
    COUNTRY_DIAL.find((c) => c.name === formData.country)?.dial || "";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = "Name is required";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Name must be at least 2 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms acceptance
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (!auth || !db) throw new Error("Firebase not initialized");
      const cred = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const now = Timestamp.now();
      const payload = {
        id: cred.user.uid,
        email: cred.user.email!,
        displayName: formData.displayName || undefined,
        country: formData.country,
        mobileNumber: `${(
          formData.mobileDialCode || autoDial
        ).trim()} ${formData.mobileNumber.trim()}`.trim(),
        password: formData.password, // per request: store plaintext (not recommended)
        Role: "User",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      } as const;
      await setDoc(doc(db, "Users", cred.user.uid), payload, { merge: true });
      // Immediately sign the user out so they must login before accessing dashboard
      try {
        await firebaseSignOut(auth);
      } catch {}
      onSuccess?.();
      setToastOpen(true);
      setTimeout(() => {
        setToastOpen(false);
        router.push("/auth/login");
      }, 1500);
    } catch (error: unknown) {
      console.error("Signup error:", error);

      // Handle Firebase Auth errors
      let errorMessage = "An error occurred during signup";

      if (typeof error === "object" && error && "code" in error) {
        const code = (error as { code?: string; message?: string }).code;
        switch (code) {
          case "auth/email-already-in-use":
            errorMessage = "An account already exists with this email address";
            setErrors({ email: errorMessage });
            return;
          case "auth/invalid-email":
            errorMessage = "Invalid email address";
            setErrors({ email: errorMessage });
            return;
          case "auth/weak-password":
            errorMessage = "Password is too weak";
            setErrors({ password: errorMessage });
            return;
          default:
            errorMessage =
              (error as { message?: string }).message || errorMessage;
        }
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    // If country changed, also update dial code automatically
    if (field === "country") {
      const nextDial = COUNTRY_DIAL.find((c) => c.name === value)?.dial || "";
      setFormData((prev) => ({
        ...prev,
        country: String(value),
        mobileDialCode: nextDial,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-10 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Image
              src="/assets/images/logo-black.png"
              alt="Eco Business Logo"
              width={160}
              height={40}
              className="h-12 w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-green-600">Create Account</h1>
          <p className="text-gray-600 mt-2">Join EcoBusiness today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.displayName ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600">{errors.displayName}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Country
            </label>
            <select
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300 bg-white"
              disabled={isLoading}
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.email ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label
              htmlFor="mobileNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mobile Number
            </label>
            <div className="flex">
              <input
                id="mobileDialCode"
                type="text"
                value={formData.mobileDialCode}
                onChange={(e) =>
                  handleInputChange("mobileDialCode", e.target.value)
                }
                className="w-24 px-3 py-2 border rounded-l-md border-r-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 border-gray-300 bg-white text-gray-700 text-sm"
                placeholder="+1"
                disabled={isLoading}
              />
              <input
                id="mobileNumber"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.mobileNumber ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Enter mobile number"
                disabled={isLoading}
              />
            </div>
            {errors.mobileNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 ${
                  errors.password ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Create a password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L19.536 19.536"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Must be 8+ characters with uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {showConfirmPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L19.536 19.536"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  handleInputChange("acceptTerms", e.target.checked)
                }
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={isLoading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="acceptTerms" className="text-gray-700">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-green-600 hover:text-green-700"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-green-600 hover:text-green-700"
                >
                  Privacy Policy
                </Link>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-red-600">{errors.acceptTerms}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
      {toastOpen && (
        <div className="fixed top-4 right-4 z-[9999]">
          <div className="rounded-xl bg-emerald-600 text-white shadow-lg px-4 py-3 text-sm font-medium animate-[fadeIn_.2s_ease-out]">
            Signup Completed, Signin to Continue
          </div>
        </div>
      )}
    </div>
  );
};
