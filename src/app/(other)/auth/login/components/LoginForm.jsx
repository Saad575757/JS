'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Alert, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TextFormInput from '@/components/form/TextFormInput';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import { login } from '@/lib/api/auth';
import { saveAuthData } from '@/lib/auth/tokenManager';

const LoginForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginSchema = yup.object({
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    password: yup.string().required('Password is required'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      if (response.success && response.token) {
        // Save authentication data
        saveAuthData(response);

        // Show success message
        console.log('Login successful:', response.user);

        // Redirect to dashboard after successful login
        router.push('/dashboard');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="text-start">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TextFormInput
        control={control}
        name="email"
        containerClassName="mb-3"
        label="Email address"
        id="email-id"
        placeholder="Enter your email"
      />

      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label={
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label htmlFor="password-id" className="form-label mb-0">
                Password
              </label>
              <Link href="/auth/forgot-pass" className="text-muted">
                <small>Forgot password?</small>
              </Link>
            </div>
          </>
        }
      />

      <div className="mb-0 text-start">
        <Button
          variant="primary"
          disabled={loading}
          className="w-100 d-flex align-items-center justify-content-center"
          type="submit"
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <IconifyIcon icon="ri:login-circle-fill" className="me-2" />
              <span className="fw-bold">Log In</span>
            </>
          )}
        </Button>
      </div>

      <div className="text-center mt-4">
        <p className="text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary fw-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
