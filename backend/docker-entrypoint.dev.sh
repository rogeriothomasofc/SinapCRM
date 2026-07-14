#!/bin/sh

# Entrypoint de desenvolvimento para o backend
# Autor: Atendechat

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando backend (dev)...${NC}"

wait_for_service() {
    local service=$1
    local host=$2
    local port=$3
    local max_attempts=60
    local attempt=1

    echo -e "${YELLOW}⏳ Aguardando $service em $host:$port...${NC}"

    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            echo -e "${GREEN}✅ $service está pronto!${NC}"
            return 0
        fi

        echo -e "${YELLOW}   Tentativa $attempt/$max_attempts...${NC}"
        sleep 1
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ Timeout aguardando $service${NC}"
    return 1
}

if ! wait_for_service "PostgreSQL" "postgres" 5432; then
    echo -e "${RED}❌ Falha ao conectar com PostgreSQL${NC}"
    exit 1
fi

if ! wait_for_service "Redis" "redis" 6379; then
    echo -e "${RED}❌ Falha ao conectar com Redis${NC}"
    exit 1
fi

echo -e "${YELLOW}🔄 Executando migrações do banco de dados...${NC}"
if npx sequelize db:migrate; then
    echo -e "${GREEN}✅ Migrações executadas com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Erro ao executar migrações${NC}"
    echo -e "${YELLOW}💡 A aplicação continuará funcionando com a estrutura atual do banco${NC}"
fi

echo -e "${YELLOW}🌱 Executando seeds do banco de dados...${NC}"
if npx sequelize db:seed:all; then
    echo -e "${GREEN}✅ Seeds executados com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Erro ao executar seeds (pode ser normal se já foram executados)${NC}"
fi

echo -e "${YELLOW}🚀 Iniciando aplicação em modo desenvolvimento...${NC}"
exec npm run dev:server
