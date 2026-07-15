"use client";

import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export function GoogleSignInButton({ 
  mode = "login", 
  onSuccess 
}: { 
  mode?: "login" | "signup",
  onSuccess?: () => void
}) {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSuccess = async (credentialResponse: any) => {
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.message || 'Google authentication failed');
      
      localStorage.setItem('access_token', data.data.access_token);
      if (onSuccess) onSuccess();
      else router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google Sign-In');
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded flex items-start gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      <div className="w-full flex justify-center">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => setError('Google Sign-In was cancelled or failed.')}
          theme="filled_black"
          shape="rectangular"
          text={mode === "login" ? "signin_with" : "signup_with"}
          size="large"
          width="320"
        />
      </div>
    </div>
  );
}
