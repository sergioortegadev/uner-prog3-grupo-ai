import { colors } from "./colors.js";


const BASE_URL = process.env.BASE_URL;

const HEALTH_EDNPOINT = `${BASE_URL}/api/v1/health`;
const LOGIN_ENDPOINT = `${BASE_URL}/api/v1/auth/login`;
const OBRAS_SOCIALES_ENDPOINT = `${BASE_URL}/api/v1/obras-sociales`;

const LOGIN_EMAIL = process.env.LOGIN_EMAIL;
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD;

// Interval < Renden sleep time
const MIN = 5
const KEEP_ALIVE_INTERVAL = MIN * 60 * 1000;

// JWT
let jwtToken: string | null = null

// Sleep helper

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// Fetch con reintentos (cuando está dormido)

const fetchWithRetry = async (
    url: string,
    options: RequestInit = {},
    retries = 10,
    delayMs = 5000
): Promise<Response> => {
    for ( let attempt = 1; attempt <= retries; attempt++ ) {
        try {
            const res = await fetch(url, options);

            // Si responde, aunque sea un 500, lo devolvemos
            return res
        } catch (error) {
            console.log(` [Retry] intento ${attempt}/${retries} - ${url}`);
            if (attempt === retries) throw error;
            await sleep(delayMs)
        }
    }
    throw new Error(`${colors.BgRed}  - fetchWithRetry fail - ${colors.Reset}`);
};

// 1. Levantar servicio

const waitUntilHealty = async (): Promise<void> => {
    console.log('\n [Health] Esperando que el servicio despierte...');

    while (true) {
        try {
            const res = await fetchWithRetry(HEALTH_EDNPOINT, {}, 3, 2000);

            if (res.ok) {
                console.log(`${colors.FgGreen}  - [HEALTH] OK -${colors.Reset}`);
                return;
            }
            console.log(`  - [HEALTH] Status: ${res.status}`);
            
        } catch (error) {
            console.log(`${colors.BgRed}  - [HEALTH] Error, reintentando...${colors.Reset}`);
        }

        await sleep(5000);
    }
}

// 2. Login y obtención de JWT

const login = async (): Promise<boolean> => {
    try {
        console.log(' [Login] Intentando login...');
        
        const res = await fetchWithRetry(
            LOGIN_ENDPOINT,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    email: LOGIN_EMAIL,
                    password: LOGIN_PASSWORD
                })
            },
            5,
            2000
        );

        if(!res.ok) {
            console.log(`${colors.BgRed}  - [LOGIN] fail - status: ${res.status}${colors.Reset}`);
            return false
        }

        const data = await res.json();

        // Memorizar el token obtenido
        jwtToken = data?.data?.token ?? data?.token ?? null;
        

        if (!jwtToken) {
            console.log('  - [LOGIN] fail - no se encuentra token en la respuesta');
            return false;
        }

        console.log(`${colors.FgGreen}  - [LOGIN] OK - JWT Obtenido${colors.Reset}`);
        return true;
    } catch (error) {
        console.log(`${colors.BgRed}  - [LOGIN] Error: ${error}${colors.Reset}`);
        return false;
    }
}

// 3. Consumir endpoint protegido

const fetchObrasSociales = async (): Promise<void> => {
    if (!jwtToken) {
        console.log('  - [Obras-Sociales] No hay JWT, intentando login...');
        const ok = await login();
        if (!ok) return;
    }

    try {
        const res = await fetchWithRetry(
            OBRAS_SOCIALES_ENDPOINT,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                }
            },
            3,
            2000
        );

        if (res.status === 401) {
            console.log('  - [Obras-Sociales] Token expirado. Re-login...');
            jwtToken = null;
            await login();
            return;
        }

        if (!res.ok) {
            console.log(`${colors.BgRed}  - [Obras-Sociales] Error - status: ${res.status}${colors.Reset}`);
            return
        }

        const data = await res.json();
        const formatDateAR = () => {
            return new Intl.DateTimeFormat('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }).format(new Date());
        };
        console.log(`  - [Obras-Sociales] OK - ${formatDateAR()} - items: ${
            Array.isArray(data.data) ? data.data.length : 'N/A'
        }`);

    } catch (error) {
        console.log(`${colors.BgRed}  - [Obras-Sociales] Error: ${error}${colors.Reset}`);        
    }
}

// Main Loop

const main = async () => {
    console.log(`\n ${colors.BgYellow}[Starting keep alive - backend at render]${colors.Reset}`);
    
    await waitUntilHealty();

    await login();

    // primer request inmediato
    console.log(' [KEEP ALIVE] starting...');
    await fetchObrasSociales();
    console.log(`    [LOOP KEEP ALIVE] working every ${MIN} minutes`);
    
    // Loop Keep-Alive
    setInterval(async () => {
        await fetchObrasSociales();
        console.log(`    [LOOP KEEP ALIVE] working every ${MIN} minutes`);
    }, KEEP_ALIVE_INTERVAL);
}

main().catch(error => {
    console.error(`${colors.BgRed}   Fatal Error: \n${error}${colors.Reset}`);
    process.exit(1)
})