export default function AppUsagePage() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-primary">
        App Usage Description
      </h2>
      <p className="mb-4">
        This section outlines how to effectively use the Harars WHS app for
        workplace safety management.
      </p>

      <ul className="ml-6 list-disc space-y-3">
        <li>
          <strong className="font-bold">Inspections:</strong> Quickly complete
          your scheduled inspections using easy-to-follow checklists.
        </li>
        <li>
          <strong className="font-bold">Reporting:</strong> See a hazard? Snap a
          picture, fill a short report, and assign it to the right team.
        </li>
        <li>
          <strong className="font-bold">Task Management:</strong> Managers and
          supervisors can assign work based on reported issues and track the
          status — <em>To Do ➔ In Progress ➔ Resolved ➔ Closed</em>.
        </li>
        <li>
          <strong className="font-bold">Notifications:</strong> Stay updated
          with instant alerts about task assignments, deadlines, and follow-ups.
        </li>
        <li>
          <strong className="font-bold">Dashboards:</strong> Track safety
          performance over time and make data-driven improvements.
        </li>
      </ul>
    </div>
  );
}
