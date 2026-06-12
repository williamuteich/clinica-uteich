import { PrismaClient } from '../generated/prisma/client'
const prisma = new PrismaClient()

async function main() {
  const resources = ["usuarios", "cargos", "configuracoes", "auditoria", "pacientes", "agenda", "produtos"];
  const actions = ["visualizar", "criar", "editar", "deletar"];

  console.log('📦 Criando permissões...');
  for (const resource of resources) {
    for (const action of actions) {
      await prisma.adminPermission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action }
      });
    }
  }

  console.log('👑 Criando cargo Admin...');
  const adminRole = await prisma.adminRole.upsert({
    where: { name: 'Admin' },
    update: { description: 'Cargo mestre do sistema. Único e protegido.' },
    create: {
      name: 'Admin',
      description: 'Cargo mestre do sistema. Único e protegido.'
    }
  });

  const allPermissions = await prisma.adminPermission.findMany();
  for (const perm of allPermissions) {
    await prisma.adminRolePermission.upsert({
      where: {
        adminRoleId_adminPermissionId: {
          adminRoleId: adminRole.id,
          adminPermissionId: perm.id
        }
      },
      update: {},
      create: {
        adminRoleId: adminRole.id,
        adminPermissionId: perm.id
      }
    });
  }

  console.log('👤 Configurando usuário mestre...');
  await prisma.administrator.upsert({
    where: { email: 'williamuteich14@gmail.com' },
    update: {
      roleId: adminRole.id,
      active: true
    },
    create: {
      email: 'williamuteich14@gmail.com',
      name: 'William Master',
      active: true,
      roleId: adminRole.id
    },
  })

  console.log('✅ Setup "Admin" concluído!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())