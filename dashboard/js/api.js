const SafetyApi = (() => {
    const baseUrl = getBaseUrl();

    function getBaseUrl() {
        if (window.location.protocol === "file:") {
            return "http://127.0.0.1:5000";
        }

        if (window.location.port && window.location.port !== "5000") {
            return `${window.location.protocol}//${window.location.hostname}:5000`;
        }

        return "";
    }

    async function request(path) {
        try {
            const response = await fetch(`${baseUrl}${path}`, {
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const result = await response.json();

            if (result.success === false) {
                throw new Error(result.message || "API request failed");
            }

            return typeof result.data !== "undefined" ? result.data : result;
        } catch (error) {
            throw new Error(error.message || "Unable to connect to backend");
        }
    }

    function getHealth() {
        return request("/api/health");
    }

    function getWorkers() {
        return request("/api/workers");
    }

    function getEvents() {
        return request("/api/events");
    }

    return {
        getHealth,
        getWorkers,
        getEvents
    };
})();
