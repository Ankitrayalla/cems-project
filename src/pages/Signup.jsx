import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../utils/validationSchemas"; 
import { supabase } from "../lib/supabase";
function Signup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });


const onSubmit = async (data) => {
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (error) {
    console.log(error.message);
  } else {
    alert("Signup successful!");
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm rounded-lg bg-slate-800 p-6 shadow"
      >
        <h2 className="mb-4 text-xl font-bold">Signup</h2>

        <input
          {...register("name")}
          placeholder="Full Name"
          className="mb-2 w-full rounded p-2 text-black"
        />
        {errors.name && <p className="text-red-400">{errors.name.message}</p>}

        <input
          {...register("email")}
          placeholder="Email"
          className="mb-2 w-full rounded p-2 text-black"
        />
        {errors.email && <p className="text-red-400">{errors.email.message}</p>}

        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="mb-2 w-full rounded p-2 text-black"
        />
        {errors.password && <p className="text-red-400">{errors.password.message}</p>}

        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirm Password"
          className="mb-2 w-full rounded p-2 text-black"
        />
        {errors.confirmPassword && (
          <p className="text-red-400">{errors.confirmPassword.message}</p>
        )}

        <button className="mt-3 w-full rounded bg-green-600 p-2">
          Signup
        </button>
      </form>
    </div>
  );
}

export default Signup;