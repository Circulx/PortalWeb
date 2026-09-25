import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <section>
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-black mb-4 text-center">Privacy Policy</h1>
                        <p className="text-base text-black text-left mb-2">
                            This Privacy Policy explains how Ind2B ("we", "us", "our") collects, uses, shares, and protects
                            information of users ("User", "you") accessing the platform at{' '}
                            <a href="https://www.ind2b.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">
                                www.ind2b.com
                            </a>{' '}
                            and any associated mobile or web-based applications ("Platform"). By using the Platform, you
                            consent to the practices described in this Policy.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">Information We Collect</h2>
                    <ul className="list-disc list-inside text-base text-black text-left mb-6">
                        <li>Account details: name, business name, email, phone number, address, GST/tax ID.</li>
                        <li>Transaction data: orders, listings, quotations, payment and invoicing details.</li>
                        <li>Technical data: IP address, device/browser type, cookies, and usage logs.</li>
                        <li>Communications: messages, support requests, and correspondence on the Platform.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">How We Use Information</h2>
                    <ul className="list-disc list-inside text-base text-black text-left mb-6">
                        <li>To create and manage accounts and facilitate Buyer-Seller transactions.</li>
                        <li>To improve, secure, and personalize the Platform.</li>
                        <li>To send transactional updates, notices, and (where permitted) marketing communications.</li>
                        <li>To comply with legal, tax, and regulatory obligations.</li>
                        <li>To detect fraud, abuse, or violations of Platform policies.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">Sharing of Information</h2>
                    <p className="text-base text-black text-left mb-2">Ind2B does not sell User data. Information may be shared with:</p>
                    <ul className="list-disc list-inside text-base text-black text-left mb-6">
                        <li>Other Users, strictly as needed to facilitate a transaction (e.g., Buyer details to Seller).</li>
                        <li>Service providers such as payment gateways, logistics, and IT/hosting partners.</li>
                        <li>Regulators or law enforcement, where required by law or to protect Platform integrity.</li>
                        <li>Successors, in the event of a merger, acquisition, or restructuring of Ind2B.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">Cookies</h2>
                    <p className="text-base text-black text-left mb-6">
                        The Platform uses cookies and similar technologies to enable core functionality, remember
                        preferences, and analyze usage. Users may control cookies through browser settings; disabling
                        cookies may limit some Platform features.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">Data Security</h2>
                    <p className="text-base text-black text-left mb-6">
                        We adopt reasonable technical and organizational safeguards to protect User data. However, no
                        method of transmission or storage is completely secure, and Ind2B cannot guarantee absolute
                        security of information transmitted over the Platform.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">Data Retention</h2>
                    <p className="text-base text-black text-left mb-6">
                        User data is retained for as long as the account remains active or as needed to comply with
                        legal, tax, or accounting obligations, after which it is securely deleted or anonymized.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">User Rights</h2>
                    <ul className="list-disc list-inside text-base text-black text-left mb-6">
                        <li>Access, correct, or update your account information.</li>
                        <li>Request deletion of your account, subject to legal/record-keeping requirements.</li>
                        <li>Opt out of marketing communications at any time.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">Third-Party Links</h2>
                    <p className="text-base text-black text-left mb-6">
                        The Platform may contain links to third-party websites. Ind2B is not responsible for the
                        privacy practices or content of such external sites.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">Changes to This Policy</h2>
                    <p className="text-base text-black text-left mb-6">
                        Ind2B may update this Privacy Policy periodically. Revised versions will be posted on the
                        Platform with an updated effective date, and continued use constitutes acceptance of the changes.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-black mb-4">Contact Us</h2>
                    <p className="text-base text-black text-left mb-2">
                        For privacy-related queries, please contact: Email:{' '}
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=support@ind2b.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">
                            support@ind2b.com
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;