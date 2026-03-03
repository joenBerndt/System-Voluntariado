
const projectId = "sgsntaqyfpiwfawhzate";
const functionName = "make-server-f99e977c";
const baseUrl = `https://${projectId}.supabase.co/functions/v1/${functionName}`;
const publicAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnc250YXF5ZnBpd2Zhd2h6YXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNjM5MDksImV4cCI6MjA3OTYzOTkwOX0.F4Xi9-oMLugOH143OsUR5mgNunYGJFVBBB6CHdZJCfk";

async function testEndpoint(path, name) {
    console.log(`Testing ${name} (${path})...`);
    try {
        const response = await fetch(`${baseUrl}${path}`, {
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`
            }
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            console.log('Response JSON:', JSON.stringify(json, null, 2).substring(0, 500) + (text.length > 500 ? '...' : ''));
            return { success: response.ok, data: json };
        } catch (e) {
            console.log('Response Text:', text.substring(0, 500));
            return { success: response.ok, error: 'Invalid JSON' };
        }
    } catch (error) {
        console.error(`Error fetching ${name}:`, error.message);
        return { success: false, error: error.message };
    }
}

async function runTests() {
    console.log("=== STARTING SUPABASE FUNCTION TESTS ===");
    console.log(`Base URL: ${baseUrl}`);

    // 1. Test Health
    // The baseUrl is .../v1/make-server-f99e977c
    // We want to hit .../v1/make-server-f99e977c/health
    // Which maps to the route /make-server-f99e977c/health internally

    await testEndpoint('/health', 'Health Check');

    // 2. Test Projects (READ)
    await testEndpoint('/projects', 'Get Projects');

    // 3. Test Volunteers (READ)
    await testEndpoint('/volunteers', 'Get Volunteers');

    // 4. Test Login (Auth)
    console.log("Testing Login...");
    let authToken = publicAnonKey; // Default to anon, but if we login we might get a token
    try {
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: 'admin@iiap.org', password: 'admin123' })
        });
        console.log(`Login Status: ${loginRes.status}`);
        const loginText = await loginRes.text();
        console.log('Login Response:', loginText.substring(0, 500));

        if (loginRes.ok) {
            const loginJson = JSON.parse(loginText);
            // Assuming the backend returns the user or session. If it returns a session access_token, we should use it.
            // But for now, let's just see if we can do it with anon key or if the login tells us something.
            // If your RLS requires authenticated user, we would need the token here.
            // For this test, let's stick to the key used in the app context.
        }
    } catch (e) {
        console.error("Login failed:", e);
    }

    // 5. Test CREATE Project
    console.log("Testing CREATE Project...");
    let createdProjectId = null;
    try {
        const createRes = await fetch(`${baseUrl}/projects`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${publicAnonKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: "Test Delete Backend",
                description: "Temporary project to test delete functionality",
                status: "inactivo",
                startDate: "2025-01-01",
                endDate: "2025-12-31"
            })
        });
        console.log(`CREATE Status: ${createRes.status}`);
        const createText = await createRes.text();
        console.log('CREATE Response:', createText.substring(0, 500));

        if (createRes.ok) {
            const createJson = JSON.parse(createText);
            // Adjust based on actual response structure. Usually data[0] or just data if single object.
            createdProjectId = createJson.data ? (Array.isArray(createJson.data) ? createJson.data[0].id : createJson.data.id) : null;
            if (!createdProjectId) createdProjectId = createJson.id; // Fallback
            console.log(`Created Project ID: ${createdProjectId}`);
        }
    } catch (e) {
        console.error("CREATE failed:", e);
    }

    // 6. Test DELETE Project
    if (createdProjectId) {
        console.log(`Testing DELETE Project (${createdProjectId})...`);
        try {
            const deleteRes = await fetch(`${baseUrl}/projects/${createdProjectId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${publicAnonKey}`
                }
            });
            console.log(`DELETE Status: ${deleteRes.status}`);
            const deleteText = await deleteRes.text();
            console.log('DELETE Response:', deleteText.substring(0, 500));
        } catch (e) {
            console.error("DELETE failed:", e);
        }
    } else {
        console.log("Skipping DELETE test because CREATE failed or didn't return an ID.");
    }

    console.log("=== TESTS COMPLETE ===");
}

runTests();
