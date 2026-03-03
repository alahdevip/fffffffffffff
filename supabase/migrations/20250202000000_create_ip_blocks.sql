-- Tabela para armazenar bloqueios de IP
CREATE TABLE IF NOT EXISTS ip_blocks (
    id BIGSERIAL PRIMARY KEY,
    ip TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    expiry TIMESTAMPTZ NOT NULL,
    is_permanent BOOLEAN DEFAULT FALSE,
    cta_stage INTEGER DEFAULT 0,
    cta_remaining INTEGER DEFAULT 0,
    cta_end BIGINT,
    device TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ip_blocks_ip ON ip_blocks(ip);
CREATE INDEX IF NOT EXISTS idx_ip_blocks_username ON ip_blocks(username);
CREATE INDEX IF NOT EXISTS idx_ip_blocks_is_permanent ON ip_blocks(is_permanent);

-- Comentários
COMMENT ON TABLE ip_blocks IS 'Armazena bloqueios de IP para impedir múltiplas pesquisas';
COMMENT ON COLUMN ip_blocks.ip IS 'Endereço IP do usuário';
COMMENT ON COLUMN ip_blocks.username IS 'Username do Instagram vinculado ao IP';
COMMENT ON COLUMN ip_blocks.expiry IS 'Data/hora de expiração do bloqueio';
COMMENT ON COLUMN ip_blocks.is_permanent IS 'Se true, o bloqueio é permanente';
COMMENT ON COLUMN ip_blocks.cta_stage IS 'Estágio do CTA (0-3)';
COMMENT ON COLUMN ip_blocks.cta_remaining IS 'Tempo restante do CTA em segundos';
COMMENT ON COLUMN ip_blocks.cta_end IS 'Timestamp de fim do CTA';
