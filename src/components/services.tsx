import { services } from "@/data/services";
import { AlertCircle, ClipboardCheck, Crown, Smile, Sparkles, Stethoscope, Target, Wrench } from "lucide-react";

export default function Services() {

    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
        AlertCircle,
        ClipboardCheck,
        Stethoscope,
        Crown,
        Smile,
        Target,
        Sparkles,
        Wrench,
    };

    return (
        <section id="servicos" className="py-16 md:py-24 bg-blue-50">
            <div className="mx-auto max-w-5xl px-4">
                <div className="max-w-2xl">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Nossos serviços</span>
                    <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-primary-deep">
                        Cuidado completo para toda a família
                    </h2>
                    <p className="mt-3 text-muted-foreground">
                        7+ especialidades sob o mesmo teto, com tecnologia moderna e profissionais qualificados.
                    </p>
                </div>

                <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => {
                        const Icon = iconMap[service.icon] || Stethoscope;
                        const isEmergency = service.id === 'emergencia';
                        return (
                            <li
                                key={service.id}
                                className={`group bg-white rounded-none p-6 hover:shadow-lg transition-shadow ${isEmergency
                                    ? 'shadow-md'
                                    : 'shadow-md'
                                    }`}
                            >
                                <div className={`h-10 w-10 grid place-items-center rounded-none ${isEmergency
                                    ? 'bg-red-500 text-white'
                                    : 'bg-primary/10 text-primary'
                                    }`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className={`mt-4 text-base font-semibold ${isEmergency ? 'text-red-600' : 'text-primary-deep'}`}>
                                    {service.name}
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {service.description}
                                </p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    )
}