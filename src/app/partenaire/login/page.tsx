import LoginForm from "@/components/auth/LoginForm";

export default function PartnerLoginPage() {
  return (
    <LoginForm 
      title="Espace Partenaire" 
      callbackUrl="/partenaire" 
    />
  );
}
