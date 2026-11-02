import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, Mail, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await loginUser(data.email, data.password);
      navigate("/");
    } catch {
      setError("root", { message: "Invalid email or password" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-healing-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/30">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Sign in to your healthcare account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-8 shadow-card backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              {...register("password")}
              error={errors.password?.message}
            />

            {errors.root && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
              >
                {errors.root.message}
              </motion.p>
            )}

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Create account
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-xl border border-primary-100 bg-primary-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400">Demo Credentials</p>
          <div className="space-y-1 text-xs text-gray-600 dark:text-slate-400">
            <p><span className="font-medium">Patient:</span> alice@patient.com / Patient@12345</p>
            <p><span className="font-medium">Doctor:</span> dr.smith@healthcare.com / Doctor@12345</p>
            <p><span className="font-medium">Admin:</span> admin@healthcare.com / Admin@12345</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
