export default function SecretBible() {
  return (
    <div className="fixed inset-0 w-full h-full">
      <iframe
        src="https://secretbible.org"
        className="w-full h-full border-0"
        title="Secret Bible"
        allow="clipboard-write; clipboard-read"
        data-testid="iframe-secret-bible"
      />
    </div>
  );
}
