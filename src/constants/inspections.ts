
export const dummyInspections: Inspection[] = [
  {
    id: "1",
    title: "Fire",
    description:
      "Check fire extinguishers, alarms, and emergency exits to ensure compliance with fire safety regulations.",
    questions: [
      { id: "Q1", question: "Are all fire extinguishers fixed in place and unobstructed?", type: "yes_no" },
      { id: "Q2", question: "Have all fire extinguishers been checked and tagged within the last 6 months?", type: "yes_no" },
      { id: "Q3", question: "Are fire extinguishers clearly marked with signage indicating their type?", type: "yes_no" },
      { id: "Q4", question: "Are emergency exit signs clearly visible and lit up?", type: "yes_no" },
      { id: "Q5", question: "Are all emergency exit passageways and doorways clear and easily accessible?", type: "yes_no" },
      { id: "Q6", question: "Is the emergency evacuation map visible in a common area?", type: "yes_no" },
      { id: "Q7", question: "Does the emergency evacuation map clearly show the exits, routes and meeting point?", type: "yes_no" },
      { id: "Q8", question: "Description of Hazard/Issue", type: "text" },
      { id: "Q9", question: "Action Taken", type: "single_selection", options: ["Pulse Support", "Self-Actioned"] },
      { id: "Q10", question: "Business Units", type: "text" },
      { id: "Q11", question: "Area Number", type: "text" },
      { id: "Q12", question: "Date", type: "date" },
    ],
    status: "not_started",
  },
  {
    id: "2",
    title: "Electrical",
    description: "Inspect wiring, outlets, and appliances.",
    questions: [
      { id: "Q1", question: "Are there any broken/damaged plugs, sockets or switches?", type: "yes_no" },
      { id: "Q2", question: "Are any electrical cords damaged or frayed?", type: "yes_no" },
      { id: "Q3", question: "Is there an adequate number of power points for the appliances in use?", type: "yes_no" },
      { id: "Q4", question: "Are there any leads on the floor that may be a trip hazard?", type: "yes_no" },
      { id: "Q5", question: "Are all electrical cords marked with current inspection test tags?", type: "yes_no" },
      { id: "Q6", question: "Description of Hazard/Issue", type: "text" },
      { id: "Q7", question: "Action Taken", type: "single_selection", options: ["Pulse Support", "Self-Actioned"] },
      { id: "Q8", question: "Business Units", type: "text" },
      { id: "Q9", question: "Area Number", type: "text" },
      { id: "Q10", question: "Date", type: "date" },
    ],
        status: "not_started",

  },
  {
    id: "3",
    title: "Lighting",
    description: "Assess workplace lighting",
    questions: [
      { id: "Q1", question: "Is there adequate lighting to brighten the space?", type: "yes_no" },
      { id: "Q2", question: "Are there any lights out that need bulb replacing?", type: "yes_no" },
      { id: "Q3", question: "Are all light fittings clean with no dust or build up inside?", type: "yes_no" },
      { id: "Q4", question: "Are any light fittings broken and need replacing?", type: "yes_no" },
      { id: "Q5", question: "Are all electrical cords marked with current inspection test tags?", type: "yes_no" },
      { id: "Q6", question: "Description of Hazard/Issue", type: "text" },
      { id: "Q7", question: "Action Taken", type: "single_selection", options: ["Pulse Support", "Self-Actioned"] },
      { id: "Q8", question: "Business Units", type: "text" },
      { id: "Q9", question: "Area Number", type: "text" },
      { id: "Q10", question: "Date", type: "date" },
    ],
        status: "not_started",

  },
  {
    id: "4",
    title: "Walls, Floors, Ceilings & Stairwells",
    description: "Inspect walls, floors, ceilings, and stairwells for safety and maintenance.",
    questions: [
      { id: "Q1", question: "Are all walls clean and clear of cobwebs, dirt or any other materials?", type: "yes_no" },
      { id: "Q2", question: "Are there any cracks or holes in the wall that need patching?", type: "yes_no" },
      { id: "Q3", question: "Are all surfaces clear of uneven bumps that may be hazardous?", type: "yes_no" },
      { id: "Q4", question: "Are floors clean and free of trip hazards?", type: "yes_no" },
      { id: "Q5", question: "Are all floors free of obstruction and clutter in walkways?", type: "yes_no" },
      { id: "Q6", question: "Are all stairs clean, free of trip hazards and clear of obstruction and clutter?", type: "yes_no" },
      { id: "Q7", question: "Description of Hazard/Issue", type: "text" },
      { id: "Q8", question: "Action Taken", type: "single_selection", options: ["Pulse Support", "Self-Actioned"] },
      { id: "Q9", question: "Business Units", type: "text" },
      { id: "Q10", question: "Area Number", type: "text" },
      { id: "Q11", question: "Date", type: "date" },
    ],
        status: "not_started",

  },
  {
    id: "5",
    title: "Waste Management",
    description: "Ensure proper disposal and cleanliness of waste materials.",
    questions: [
      { id: "Q1", question: "Are there bins located in/close by the area?", type: "yes_no" },
      { id: "Q2", question: "Are the bins full?", type: "yes_no" },
      { id: "Q3", question: "Is there a waste separation system in place?", type: "yes_no" },
      { id: "Q4", question: "Description of Hazard/Issue", type: "text" },
      { id: "Q5", question: "Action Taken", type: "single_selection", options: ["Pulse Support", "Self-Actioned"] },
      { id: "Q6", question: "Business Units", type: "text" },
      { id: "Q7", question: "Area Number", type: "text" },
      { id: "Q8", question: "Date", type: "date" },
    ],
        status: "not_started",

  }
];
