import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Stethoscope, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

const schema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await registerPatient(data.email, data.password, data.first_name, data.last_name);
      navigate("/dashboard");
    } catch {
      setError("root", { message: "Registration failed. Email may already be in use." });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-healing-50 via-white to-primary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-healing-600 shadow-lg shadow-healing-200 dark:shadow-healing-900/30">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Join thousands of patients managing their health</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200/60 bg-white/80 p-8 shadow-card backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Alice"
                leftIcon={<User className="h-4 w-4" />}
                {...register("first_name")}
                error={errors.first_name?.message}
              />
              <Input
                label="Last Name"
                placeholder="Smith"
                {...register("last_name")}
                error={errors.last_name?.message}
              />
            </div>
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
              autoComplete="new-password"
              placeholder="Min 8 chars, uppercase + number"
              leftIcon={<Lock className="h-4 w-4" />}
              {...register("password")}
              error={errors.password?.message}
            />
            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              leftIcon={<Lock className="h-4 w-4" />}
              {...register("confirm_password")}
              error={errors.confirm_password?.message}
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

            <Button type="submit" variant="success" className="w-full mt-2" size="lg" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
