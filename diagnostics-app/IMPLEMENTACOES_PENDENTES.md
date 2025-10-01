# 🚀 IMPLEMENTAÇÕES PENDENTES - BASEADO NA BIBLIOTECA FASTAPI

## 📋 **ANÁLISE DA BIBLIOTECA:**

Baseado no código do backend FastAPI (`backend/app/services/mercadolivre_oauth.py` e arquivos relacionados), identifiquei funcionalidades importantes que devem ser portadas para o diagnostics-app Next.js.

---

## 🔄 **1. REFRESH TOKEN AUTOMÁTICO (PRIORIDADE ALTA)** ⭐⭐⭐⭐⭐

### **Problema Atual:**
- Token do Mercado Livre expira em **6 horas**
- Usuário precisa fazer login manualmente novamente
- Aplicação para de funcionar quando token expira

### **Solução da Biblioteca:**
```python
# backend/app/services/mercadolivre_oauth.py (linha 157-225)
async def refresh_access_token(
    self,
    refresh_token: str,
    client_id: str,
    client_secret: str
) -> TokenResponse:
    """Atualiza access token usando refresh token."""
    # Faz POST para https://api.mercadolibre.com/oauth/token
    # com grant_type=refresh_token
```

### **O que implementar:**

#### **1.1. Middleware de Auto-Refresh** 
Criar arquivo: `diagnostics-app/src/middleware.ts`

**Funcionalidade:**
- Interceptar TODAS as requisições para endpoints protegidos
- Verificar se token vai expirar em < 30 minutos
- Se sim, fazer refresh automático ANTES de fazer a requisição
- Atualizar cookie com novo token
- Continuar requisição normalmente

**Lógica:**
```typescript
export async function middleware(request: NextRequest) {
  // 1. Ler token do cookie
  const token = request.cookies.get("meli_token");
  
  // 2. Verificar se expira em < 30 min
  const expiresAt = token.expires_at;
  const now = Date.now();
  const timeLeft = expiresAt - now;
  
  // 3. Se < 30 min, fazer refresh
  if (timeLeft < 1800000) { // 30 minutos
    const newToken = await refreshToken(token.refresh_token);
    // Atualizar cookie
  }
  
  // 4. Continuar requisição
  return NextResponse.next();
}

// Configurar para rotas protegidas
export const config = {
  matcher: ['/api/meli/:path*', '/diagnostics', '/dashboard']
}
```

#### **1.2. Helper de Refresh Token**
Criar arquivo: `diagnostics-app/src/lib/refresh-token.ts`

```typescript
export async function refreshAccessToken(refreshToken: string) {
  const response = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.MELI_CLIENT_ID!,
      client_secret: process.env.MELI_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  });
  
  if (!response.ok) {
    // Se refresh falhar, forçar novo login
    throw new Error("REFRESH_FAILED");
  }
  
  return await response.json();
}
```

#### **1.3. Dependency/Helper para Endpoints**
Criar arquivo: `diagnostics-app/src/lib/get-valid-token.ts`

```typescript
/**
 * Retorna token válido (faz refresh se necessário)
 * USO: Chamar em TODOS os endpoints protegidos
 */
export async function getValidToken(cookies: ReadonlyRequestCookies) {
  const tokenCookie = cookies.get("meli_token");
  if (!tokenCookie) {
    throw new Error("NOT_AUTHENTICATED");
  }
  
  const token = JSON.parse(tokenCookie.value);
  
  // Verificar se token expira em < 5 minutos
  const expiresAt = new Date(token.expires_at || Date.now());
  const now = new Date();
  const timeLeft = expiresAt.getTime() - now.getTime();
  
  // Se expira em < 5 min, fazer refresh
  if (timeLeft < 300000 && token.refresh_token) {
    const newToken = await refreshAccessToken(token.refresh_token);
    return {
      token: newToken,
      needsUpdate: true, // Sinaliza para atualizar cookie
    };
  }
  
  return {
    token,
    needsUpdate: false,
  };
}
```

#### **1.4. Atualizar TODOS os Endpoints Protegidos**

**ANTES:**
```typescript
export async function GET() {
  const jar = await cookies();
  const tokenCookie = jar.get("meli_token");
  const token = JSON.parse(tokenCookie.value);
  const accessToken = token.access_token;
  
  // Fazer requisição para ML...
}
```

**DEPOIS:**
```typescript
export async function GET() {
  const jar = await cookies();
  const { token, needsUpdate } = await getValidToken(jar);
  const accessToken = token.access_token;
  
  // Fazer requisição para ML...
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  // Se token foi atualizado, salvar no cookie
  if (needsUpdate) {
    const response = NextResponse.json(data);
    response.cookies.set("meli_token", JSON.stringify(token), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }
  
  return NextResponse.json(data);
}
```

---

## 🔒 **2. VALIDAÇÃO DE TOKEN COM ML (PRIORIDADE MÉDIA)** ⭐⭐⭐

### **Problema:**
- Não validamos se token está realmente válido no ML
- Se token for revogado, continuamos usando

### **Solução da Biblioteca:**
```python
# backend/app/services/mercadolivre_oauth.py (linha 227-261)
async def validate_token_with_ml(self, access_token: str) -> Dict[str, Any]:
    """Valida token diretamente com Mercado Livre."""
    # GET https://api.mercadolibre.com/users/me
```

### **O que implementar:**
Criar endpoint: `/api/oauth/validate`

```typescript
export async function GET() {
  const jar = await cookies();
  const tokenCookie = jar.get("meli_token");
  
  if (!tokenCookie) {
    return NextResponse.json({ valid: false });
  }
  
  const token = JSON.parse(tokenCookie.value);
  
  // Validar com ML
  const res = await fetch("https://api.mercadolibre.com/users/me", {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });
  
  if (res.status === 401) {
    // Token inválido, deletar cookie
    const response = NextResponse.json({ valid: false });
    response.cookies.delete("meli_token");
    return response;
  }
  
  return NextResponse.json({ valid: res.ok });
}
```

---

## 🛡️ **3. RATE LIMITING E SEGURANÇA (PRIORIDADE MÉDIA)** ⭐⭐⭐

### **Solução da Biblioteca:**
```python
# backend/app/services/mercadolivre_oauth.py (linha 48-66)
async def validate_request_security(self, request: Request, endpoint: str) -> bool:
    """Valida segurança da requisição."""
    client_ip = await self.get_client_ip(request)
    
    # Rate limiting
    if self.rate_limiter.is_rate_limited(client_ip, endpoint):
        raise HTTPException(status_code=429, ...)
```

### **O que implementar:**
Criar arquivo: `diagnostics-app/src/lib/rate-limiter.ts`

```typescript
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const key = `${ip}`;
  
  const record = requestCounts.get(key);
  
  if (!record || now > record.resetAt) {
    // Nova janela
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count };
}
```

**Usar em endpoints:**
```typescript
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { allowed, remaining } = checkRateLimit(ip, 30, 60000); // 30 req/min
  
  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em 1 minuto." },
      { status: 429 }
    );
  }
  
  // Continuar...
}
```

---

## 📊 **4. MONITORAMENTO E LOGGING (PRIORIDADE BAIXA)** ⭐⭐

### **Solução da Biblioteca:**
```python
# backend/app/core/mercadolivre_oauth.py
class SecurityLogger:
    def log_token_refresh(self, user_id: str, success: bool):
        # Log de refresh de tokens
    
    def log_security_violation(self, type: str, message: str, ip: str):
        # Log de violações de segurança
```

### **O que implementar:**
Criar arquivo: `diagnostics-app/src/lib/logger.ts`

```typescript
export const logger = {
  tokenRefresh(userId: string, success: boolean) {
    console.log(`[TOKEN_REFRESH] User: ${userId}, Success: ${success}, Time: ${new Date().toISOString()}`);
    // Pode enviar para serviço externo (Sentry, LogRocket, etc)
  },
  
  securityViolation(type: string, message: string, ip: string) {
    console.error(`[SECURITY] Type: ${type}, IP: ${ip}, Message: ${message}`);
    // Alertar administradores
  },
  
  apiError(endpoint: string, error: Error) {
    console.error(`[API_ERROR] Endpoint: ${endpoint}, Error: ${error.message}`);
  }
};
```

---

## 🎯 **5. MELHORIAS NOS ENDPOINTS EXISTENTES** ⭐⭐⭐⭐

### **5.1. Endpoint de Vendas - Adicionar Paginação**

**ATUAL:**
```typescript
// Busca até 200 pedidos apenas
const ordersRes = await fetch(url + "&limit=200");
```

**MELHORAR:**
```typescript
// Buscar TODOS os pedidos usando paginação
async function getAllOrders(accessToken: string, dateFrom: string, dateTo: string) {
  let allOrders = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;
  
  while (hasMore) {
    const res = await fetch(
      `https://api.mercadolibre.com/orders/search?seller=${userId}&order.date_created.from=${dateFrom}&order.date_created.to=${dateTo}&offset=${offset}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${accessToken}` }}
    );
    
    const data = await res.json();
    allOrders.push(...data.results);
    
    hasMore = data.paging.total > (offset + limit);
    offset += limit;
    
    // Limite de segurança (não buscar mais de 1000 pedidos)
    if (allOrders.length >= 1000) break;
  }
  
  return allOrders;
}
```

### **5.2. Cache de Resultados**

Implementar cache simples para evitar requisições desnecessárias:

```typescript
// diagnostics-app/src/lib/cache.ts
const cache = new Map<string, { data: any; expiresAt: number }>();

export function getCached(key: string) {
  const cached = cache.get(key);
  if (!cached || Date.now() > cached.expiresAt) {
    return null;
  }
  return cached.data;
}

export function setCache(key: string, data: any, ttlMs: number = 300000) { // 5 min
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}
```

**Usar em endpoints:**
```typescript
export async function GET(req: NextRequest) {
  const cacheKey = `sales:${userId}:${days}`;
  const cached = getCached(cacheKey);
  
  if (cached) {
    return NextResponse.json({ ...cached, cached: true });
  }
  
  // Buscar dados...
  const data = await fetchSalesData();
  
  // Cachear por 5 minutos
  setCache(cacheKey, data);
  
  return NextResponse.json(data);
}
```

---

## 📅 **PRIORIZAÇÃO DE IMPLEMENTAÇÃO:**

### **Semana 1: CRÍTICO** 🔴
1. ✅ **Refresh Token Automático** (1.1 a 1.4)
   - Middleware de auto-refresh
   - Helper getValidToken
   - Atualizar todos endpoints

### **Semana 2: IMPORTANTE** 🟡
2. ✅ **Validação de Token** (2)
3. ✅ **Paginação de Vendas** (5.1)
4. ✅ **Cache de Resultados** (5.2)

### **Semana 3: DESEJÁVEL** 🟢
5. ✅ **Rate Limiting** (3)
6. ✅ **Logging** (4)

---

## 🧪 **COMO TESTAR:**

### **Teste 1: Refresh Automático**
```bash
# 1. Fazer login
curl https://diagnostics-app-topaz.vercel.app/api/oauth/login

# 2. Esperar 5h50min (ou modificar token no cookie para expirar em 1 min)

# 3. Fazer requisição protegida
curl https://diagnostics-app-topaz.vercel.app/api/meli/account-info

# 4. Deve funcionar (refresh automático aconteceu)
```

### **Teste 2: Validação de Token**
```bash
# 1. Revogar token no painel do ML

# 2. Fazer requisição
curl https://diagnostics-app-topaz.vercel.app/api/oauth/validate

# 3. Deve retornar { valid: false } e deletar cookie
```

### **Teste 3: Rate Limiting**
```bash
# Fazer 50 requisições em 1 segundo
for i in {1..50}; do
  curl https://diagnostics-app-topaz.vercel.app/api/meli/sales
done

# Deve retornar 429 após 30 requisições
```

---

## 📝 **RESUMO:**

**Total de arquivos a criar:**
- `src/middleware.ts` - Auto-refresh middleware
- `src/lib/refresh-token.ts` - Helper de refresh
- `src/lib/get-valid-token.ts` - Dependency de token válido
- `src/lib/rate-limiter.ts` - Rate limiting
- `src/lib/logger.ts` - Logging
- `src/lib/cache.ts` - Cache simples
- `src/api/oauth/validate/route.ts` - Validação de token

**Total de arquivos a modificar:**
- Todos endpoints em `src/app/api/meli/*` - Usar getValidToken
- `src/app/api/meli/sales/route.ts` - Adicionar paginação

---

**Status:** 📋 Documentado
**Próximo passo:** Implementar Semana 1 (Refresh Token Automático)

