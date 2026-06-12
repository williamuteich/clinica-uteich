import { ReactElement } from "react";

export type ProductTab = "alterar" | "cadastrar";

export interface Product {
    id: string;
    name: string;
    quantity: number;
    minimumQuantity: number;
    expirationDate?: string | null;
    notes?: string | null;
}

export interface GerenciarEstoqueModalProps {
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
    products?: Product[];
    initialTab?: ProductTab;
    singleProduct?: Product;
    editProduct?: Product;
    onSuccess: () => void;
    trigger?: ReactElement;
}

export interface VisualizarAlertasModalProps {
    products: Product[];
    initialType: "low" | "expiring";
    trigger?: ReactElement;
}

export interface ProductsResponse {
    products: Product[];
    total: number;
}

export interface StockMovement {
    id: string;
    productId: string;
    productName: string;
    quantity: number | null;
    type: string;
    notes?: string | null;
    performedBy: string;
    createdAt: string;
}

export interface MovementsResponse {
    movements: StockMovement[];
    total: number;
}

export interface ProdutosManagementProps {
    initialProducts: ProductsResponse | null;
    initialMovements: MovementsResponse | null;
}
