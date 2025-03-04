
// Define the type for the incident report
 interface IncidentReport {
    id: string;
    title: string;
    description: string;
    incidentId: string;
    userId: string;
    reporter_coordinates: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Define the type for the incident
   interface Incident {
    id: string;
    title: string;
    description: string;
    incidentType: string;
    generalHazardId: string;
    medicalHazardId: string;
    incident_coordinates: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Define the type for the general hazard
   interface GeneralHazard {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Define the type for each item in the data array
   interface IncidentData {
    incidentReport: IncidentReport;
    incident: Incident;
    generalHazard: GeneralHazard;
    media:MediaItem[]
  }
  
  // Define the type for the API response
   interface NewIncidentReport  {
    incidentTitle: string;
    generalHazardDescription: string;
    incidentDescription: string;
    coordinates: string;
    incidentType: string;
    hazardType: string;
    status: string;
    severity: string;
    media: string[]; // Array of media file paths
  };
   interface IncidentApiResponse {
    status: string;
    message: string;
    data: IncidentData[];
  }
 interface SingleIncidentApiResponse {
    status: string;
    message: string;
    data: IncidentData;
  }