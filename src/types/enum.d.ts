interface EnumerationsResponse {
    status: string;
    message: string;
    data: {
        IncidentTypes: string[];
        IncidentStatuses: string[];
        GeneralHazardTypes: string[];
        IncidentSeverityTypes: string[];
    };
}