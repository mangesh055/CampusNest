import React from 'react'
import LegalPageLayout from '../components/layout/LegalPageLayout'

export default function GrievanceRedressalPage() {
  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'scope', title: '2. Scope' },
    { id: 'grievance-officer', title: '3. Grievance Officer' },
    { id: 'how-to-file', title: '4. How to File a Grievance' },
    { id: 'resolution-process', title: '5. Grievance Resolution Process' },
    { id: 'categories', title: '6. Categories of Grievances' },
    { id: 'escalation', title: '7. Escalation' },
    { id: 'content-takedown', title: '8. Content Takedown Requests' },
    { id: 'data-protection', title: '9. Data Protection Grievances' },
    { id: 'record-keeping', title: '10. Record-Keeping' },
    { id: 'commitment', title: '11. Commitment' },
    { id: 'changes', title: '12. Changes to this Policy' },
    { id: 'governing-law', title: '13. Governing Law' },
    { id: 'contact', title: '14. Contact' },
  ]

  return (
    <LegalPageLayout
      title="Grievance Redressal Policy"
      lastUpdated="20 July 2026"
      effectiveDate="20 July 2026"
      version="1.0"
      sections={sections}
    >
      <section id="introduction">
        <h2>1. INTRODUCTION</h2>
        <p>FlatsNFoods is committed to providing a transparent, fair, and efficient grievance redressal mechanism for all users. This Grievance Redressal Policy ("Policy") outlines the process for raising, handling, and resolving complaints related to the Platform.</p>
        <p>This Policy is published in compliance with:</p>
        <ul>
          <li><strong>The Information Technology Act, 2000</strong>, Section 79 read with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</li>
          <li><strong>The Consumer Protection Act, 2019</strong> and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong></li>
          <li><strong>The Digital Personal Data Protection Act, 2023</strong></li>
        </ul>
      </section>

      <section id="scope">
        <h2>2. SCOPE</h2>
        <p>This Policy covers grievances related to:</p>
        <ul>
          <li>Account issues (access, suspension, termination)</li>
          <li>Property and mess listing disputes</li>
          <li>Mess subscription and attendance issues</li>
          <li>Refund and cancellation disputes</li>
          <li>User-generated content (reviews, community posts)</li>
          <li>Privacy and data protection concerns</li>
          <li>Community Guidelines violations</li>
          <li>Marketplace transaction disputes</li>
          <li>Platform functionality and technical issues</li>
          <li>Any other matter arising from your use of the Platform</li>
        </ul>
      </section>

      <section id="grievance-officer">
        <h2>3. GRIEVANCE OFFICER</h2>
        <p>In accordance with the IT Act, 2000 (Section 79) and the DPDP Act, 2023, FlatsNFoods has appointed a Grievance Officer:</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <tbody>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold bg-slate-50 dark:bg-slate-800 w-48">Name</td>
                <td className="px-4 py-3">[Grievance Officer Full Name]</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold bg-slate-50 dark:bg-slate-800">Designation</td>
                <td className="px-4 py-3">Grievance Officer</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold bg-slate-50 dark:bg-slate-800">Organisation</td>
                <td className="px-4 py-3">FlatsNFoods / [Your Registered Entity Name]</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold bg-slate-50 dark:bg-slate-800">Email</td>
                <td className="px-4 py-3">grievance@flatsnfoods.in</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold bg-slate-50 dark:bg-slate-800">Phone</td>
                <td className="px-4 py-3">+91 8999 295 362 / 7517 807 405</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold bg-slate-50 dark:bg-slate-800">Postal Address</td>
                <td className="px-4 py-3">[Registered Office Address, City, State – Pincode, India]</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold bg-slate-50 dark:bg-slate-800">Working Hours</td>
                <td className="px-4 py-3">Monday to Friday, 10:00 AM – 6:00 PM IST (excluding gazetted public holidays)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="how-to-file">
        <h2>4. HOW TO FILE A GRIEVANCE</h2>
        
        <h3>4.1 Channels</h3>
        <p>You may submit a grievance through any of the following channels:</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Email</td>
                <td className="px-4 py-3">grievance@flatsnfoods.in</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">In-App Support</td>
                <td className="px-4 py-3">Dashboard → Help / Support section</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Online Form</td>
                <td className="px-4 py-3">[www.flatsnfoods.in/grievance] (if available)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Postal Mail</td>
                <td className="px-4 py-3">Address to the Grievance Officer at the postal address above</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>4.2 Information Required</h3>
        <p>To help us investigate and resolve your grievance efficiently, please include:</p>
        <ol>
          <li><strong>Your Details:</strong> Full name, registered email address, phone number, user role.</li>
          <li><strong>Grievance Category:</strong> Account, listing, subscription, refund, content, privacy, marketplace, technical, or other.</li>
          <li><strong>Description:</strong> Clear and detailed description of the issue, including relevant dates, transaction/order IDs, and the names/IDs of other users involved (if applicable).</li>
          <li><strong>Supporting Evidence:</strong> Screenshots, receipts, correspondence, or any relevant documentation.</li>
          <li><strong>Relief Sought:</strong> What resolution or outcome you are seeking.</li>
        </ol>

        <h3>4.3 Grievance ID</h3>
        <p>Upon receipt, each grievance will be assigned a unique <strong>Grievance ID</strong> for tracking purposes. You will receive this ID via email/notification within <strong>24 hours</strong> of submission.</p>
      </section>

      <section id="resolution-process">
        <h2>5. GRIEVANCE RESOLUTION PROCESS</h2>
        
        <h3>5.1 Resolution Timeline</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Timeline</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Acknowledgement</td>
                <td className="px-4 py-3">Within <strong>24 hours</strong> of receipt</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Preliminary Review</td>
                <td className="px-4 py-3">Within <strong>3 business days</strong></td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Investigation</td>
                <td className="px-4 py-3">Within <strong>10 business days</strong> of acknowledgement</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Final Resolution</td>
                <td className="px-4 py-3">Within <strong>15 days</strong> of receipt (extendable to <strong>30 days</strong> for complex cases with notice to complainant)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>These timelines are in accordance with Rule 3(2) of the IT (Intermediary Guidelines) Rules, 2021, which requires resolution within 15 days (or 30 days for complex matters).</p>

        <h3>5.2 Resolution Process</h3>
        <p><strong>Step 1 — Acknowledgement:</strong></p>
        <ul>
          <li>Your grievance is logged and assigned a Grievance ID.</li>
          <li>You receive an acknowledgement with the ID and expected timeline.</li>
        </ul>
        <p><strong>Step 2 — Preliminary Review:</strong></p>
        <ul>
          <li>The Grievance Officer assesses the nature and category of the complaint.</li>
          <li>If additional information is needed, you will be contacted.</li>
        </ul>
        <p><strong>Step 3 — Investigation:</strong></p>
        <ul>
          <li>Relevant parties (other users, owners, admin team) may be contacted.</li>
          <li>Platform records, logs, and transaction data are reviewed.</li>
          <li>Content may be reviewed against Community Guidelines and Terms & Conditions.</li>
        </ul>
        <p><strong>Step 4 — Resolution:</strong></p>
        <ul>
          <li>A resolution is communicated to you via email/notification.</li>
          <li>The resolution may include: corrective action, content removal, account action (warning/suspension/ban), refund, or explanation.</li>
          <li>If the grievance involves another user, appropriate action is taken on their account.</li>
        </ul>
        <p><strong>Step 5 — Closure:</strong></p>
        <ul>
          <li>The grievance is marked as resolved.</li>
          <li>You receive a closure communication with details of the resolution.</li>
        </ul>
      </section>

      <section id="categories">
        <h2>6. CATEGORIES OF GRIEVANCES AND EXPECTED ACTIONS</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Expected Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Fake/Misleading Listings</td>
                <td className="px-4 py-3">Investigation → content removal → warning/suspension of listing owner</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Fraud or Scam</td>
                <td className="px-4 py-3">Immediate investigation → account suspension → law enforcement referral if warranted</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Harassment or Abuse</td>
                <td className="px-4 py-3">Content removal → warning/suspension/ban of offending user</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Privacy Violation</td>
                <td className="px-4 py-3">Investigation → data correction/deletion → remedial measures</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Subscription/Refund Dispute</td>
                <td className="px-4 py-3">Review of transaction → mediation → refund processing (if applicable)</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Technical Issues</td>
                <td className="px-4 py-3">Bug reporting → fix deployment → user notification</td>
              </tr>
              <tr className="border-b dark:border-slate-700">
                <td className="px-4 py-3 font-semibold">Content Moderation</td>
                <td className="px-4 py-3">Review against Community Guidelines → removal/retention decision</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Marketplace Dispute</td>
                <td className="px-4 py-3">Mediation between buyer/seller → enforcement action if needed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="escalation">
        <h2>7. ESCALATION</h2>
        
        <h3>7.1 Internal Escalation</h3>
        <p>If you are not satisfied with the resolution provided by the Grievance Officer:</p>
        <ol>
          <li><strong>Email the founder/management team</strong> at escalations@flatsnfoods.in within <strong>7 days</strong> of receiving the resolution.</li>
          <li>Include your Grievance ID and the reasons for dissatisfaction.</li>
          <li>The escalation will be reviewed by a senior member within <strong>10 business days</strong>.</li>
        </ol>

        <h3>7.2 External Escalation</h3>
        <p>If the internal escalation does not resolve your complaint, you may approach:</p>
        <p><strong>For IT Act / Intermediary matters:</strong></p>
        <ul>
          <li>The <strong>Appellate Committee</strong> constituted under the IT (Intermediary Guidelines) Rules, 2021 (once operational).</li>
        </ul>
        <p><strong>For Consumer Protection matters:</strong></p>
        <ul>
          <li><strong>National Consumer Helpline:</strong> 1800-11-4000 or https://consumerhelpline.gov.in</li>
          <li><strong>Consumer Forum / Commission:</strong> File a complaint before the appropriate District, State, or National Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.</li>
        </ul>
        <p><strong>For Data Protection matters:</strong></p>
        <ul>
          <li><strong>Data Protection Board of India</strong> (once constituted under the DPDP Act, 2023).</li>
        </ul>
        <p><strong>For criminal matters:</strong></p>
        <ul>
          <li>The local <strong>Cyber Crime Police Station</strong> or the <strong>National Cyber Crime Reporting Portal</strong>: https://cybercrime.gov.in</li>
        </ul>
      </section>

      <section id="content-takedown">
        <h2>8. CONTENT TAKEDOWN REQUESTS</h2>
        
        <h3>8.1 Unlawful Content</h3>
        <p>If you believe content on the Platform violates any law or your legal rights:</p>
        <ol>
          <li>Send a written notice to grievance@flatsnfoods.in with:
            <ul>
              <li>Identification of the content (URL, screenshot, listing ID)</li>
              <li>Specific law or right being violated</li>
              <li>Your contact information</li>
              <li>A statement of good faith belief</li>
            </ul>
          </li>
          <li>We will act on valid takedown requests within <strong>36 hours</strong> for manifestly unlawful content, and within <strong>15 days</strong> for other content, in accordance with the IT (Intermediary Guidelines) Rules, 2021.</li>
        </ol>

        <h3>8.2 Intellectual Property Infringement</h3>
        <p>If your intellectual property rights are being infringed:</p>
        <ol>
          <li>Provide: description of the copyrighted work, location of infringing content on the Platform, your contact details, a statement of ownership, and a statement under penalty of perjury.</li>
          <li>We will process valid IP takedown requests within <strong>36 hours</strong> of receipt.</li>
        </ol>

        <h3>8.3 Counter-Notice</h3>
        <p>If your content is removed and you believe it was removed in error, you may file a counter-notice within <strong>14 days</strong> with evidence supporting your position.</p>
      </section>

      <section id="data-protection">
        <h2>9. DATA PROTECTION GRIEVANCES</h2>
        <p>For grievances related to your personal data (access, correction, erasure, consent withdrawal):</p>
        <ul>
          <li>Contact the Grievance Officer at grievance@flatsnfoods.in.</li>
          <li>Reference the <strong>Privacy Policy, Section 10</strong> (Your Rights as a Data Principal).</li>
          <li>We will respond within <strong>30 days</strong> as required under the DPDP Act, 2023.</li>
        </ul>
      </section>

      <section id="record-keeping">
        <h2>10. RECORD-KEEPING</h2>
        <p>We maintain records of all grievances, including:</p>
        <ul>
          <li>Grievance ID, date of receipt, category, description</li>
          <li>Actions taken and timeline</li>
          <li>Resolution and closure date</li>
          <li>Communication with the complainant</li>
        </ul>
        <p>Records are retained for <strong>2 years</strong> from the date of resolution, in accordance with applicable legal requirements.</p>
      </section>

      <section id="commitment">
        <h2>11. COMMITMENT</h2>
        <p>FlatsNFoods is committed to:</p>
        <ul>
          <li>Treating all grievances with fairness, impartiality, and confidentiality.</li>
          <li>Not retaliating against users for filing good-faith complaints.</li>
          <li>Continuously improving our processes based on grievance patterns and feedback.</li>
          <li>Publishing a monthly compliance report (once required under applicable rules).</li>
        </ul>
      </section>

      <section id="changes">
        <h2>12. CHANGES TO THIS POLICY</h2>
        <p>We may update this Policy from time to time. Changes will be communicated via in-app notification and/or email.</p>
      </section>

      <section id="governing-law">
        <h2>13. GOVERNING LAW</h2>
        <p>This Policy is governed by the laws of the Republic of India. Disputes are subject to the exclusive jurisdiction of courts in [Your City], India.</p>
      </section>

      <section id="contact">
        <h2>14. CONTACT</h2>
        <ul>
          <li><strong>Grievance Officer Email:</strong> grievance@flatsnfoods.in</li>
          <li><strong>Escalations:</strong> escalations@flatsnfoods.in</li>
          <li><strong>General Support:</strong> support@flatsnfoods.in</li>
          <li><strong>Phone:</strong> +91 8999 295 362 / 7517 807 405</li>
          <li><strong>Address:</strong> [Registered Office Address]</li>
        </ul>
      </section>

      <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-500 dark:text-slate-400 italic">
        <strong>DISCLAIMER:</strong> This Grievance Redressal Policy is drafted to align with applicable Indian laws and is intended for legal review before publication.
        <br /><br />
        © 2026 FlatsNFoods. All rights reserved.
      </div>
    </LegalPageLayout>
  )
}
