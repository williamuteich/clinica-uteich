export type BannerCarouselType = {
    badge: string;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    icon: React.ComponentType<{ className?: string }>;
};