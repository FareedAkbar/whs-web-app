export const dummyInspections: Inspection[] = [
  {
    id: "1",
    title: "Fire",
    description:
      "Check fire extinguishers, alarms, and emergency exits to ensure compliance with fire safety regulations.",
    questions: [
      {
        id: "Q1",
        title: "Are all fire extinguishers fixed in place and unobstructed?",
        type: "YES_NO",
      },
      {
        id: "Q2",
        title:
          "Have all fire extinguishers been checked and tagged within the last 6 months?",
        type: "YES_NO",
      },
      {
        id: "Q3",
        title:
          "Are fire extinguishers clearly marked with signage indicating their type?",
        type: "YES_NO",
      },
      {
        id: "Q4",
        title: "Are emergency exit signs clearly visible and lit up?",
        type: "YES_NO",
      },
      {
        id: "Q5",
        title:
          "Are all emergency exit passageways and doorways clear and easily accessible?",
        type: "YES_NO",
      },
      {
        id: "Q6",
        title: "Is the emergency evacuation map visible in a common area?",
        type: "YES_NO",
      },
      {
        id: "Q7",
        title:
          "Does the emergency evacuation map clearly show the exits, routes and meeting point?",
        type: "YES_NO",
      },
      { id: "Q8", title: "Description of Hazard/Issue", type: "TEXT" },
      {
        id: "Q9",
        title: "Action Taken",
        type: "SINGLE_OPTION",
        options: ["Pulse Support", "Self-Actioned"],
      },
      { id: "Q10", title: "Business Units", type: "TEXT" },
      { id: "Q11", title: "Area Number", type: "TEXT" },
      { id: "Q12", title: "Date", type: "DATE" },
    ],
    status: "not_started",
  },
  {
    id: "2",
    title: "Electrical",
    description: "Inspect wiring, outlets, and appliances.",
    questions: [
      {
        id: "Q1",
        title: "Are there any broken/damaged plugs, sockets or switches?",
        type: "YES_NO",
      },
      {
        id: "Q2",
        title: "Are any electrical cords damaged or frayed?",
        type: "YES_NO",
      },
      {
        id: "Q3",
        title:
          "Is there an adequate number of power points for the appliances in use?",
        type: "YES_NO",
      },
      {
        id: "Q4",
        title: "Are there any leads on the floor that may be a trip hazard?",
        type: "YES_NO",
      },
      {
        id: "Q5",
        title:
          "Are all electrical cords marked with current inspection test tags?",
        type: "YES_NO",
      },
      { id: "Q6", title: "Description of Hazard/Issue", type: "TEXT" },
      {
        id: "Q7",
        title: "Action Taken",
        type: "SINGLE_OPTION",
        options: ["Pulse Support", "Self-Actioned"],
      },
      { id: "Q8", title: "Business Units", type: "TEXT" },
      { id: "Q9", title: "Area Number", type: "TEXT" },
      { id: "Q10", title: "Date", type: "DATE" },
    ],
    status: "not_started",
  },
  {
    id: "3",
    title: "Lighting",
    description: "Assess workplace lighting",
    questions: [
      {
        id: "Q1",
        title: "Is there adequate lighting to brighten the space?",
        type: "YES_NO",
      },
      {
        id: "Q2",
        title: "Are there any lights out that need bulb replacing?",
        type: "YES_NO",
      },
      {
        id: "Q3",
        title: "Are all light fittings clean with no dust or build up inside?",
        type: "YES_NO",
      },
      {
        id: "Q4",
        title: "Are any light fittings broken and need replacing?",
        type: "YES_NO",
      },
      {
        id: "Q5",
        title:
          "Are all electrical cords marked with current inspection test tags?",
        type: "YES_NO",
      },
      { id: "Q6", title: "Description of Hazard/Issue", type: "TEXT" },
      {
        id: "Q7",
        title: "Action Taken",
        type: "SINGLE_OPTION",
        options: ["Pulse Support", "Self-Actioned"],
      },
      { id: "Q8", title: "Business Units", type: "TEXT" },
      { id: "Q9", title: "Area Number", type: "TEXT" },
      { id: "Q10", title: "Date", type: "DATE" },
    ],
    status: "not_started",
  },
  {
    id: "4",
    title: "Walls, Floors, Ceilings & Stairwells",
    description:
      "Inspect walls, floors, ceilings, and stairwells for safety and maintenance.",
    questions: [
      {
        id: "Q1",
        title:
          "Are all walls clean and clear of cobwebs, dirt or any other materials?",
        type: "YES_NO",
      },
      {
        id: "Q2",
        title: "Are there any cracks or holes in the wall that need patching?",
        type: "YES_NO",
      },
      {
        id: "Q3",
        title: "Are all surfaces clear of uneven bumps that may be hazardous?",
        type: "YES_NO",
      },
      {
        id: "Q4",
        title: "Are floors clean and free of trip hazards?",
        type: "YES_NO",
      },
      {
        id: "Q5",
        title: "Are all floors free of obstruction and clutter in walkways?",
        type: "YES_NO",
      },
      {
        id: "Q6",
        title:
          "Are all stairs clean, free of trip hazards and clear of obstruction and clutter?",
        type: "YES_NO",
      },
      { id: "Q7", title: "Description of Hazard/Issue", type: "TEXT" },
      {
        id: "Q8",
        title: "Action Taken",
        type: "SINGLE_OPTION",
        options: ["Pulse Support", "Self-Actioned"],
      },
      { id: "Q9", title: "Business Units", type: "TEXT" },
      { id: "Q10", title: "Area Number", type: "TEXT" },
      { id: "Q11", title: "Date", type: "DATE" },
    ],
    status: "not_started",
  },
  {
    id: "5",
    title: "Waste Management",
    description: "Ensure proper disposal and cleanliness of waste materials.",
    questions: [
      {
        id: "Q1",
        title: "Are there bins located in/close by the area?",
        type: "YES_NO",
      },
      { id: "Q2", title: "Are the bins full?", type: "YES_NO" },
      {
        id: "Q3",
        title: "Is there a waste separation system in place?",
        type: "YES_NO",
      },
      { id: "Q4", title: "Description of Hazard/Issue", type: "TEXT" },
      {
        id: "Q5",
        title: "Action Taken",
        type: "SINGLE_OPTION",
        options: ["Pulse Support", "Self-Actioned"],
      },
      { id: "Q6", title: "Business Units", type: "TEXT" },
      { id: "Q7", title: "Area Number", type: "TEXT" },
      { id: "Q8", title: "Date", type: "DATE" },
    ],
    status: "not_started",
  },
];
