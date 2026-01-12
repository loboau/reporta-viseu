import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('A iniciar seed...');

  // Clear existing data
  await prisma.photo.deleteMany();
  await prisma.report.deleteMany();
  await prisma.category.deleteMany();

  // Seed categories
  const categories = [
    {
      slug: 'buraco',
      icon: 'Construction',
      label: 'Buraco na via pública',
      sublabel: 'Estrada, passeio ou calçada danificada',
      departamento: 'Departamento de Obras e Infraestruturas',
      email: 'obras@cm-viseu.pt',
      telefone: '232 427 400',
      permiteAnonimo: true,
      ativo: true,
      ordem: 1,
    },
    {
      slug: 'luz',
      icon: 'Lightbulb',
      label: 'Iluminação pública',
      sublabel: 'Candeeiro apagado ou danificado',
      departamento: 'Divisão de Energia e Eletricidade',
      email: 'iluminacao@cm-viseu.pt',
      telefone: '232 427 410',
      permiteAnonimo: true,
      ativo: true,
      ordem: 2,
    },
    {
      slug: 'lixo',
      icon: 'Trash2',
      label: 'Lixo e resíduos',
      sublabel: 'Lixeira danificada ou lixo acumulado',
      departamento: 'Serviços Urbanos e Ambiente',
      email: 'residuos@cm-viseu.pt',
      telefone: '232 427 420',
      permiteAnonimo: true,
      ativo: true,
      ordem: 3,
    },
    {
      slug: 'arvore',
      icon: 'Trees',
      label: 'Árvores e jardins',
      sublabel: 'Árvore caída, podre ou espaços verdes',
      departamento: 'Divisão de Espaços Verdes',
      email: 'jardins@cm-viseu.pt',
      telefone: '232 427 430',
      permiteAnonimo: true,
      ativo: true,
      ordem: 4,
    },
    {
      slug: 'agua',
      icon: 'Droplet',
      label: 'Água e saneamento',
      sublabel: 'Fuga de água ou problema no esgoto',
      departamento: 'Águas de Viseu',
      email: 'agua@aguasviseu.pt',
      telefone: '232 410 500',
      permiteAnonimo: true,
      ativo: true,
      ordem: 5,
    },
    {
      slug: 'carro',
      icon: 'Car',
      label: 'Veículo abandonado',
      sublabel: 'Carro ou mota abandonado na via pública',
      departamento: 'Polícia Municipal',
      email: 'policiamunicipal@cm-viseu.pt',
      telefone: '232 427 450',
      permiteAnonimo: false,
      ativo: true,
      ordem: 6,
    },
    {
      slug: 'sinal',
      icon: 'OctagonAlert',
      label: 'Sinalização',
      sublabel: 'Sinal de trânsito danificado ou em falta',
      departamento: 'Departamento de Mobilidade',
      email: 'transito@cm-viseu.pt',
      telefone: '232 427 460',
      permiteAnonimo: true,
      ativo: true,
      ordem: 7,
    },
    {
      slug: 'animal',
      icon: 'Dog',
      label: 'Animais',
      sublabel: 'Animal abandonado ou morto',
      departamento: 'Centro de Recolha Animal',
      email: 'animais@cm-viseu.pt',
      telefone: '232 427 470',
      permiteAnonimo: true,
      ativo: true,
      ordem: 8,
    },
    {
      slug: 'edificio',
      icon: 'Home',
      label: 'Edifício degradado',
      sublabel: 'Edifício abandonado ou em mau estado',
      departamento: 'Fiscalização Municipal',
      email: 'fiscalizacao@cm-viseu.pt',
      telefone: '232 427 480',
      permiteAnonimo: false,
      ativo: true,
      ordem: 9,
    },
    {
      slug: 'outro',
      icon: 'AlertCircle',
      label: 'Outro problema',
      sublabel: 'Situação não listada nas categorias',
      departamento: 'Gabinete de Atendimento ao Munícipe',
      email: 'geral@cm-viseu.pt',
      telefone: '232 427 400',
      permiteAnonimo: true,
      ativo: true,
      ordem: 10,
    },
  ];

  for (const category of categories) {
    await prisma.category.create({
      data: category,
    });
    console.log(`Categoria criada: ${category.label}`);
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
