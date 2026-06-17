import fs from "fs";
import { PrismaClient } from "../../../../generated/prisma/client";

const prisma = new PrismaClient();

function classify(name: string): string {
    const n = name.toLowerCase();
    
    if (n.includes("urgência") || n.includes("emergência") || n.includes("dor") || n.includes("hemorragia") || n.includes("curativo") || n.includes("alívio")) {
        return "Urgência";
    }
    if (n.includes("radiografia") || n.includes("panorâmica") || n.includes("periapical") || n.includes("telerradiografia") || n.includes("tomografia") || n.includes("rx") || n.includes("radiologia")) {
        return "Radiologia";
    }
    if (n.includes("ortodôntico") || n.includes("ortodontia") || n.includes("aparelho") || n.includes("arco lingual") || n.includes("disjuntor") || n.includes("bionator") || n.includes("hirax") || n.includes("macnamara") || n.includes("banda") || n.includes("bráquete") || n.includes("alinhador") || n.includes("tração") || n.includes("contenção fixa") || n.includes("placa hawley")) {
        return "Ortodontia";
    }
    if (n.includes("implante") || n.includes("cicatrizador") || n.includes("pilar") || n.includes("enxerto ósseo") || n.includes("levantamento de seio") || n.includes("sinus lift")) {
        return "Implantodontia";
    }
    if (n.includes("endodontia") || n.includes("canal") || n.includes("pulpotomia") || n.includes("pulpar") || n.includes("biopulpectomia") || n.includes("necropulpectomia") || n.includes("retroobturado") || n.includes("retratamento") || n.includes("remoção de pino")) {
        return "Endodontia";
    }
    if (n.includes("periodontal") || n.includes("gengivoplastia") || n.includes("gengivectomia") || n.includes("raspagem") || n.includes("alisamento") || n.includes("enxerto gengival") || n.includes("coroa clínica") || n.includes("aumento de coroa") || n.includes("cunha proximal") || n.includes("bolsa periodontal")) {
        return "Periodontia";
    }
    if (n.includes("alveoloplastia") || n.includes("amputação radicular") || n.includes("apicetomia") || n.includes("biópsia") || n.includes("cirurgia") || n.includes("ulectomia") || n.includes("ulotomia") || n.includes("condilectomia") || n.includes("frenectomia") || n.includes("frenotomia") || n.includes("exodontia") || n.includes("dente incluso") || n.includes("remoção de dente") || n.includes("sutura") || n.includes("bridectomia") || n.includes("bridotomia") || n.includes("cisto") || n.includes("exérese") || n.includes("osteotomia") || n.includes("sulcoplastia") || n.includes("torus") || n.includes("bichectomia")) {
        return "Cirurgia";
    }
    if (n.includes("prótese") || n.includes("coroa") || n.includes("provisória") || n.includes("provisório") || n.includes("pivô") || n.includes("pino") || n.includes("núcleo") || n.includes("inlay") || n.includes("onlay") || n.includes("ponte") || n.includes("dentadura") || n.includes("placa oclusal") || n.includes("bloco") || n.includes("facetas") || n.includes("lente de contato") || n.includes("enceramento") || n.includes("restauração metálica fundida")) {
        return "Prótese";
    }
    if (n.includes("biofilme") || n.includes("profilaxia") || n.includes("placa") || n.includes("selante") || n.includes("flúor") || n.includes("aplicação tópica") || n.includes("higiene") || n.includes("cariostático") || n.includes("tartarectomia")) {
        return "Prevenção";
    }
    if (n.includes("clareamento") || n.includes("restauração") || n.includes("resina") || n.includes("amálgama") || n.includes("ionômero") || n.includes("adequação do meio") || n.includes("ajuste oclusal") || n.includes("faceta de resina") || n.includes("colagem de fragmento")) {
        return "Dentística";
    }
    if (n.includes("exames") || n.includes("laboratório") || n.includes("anatomopatológico") || n.includes("citologia") || n.includes("punção") || n.includes("modelo de gesso") || n.includes("traçado") || n.includes("fotografia") || n.includes("documentação")) {
        return "Testes e exames laboratoriais";
    }

    return "Outros";
}

async function main() {
    const raw = fs.readFileSync("/home/william/Desktop/campos", "utf8");
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
    
    const treatments: Array<{ name: string; category: string; valuePrivate: number; valuePlan: number; active: boolean }> = [];
    
    let i = 0;
    while (i < lines.length) {
        if (lines[i] === "Tratamento" || lines[i] === "Categoria" || lines[i] === "Custo" || lines[i] === "Valor") {
            i++;
            continue;
        }
        
        const name = lines[i];
        i++;
        
        if (i < lines.length && lines[i] === "R$") {
            i++;
        }
        
        let costStr = "0,00";
        if (i < lines.length) {
            costStr = lines[i];
            i++;
        }
        
        if (i < lines.length && lines[i] === "R$") {
            i++;
        }
        
        let valStr = "0,00";
        if (i < lines.length) {
            valStr = lines[i];
            i++;
        }
        
        let active = true;
        if (i < lines.length && (lines[i] === "Ativo" || lines[i] === "Inativo")) {
            active = lines[i] === "Ativo";
            i++;
        }
        
        if (i < lines.length && lines[i] === "Adicionar ao controle de prótese") {
            i++;
        }
        
        const parseVal = (s: string) => {
            const clean = s.replace(/\./g, "").replace(",", ".");
            const parsed = parseFloat(clean);
            return isNaN(parsed) ? 0 : parsed;
        };
        
        const value = parseVal(valStr);
        const category = classify(name);
        
        treatments.push({
            name,
            category,
            valuePrivate: value,
            valuePlan: Math.round(value * 0.8 * 100) / 100,
            active
        });
    }
    
    console.log(`Parsed ${treatments.length} treatments.`);
    
    await prisma.treatment.deleteMany({});
    
    // Chunk database inserts to prevent stack size or memory issues with 300+ items
    const chunkSize = 100;
    for (let j = 0; j < treatments.length; j += chunkSize) {
        const chunk = treatments.slice(j, j + chunkSize);
        await prisma.treatment.createMany({
            data: chunk
        });
    }
    
    console.log("Database seeded successfully!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
