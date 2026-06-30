import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { checkAdminApi } from "@/src/lib/auth-helpers-server";
import { revalidateTag } from "next/cache";

type AnyContext = { params?: Promise<Record<string, string>> };
type RouteHandler<Ctx extends AnyContext = AnyContext> = (
    req: Request,
    ctx: Ctx
) => Promise<NextResponse>;

interface AuditOptions<Ctx extends AnyContext = AnyContext> {
    resource: string;
    getResourceId?: (ctx: Ctx) => Promise<string | undefined> | string | undefined;
    getResourceName?: (data: any) => Promise<string | undefined> | string | undefined;
    getUrl?: (ctx: Ctx, data: any) => Promise<string | undefined> | string | undefined;
}

const METHOD_TO_ACTION: Record<string, string | undefined> = {
    POST: "CREATE",
    PUT: "UPDATE",
    PATCH: "UPDATE",
    DELETE: "DELETE",
};

export function withAudit<Ctx extends AnyContext = AnyContext>(
    handler: RouteHandler<Ctx>,
    options: AuditOptions<Ctx>
): RouteHandler<Ctx> {
    return async (req: Request, ctx: Ctx): Promise<NextResponse> => {
        const response = await handler(req, ctx);

        const action = METHOD_TO_ACTION[req.method];
        const isSuccess = response.status >= 200 && response.status < 300;

        if (action && isSuccess) {
            const session = await checkAdminApi();

            if (session?.user?.id) {
                const administratorId = session.user.id;
                const resourceId = options.getResourceId
                    ? await options.getResourceId(ctx)
                    : undefined;

                let resourceName: string | undefined;
                let data: any = null;
                try {
                    data = await response.clone().json();
                    resourceName = options.getResourceName
                        ? await options.getResourceName(data)
                        : ((data as Record<string, unknown>)?.name as string ||
                            (data as Record<string, unknown>)?.email as string);
                } catch (_e) { }

                const resolvedUrl = options.getUrl
                    ? await options.getUrl(ctx, data)
                    : `/${options.resource}`;

                prisma.$transaction(async (tx) => {
                    await tx.logAdmin.create({
                        data: {
                            administratorId,
                            action,
                            resource: options.resource,
                            resourceId: resourceId ?? null,
                            resourceName: resourceName ?? null,
                            url: resolvedUrl ?? `/${options.resource}`,
                        },
                    });

                    const logs = await tx.logAdmin.findMany({
                        orderBy: { createdAt: "desc" },
                        select: { id: true },
                    });

                    if (logs.length > 20) {
                        const idsToDelete = logs.slice(20).map((l) => l.id);
                        await tx.logAdmin.deleteMany({
                            where: {
                                id: { in: idsToDelete },
                            },
                        });
                    }
                })
                    .then(() => revalidateTag("auditoria-list", "max"))
                    .catch((err) =>
                        console.error("[Audit] Erro ao salvar log de auditoria:", err)
                    );
            }
        }

        return response;
    };
}
