export default function HelpPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black pt-20 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 prose dark:prose-invert">
                <h1>Help Center</h1>
                <p>Welcome to the Tirhuta Help Center.</p>
                <h2>Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <details className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                        <summary className="font-semibold cursor-pointer">How do I create an account?</summary>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">Click on the "Sign Up" button in the top right corner and follow the instructions.</p>
                    </details>
                    <details className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                        <summary className="font-semibold cursor-pointer">I forgot my password.</summary>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">Please contact support@tirhuta.com for password recovery.</p>
                    </details>
                </div>
            </div>
        </div>
    );
}
