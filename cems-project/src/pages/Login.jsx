import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const loginSchema = z.object({
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
});

function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate('/dashboard');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching role after login:', profileError);
        navigate('/dashboard');
        return;
      }

      const role = profileData?.role;
      console.log('User role:', role);

      if (role === 'hod') {
        navigate('/hod-dashboard');
      } else if (role === 'principal') {
        navigate('/principal-dashboard');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (submitError) {
      console.error('Login flow failed:', submitError);
      alert(submitError.message || 'Login failed. Please try again.');
    }
  };

  return (
    <section className="form-page">
      <div className="form-shell compact">
        <div className="form-head">
          <p className="eyebrow">Account Access</p>
          <h1>Login</h1>
          <p className="form-subtitle">
            Sign in to access your role dashboard and manage campus events.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="app-form" noValidate>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email ? <p className="field-error">{errors.email.message}</p> : null}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
            />
            {errors.password ? <p className="field-error">{errors.password.message}</p> : null}
          </div>

          <div className="form-actions single">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="form-footer-link">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;