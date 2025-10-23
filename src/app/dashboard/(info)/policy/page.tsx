export default function PrivacyPolicyPage() {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-primary">
        Privacy Policy
      </h2>
      <p>
        Your privacy is important to us. This Privacy Policy explains how Harars
        collects, uses, and protects your information when you use our app.
      </p>

      <ol className="ml-6 mt-4 list-decimal space-y-3">
        <li>
          <strong className="underline">Information We Collect:</strong> We may
          collect the following types of information:
          <ul className="ml-6 mt-2 list-disc">
            <li>
              Personal Information (e.g., name, email address) — only if you
              create an account or contact us.
            </li>
            <li>
              Usage Data — such as actions taken within the app, device type,
              and crash reports to help improve the experience.
            </li>
            <li>
              Optional Inputs — any data you choose to enter for your own use.
            </li>
          </ul>
        </li>

        <li>
          <strong className="underline">How We Use Your Information:</strong> To
          provide and improve app features, respond to support requests,
          maintain security, and send important updates if necessary.
        </li>

        <li>
          <strong className="underline">Data Storage & Security:</strong> All
          data is securely stored and protected using industry-standard
          practices. We do not sell, rent, or share your personal information.
        </li>

        <li>
          <strong className="underline">Third-Party Services:</strong> We may
          use trusted third-party tools (like analytics or crash reporting) that
          collect non-personal data under their own privacy policies.
        </li>

        <li>
          <strong className="underline">Your Choices:</strong> You can choose
          not to provide certain data, but that may limit some features. You may
          delete your account or data anytime by contacting us.
        </li>

        <li>
          <strong className="underline">Changes to This Policy:</strong> We may
          update this Privacy Policy occasionally and will notify users of
          significant changes.
        </li>
      </ol>
    </div>
  );
}
