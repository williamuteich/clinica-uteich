import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PatientsTab } from "./admin/PatientsTab";
import { AgendaTab } from "./admin/AgendaTab";
import { AdminLogin } from "./admin/AdminLogin";
import { supabase } from "@/integrations/supabase/client";

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("patients");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) return <AdminLogin onLogin={() => { }} />;

  return (
    <AdminLayout
      onLogout={handleLogout}
      userEmail={session?.user?.email}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === "patients" && <PatientsTab />}
      {activeTab === "agenda" && <AgendaTab />}
    </AdminLayout>
  );
}