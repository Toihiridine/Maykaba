import LoginForm from "@/components/auth/LoginForm";

export default function AdminLoginPage() {
  return (
    <LoginForm 
      title="Espace Administrateur" 
      callbackUrl="/admin" 
    />
  );
}
