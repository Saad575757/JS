'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Alert, Spinner, Form, ButtonGroup } from 'react-bootstrap';
import Link from 'next/link';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TextFormInput from '@/components/form/TextFormInput';
import PasswordFormInput from '@/components/form/PasswordFormInput';
import { signUp } from '@/lib/api/auth';
import { saveAuthData } from '@/lib/auth/tokenManager';

const RegisterForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signUpSchema = yup.object({
    name: yup.string().required('Full name is required'),
    email: yup.string().email('Please enter a valid email').required('Email is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
    role: yup
      .string()
      .oneOf(['student', 'teacher', 'superadmin'], 'Please select a role')
      .required('Role is required'),
    acceptTerms: yup
      .boolean()
      .oneOf([true], 'You must accept the terms and conditions')
      .required(),
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'student',
      acceptTerms: false,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      const response = await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (response.success && response.token) {
        // Save authentication data
        saveAuthData(response);

        // Show success message
        console.log('Signup successful:', response.user);

        // Redirect to dashboard after successful signup
        router.push('/dashboard');
      } else {
        setError(response.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during signup. Please try again.');
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
        name="name"
        containerClassName="mb-3"
        label="Full Name"
        id="name"
        placeholder="Enter your full name"
      />

      <TextFormInput
        control={control}
        name="email"
        containerClassName="mb-3"
        label="Email Address"
        id="email-id"
        placeholder="Enter your email"
      />

      <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label="Password"
      />

      <PasswordFormInput
        control={control}
        name="confirmPassword"
        containerClassName="mb-3"
        placeholder="Confirm your password"
        id="confirm-password-id"
        label="Confirm Password"
      />

      <div className="mb-3">
        <label className="form-label">I am a:</label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <div className="d-flex flex-column gap-2">
              <ButtonGroup className="w-100">
                <Button
                  type="button"
                  variant={selectedRole === 'student' ? 'primary' : 'outline-primary'}
                  onClick={() => field.onChange('student')}
                  className="d-flex align-items-center justify-content-center py-2"
                >
                  <IconifyIcon icon="ri:user-line" className="me-2 fs-5" />
                  <span className="fw-semibold">Student</span>
                </Button>
                <Button
                  type="button"
                  variant={selectedRole === 'teacher' ? 'primary' : 'outline-primary'}
                  onClick={() => field.onChange('teacher')}
                  className="d-flex align-items-center justify-content-center py-2"
                >
                  <IconifyIcon icon="ri:user-star-line" className="me-2 fs-5" />
                  <span className="fw-semibold">Teacher</span>
                </Button>
              </ButtonGroup>
              <Button
                type="button"
                variant={selectedRole === 'superadmin' ? 'danger' : 'outline-danger'}
                onClick={() => field.onChange('superadmin')}
                className="d-flex align-items-center justify-content-center py-2 w-100"
              >
                <IconifyIcon icon="ri:shield-star-line" className="me-2 fs-5" />
                <span className="fw-semibold">Super Admin</span>
              </Button>
            </div>
          )}
        />
        {errors.role && (
          <Form.Text className="text-danger">{errors.role.message}</Form.Text>
        )}
      </div>

      <div className="mb-3">
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Form.Check
              type="checkbox"
              id="acceptTerms"
              label={
                <span>
                  I accept the{' '}
                  <Link href="#" className="text-primary">
                    Terms and Conditions
                  </Link>
                </span>
              }
              checked={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.acceptTerms}
            />
          )}
        />
        {errors.acceptTerms && (
          <Form.Text className="text-danger">{errors.acceptTerms.message}</Form.Text>
        )}
      </div>

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
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <IconifyIcon icon="ri:user-add-line" className="me-2" />
              <span className="fw-bold">Sign Up</span>
            </>
          )}
        </Button>
      </div>

      <div className="text-center mt-4">
        <p className="text-muted">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary fw-semibold">
            Log in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
