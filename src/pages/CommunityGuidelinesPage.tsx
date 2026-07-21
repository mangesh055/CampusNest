import React from 'react'
import LegalPageLayout from '../components/layout/LegalPageLayout'

export default function CommunityGuidelinesPage() {
  const sections = [
    { id: 'purpose', title: '1. Purpose' },
    { id: 'values', title: '2. Our Values' },
    { id: 'expected-conduct', title: '3. Expected Conduct' },
    { id: 'prohibited-behaviour', title: '4. Prohibited Behaviour' },
    { id: 'prohibited-items', title: '5. Prohibited Marketplace Items' },
    { id: 'roommate-matching', title: '6. Roommate Matching' },
    { id: 'moderation', title: '7. Moderation and Enforcement' },
    { id: 'safety-students', title: '8. Safety Tips for Students' },
    { id: 'safety-owners', title: '9. Safety Tips for Owners' },
    { id: 'intellectual-property', title: '10. Intellectual Property' },
    { id: 'changes', title: '11. Changes' },
    { id: 'contact', title: '12. Contact' },
  ]

  return (
    <LegalPageLayout
      title="Community Guidelines"
      lastUpdated="20 July 2026"
      effectiveDate="20 July 2026"
      version="1.0"
      sections={sections}
    >
      <section id="purpose">
        <h2>1. PURPOSE</h2>
        <p>FlatsNFood is a community built for college students, accommodation providers, and mess service operators. These Community Guidelines ("Guidelines") establish the standards of behaviour expected from all users to maintain a safe, respectful, and trustworthy platform.</p>
        <p>By using FlatsNFood, you agree to abide by these Guidelines in addition to our Terms & Conditions.</p>
      </section>

      <section id="values">
        <h2>2. OUR VALUES</h2>
        <ul>
          <li><strong>Trust & Transparency</strong> — Honest information builds a reliable community.</li>
          <li><strong>Respect & Inclusivity</strong> — Every user deserves respectful treatment regardless of background.</li>
          <li><strong>Safety & Security</strong> — Protecting users from harm, fraud, and abuse is paramount.</li>
          <li><strong>Accountability</strong> — Users are responsible for their actions on the Platform.</li>
        </ul>
      </section>

      <section id="expected-conduct">
        <h2>3. EXPECTED CONDUCT</h2>

        <h3>3.1 Honesty in Listings</h3>
        <p><strong>Property Owners must:</strong></p>
        <ul>
          <li>Provide accurate descriptions, photos, pricing, and amenity information.</li>
          <li>Update listings promptly when availability, pricing, or conditions change.</li>
          <li>Not use photos from other properties or stock images to misrepresent their listing.</li>
          <li>Disclose known issues (maintenance problems, noise, restrictions).</li>
        </ul>
        <p><strong>Mess Owners must:</strong></p>
        <ul>
          <li>Provide accurate menu information, meal plans, and pricing.</li>
          <li>Honour the terms of active subscriptions.</li>
          <li>Maintain hygiene standards and FSSAI compliance.</li>
          <li>Generate QR codes honestly and not manipulate attendance records.</li>
        </ul>

        <h3>3.2 Honest Reviews</h3>
        <ul>
          <li>Write reviews based on <strong>genuine personal experience</strong> only.</li>
          <li>Be specific, factual, and constructive in your feedback.</li>
          <li>Do not post reviews for places you haven't used.</li>
          <li>Do not post fake positive reviews for your own listing or fake negative reviews for competitors.</li>
          <li>Do not offer or accept compensation in exchange for reviews.</li>
        </ul>

        <h3>3.3 Community Marketplace</h3>
        <ul>
          <li>List only items you <strong>own and have the right to sell</strong>.</li>
          <li>Provide accurate descriptions, photos, and pricing.</li>
          <li>Be responsive to buyer enquiries and honour agreed terms.</li>
          <li>Do not list prohibited items (see Section 5).</li>
          <li>Complete transactions honestly — do not scam, ghost, or defraud other users.</li>
        </ul>

        <h3>3.4 Respectful Communication</h3>
        <ul>
          <li>Treat all users with respect and courtesy.</li>
          <li>Respond to enquiries and messages in a reasonable timeframe.</li>
          <li>Communicate clearly about availability, terms, and expectations.</li>
          <li>Resolve disagreements calmly and constructively.</li>
        </ul>
      </section>

      <section id="prohibited-behaviour">
        <h2>4. PROHIBITED BEHAVIOUR</h2>
        <p>The following conduct is strictly prohibited and may result in account suspension or permanent ban:</p>

        <h3>4.1 Harassment and Abuse</h3>
        <ul>
          <li>Bullying, intimidation, threats, or stalking of any user.</li>
          <li>Sexual harassment, unwanted advances, or sexually explicit messages.</li>
          <li>Targeting users based on gender, religion, caste, ethnicity, sexual orientation, disability, or any other protected characteristic.</li>
          <li>Doxxing (sharing another user's personal information without consent).</li>
        </ul>

        <h3>4.2 Fraud and Deception</h3>
        <ul>
          <li>Creating fake listings for properties or messes that do not exist.</li>
          <li>Misrepresenting the condition, location, pricing, or availability of a listing.</li>
          <li>Impersonating another user, organisation, or FlatsNFood staff.</li>
          <li>Manipulating ratings and reviews through fake accounts, paid reviews, or review bombing.</li>
          <li>Phishing, social engineering, or attempting to steal user credentials.</li>
          <li>Sharing or manipulating QR codes for fraudulent meal attendance.</li>
        </ul>

        <h3>4.3 Spam and Manipulation</h3>
        <ul>
          <li>Posting repetitive, irrelevant, or promotional content unrelated to the community.</li>
          <li>Creating multiple accounts to circumvent bans or manipulate the platform.</li>
          <li>Using automated tools, bots, or scrapers without authorisation.</li>
          <li>Keyword stuffing or misleading categorisation of listings/posts.</li>
        </ul>

        <h3>4.4 Illegal Activity</h3>
        <ul>
          <li>Listing or promoting illegal goods, drugs, weapons, or counterfeit items.</li>
          <li>Using the Platform for money laundering, tax evasion, or any illegal financial activity.</li>
          <li>Violating tenancy laws, building codes, or food safety regulations.</li>
          <li>Any activity that violates Indian Penal Code provisions or other applicable law.</li>
        </ul>

        <h3>4.5 Harmful Content</h3>
        <ul>
          <li>Content that promotes violence, self-harm, or dangerous activities.</li>
          <li>Graphic, obscene, or pornographic material.</li>
          <li>Content that promotes discrimination or hate speech.</li>
          <li>Misinformation that could cause harm to individuals or the community.</li>
        </ul>
      </section>

      <section id="prohibited-items">
        <h2>5. PROHIBITED MARKETPLACE ITEMS</h2>
        <p>The following items may <strong>not</strong> be listed on the community marketplace:</p>
        <ul>
          <li>Illegal drugs, narcotics, and controlled substances</li>
          <li>Weapons, ammunition, and explosives</li>
          <li>Counterfeit or pirated goods</li>
          <li>Stolen property</li>
          <li>Alcohol and tobacco products</li>
          <li>Prescription medications</li>
          <li>Pornographic or sexually explicit material</li>
          <li>Wildlife products or endangered species derivatives</li>
          <li>Hazardous materials</li>
          <li>Items that infringe intellectual property rights</li>
          <li>Any item restricted or prohibited under Indian law</li>
        </ul>
      </section>

      <section id="roommate-matching">
        <h2>6. ROOMMATE MATCHING CONDUCT</h2>
        <p>When using the roommate matching feature:</p>
        <ul>
          <li>Provide honest information about your habits, preferences, and lifestyle.</li>
          <li>Do not discriminate unlawfully in your roommate search.</li>
          <li>Meet potential roommates in a <strong>public, safe location</strong> before agreeing to share accommodation.</li>
          <li>Verify the identity of potential roommates independently.</li>
          <li>Report any suspicious or threatening behaviour immediately.</li>
        </ul>
      </section>

      <section id="moderation">
        <h2>7. MODERATION AND ENFORCEMENT</h2>

        <h3>7.1 How We Moderate</h3>
        <ul>
          <li><strong>Automated Systems:</strong> Content filters and spam detection.</li>
          <li><strong>User Reports:</strong> Community reporting mechanism for violations.</li>
          <li><strong>Admin Review:</strong> Manual review by FlatsNFood administrators.</li>
        </ul>

        <h3>7.2 Reporting Violations</h3>
        <p>If you encounter content or behaviour that violates these Guidelines:</p>
        <ol>
          <li>Use the <strong>Report</strong> button on the relevant listing, review, post, or profile.</li>
          <li>Provide details and evidence of the violation.</li>
          <li>Reports are reviewed within <strong>48–72 hours</strong>.</li>
          <li>You can also email: reports@flatsnfoods.in.</li>
        </ol>

        <h3>7.3 Enforcement Actions</h3>
        <p>Depending on the severity and frequency of violations:</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Warning</td>
                <td className="px-4 py-3">First minor violation — written warning via notification/email</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Content Removal</td>
                <td className="px-4 py-3">Offending content is removed from the Platform</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Temporary Suspension</td>
                <td className="px-4 py-3">Account suspended for 7–30 days for repeated or serious violations</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Permanent Ban</td>
                <td className="px-4 py-3">Account permanently terminated for severe or repeated violations</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Legal Action</td>
                <td className="px-4 py-3">For criminal conduct, fraud, or severe harm — reported to law enforcement</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>7.4 Appeals</h3>
        <ul>
          <li>If you believe an enforcement action was taken in error, you may appeal by emailing appeals@flatsnfoods.in within <strong>7 days</strong> of the action.</li>
          <li>Include your account details and a clear explanation of why you believe the action was unjustified.</li>
          <li>Appeals are reviewed within <strong>10 business days</strong>.</li>
          <li>The decision on appeal is final.</li>
        </ul>
      </section>

      <section id="safety-students">
        <h2>8. SAFETY TIPS FOR STUDENTS</h2>
        <ul>
          <li><strong>Visit in person</strong> before committing to any property or mess.</li>
          <li><strong>Never share</strong> OTPs, passwords, bank details, or Aadhaar information with anyone on the Platform.</li>
          <li><strong>Meet in public</strong> places when meeting marketplace buyers/sellers or potential roommates.</li>
          <li><strong>Trust your instincts</strong> — if something seems too good to be true, it probably is.</li>
          <li><strong>Verify independently</strong> — check Google Maps, visit the area, talk to neighbours.</li>
          <li><strong>Keep records</strong> — save receipts, agreements, and communication for reference.</li>
          <li><strong>Report suspicious activity</strong> immediately.</li>
        </ul>
      </section>

      <section id="safety-owners">
        <h2>9. SAFETY TIPS FOR OWNERS</h2>
        <ul>
          <li><strong>Verify tenant identity</strong> through proper documentation before entering into agreements.</li>
          <li><strong>Respond promptly</strong> to enquiries and maintain accurate listings.</li>
          <li><strong>Do not demand</strong> advance payments through unofficial channels.</li>
          <li><strong>Maintain compliance</strong> with local laws, FSSAI (for messes), and building regulations.</li>
          <li><strong>Handle negative reviews</strong> professionally — respond constructively, do not retaliate.</li>
        </ul>
      </section>

      <section id="intellectual-property">
        <h2>10. INTELLECTUAL PROPERTY</h2>
        <ul>
          <li>Respect copyright and intellectual property rights when posting content.</li>
          <li>Do not use another person's photos, text, or creative work without permission.</li>
          <li>FlatsNFood respects IP rights and will remove infringing content upon valid notification.</li>
        </ul>
      </section>

      <section id="changes">
        <h2>11. CHANGES</h2>
        <p>We may update these Guidelines from time to time. Changes will be communicated via in-app notification. Continued use constitutes acceptance.</p>
      </section>

      <section id="contact">
        <h2>12. CONTACT</h2>
        <p>For questions about these Guidelines:</p>
        <ul>
          <li><strong>Email:</strong> community@flatsnfoods.in</li>
          <li><strong>Reports:</strong> reports@flatsnfoods.in</li>
          <li><strong>Appeals:</strong> appeals@flatsnfoods.in</li>
        </ul>
      </section>

      <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-500 dark:text-slate-400 italic">
        <strong>Note:</strong> These Guidelines complement the Terms & Conditions. In case of conflict, the Terms & Conditions shall prevail.
        <br /><br />
        © 2026 FlatsNFood. All rights reserved.
      </div>
    </LegalPageLayout>
  )
}
