import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../utils/validationSchemas';
import { supabase } from '../lib/supabase';

function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert('Signup successful. Check your email to confirm your account.');
  };

  return (
    <section className="form-page">
      <div className="form-shell compact">
        <div className="form-head">
          <p className="eyebrow">New Account</p>
          <h1>Signup</h1>
          <p className="form-subtitle">Create your account to submit and track event proposals.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="app-form" noValidate>
          <div className="form-field">
            <label htmlFor="name">Full Name</label>
            <input id="name" {...register('name')} placeholder="John Doe" />
            {errors.name ? <p className="field-error">{errors.name.message}</p> : null}
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register('email')} placeholder="you@example.com" />
            {errors.email ? <p className="field-error">{errors.email.message}</p> : null}
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              {...register('password')}
              type="password"
              placeholder="At least 6 characters"
            />
            {errors.password ? <p className="field-error">{errors.password.message}</p> : null}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              {...register('confirmPassword')}
              type="password"
              placeholder="Re-enter password"
            />
            {errors.confirmPassword ? (
              <p className="field-error">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <div className="form-actions single">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default Signup;