import React, { useState } from 'react';
import { FlightForm } from './components/FlightForm';
import { verifyLicense, logFlight } from './services/api';
import { Coordinates, FlightLogResponse } from './types';
import { CheckCircle, AlertTriangle, Ban } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'FORM' | 'SUCCESS' | 'RESTRICTED'>('FORM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<FlightLogResponse | null>(null);
  const [flightDetails, setFlightDetails] = useState<{
    coords: Coordinates;
    start: string;
    end: string;
  } | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleFlightSubmit = async (license: string, startTime: string, endTime: string, coords: Coordinates) => {
    setIsSubmitting(true);
    setVerificationError(null);
    
    // Construct Date Objects in Local Time
    const now = new Date();
    // Get YYYY-MM-DD in local time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const fromDate = `${dateStr} ${startTime}`;
    const toDate = `${dateStr} ${endTime}`;

    try {
        // 1. Verify License
        const verification = await verifyLicense(license);
        
        if (!verification.isValid) {
            setVerificationError(verification.message || "Invalid License Number. Please check and try again.");
            setIsSubmitting(false);
            return;
        }

        // 2. Submit Flight
        const flightData = {
            license: license,
            lat: coords.lat,
            lon: coords.lng,
            from: fromDate,
            to: toDate,
            coordinates: `${coords.lat},${coords.lng}`
        };

        const result = await logFlight(flightData);
        setSubmissionResult(result);
        setFlightDetails({ coords, start: fromDate, end: toDate });

        if (result.status === "RESTRICTED") {
            setViewState('RESTRICTED');
        } else {
            setViewState('SUCCESS');
        }

    } catch (error) {
        console.error(error);
        setVerificationError("An unexpected error occurred. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full font-sans bg-gray-50 items-center justify-center py-2 min-h-0">
      <main className="container mx-auto px-4 w-full max-w-6xl">
        {viewState === 'FORM' && (
            <FlightForm 
                onSubmit={handleFlightSubmit} 
                isSubmitting={isSubmitting} 
                error={verificationError}
                onErrorClear={() => setVerificationError(null)}
            />
        )}

        {viewState === 'SUCCESS' && flightDetails && (
            <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-2">
                        <div className="bg-black rounded-full p-1">
                            <CheckCircle className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Flight Logged <span className="text-green-600">Successfully</span></h2>
                    </div>
                    <p className="text-lg text-gray-700">Your drone flight has been recorded. You are cleared to take off.</p>
                </div>

                <div className="border border-gray-300 rounded-sm overflow-hidden shadow-sm bg-white">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0088cc] text-white">
                                <th className="p-3 border-r border-blue-400 w-1/3">Section</th>
                                <th className="p-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800">
                            <tr className="border-b border-gray-300 bg-gray-50">
                                <td className="p-3 font-bold border-r border-gray-300">Coordinates</td>
                                <td className="p-3 font-medium">Lat: {flightDetails.coords.lat.toFixed(4)}, Long: {flightDetails.coords.lng.toFixed(4)}</td>
                            </tr>
                            <tr className="border-b border-gray-300">
                                <td className="p-3 font-bold border-r border-gray-300">Approved Flight Time</td>
                                <td className="p-3 font-medium">{flightDetails.start} → {flightDetails.end}</td>
                            </tr>
                            <tr className="border-b border-gray-300 bg-gray-50">
                                <td className="p-3 font-bold border-r border-gray-300">MOD Special Notes</td>
                                <td className="p-3 italic flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-gray-600 flex-shrink-0" />
                                    <span>{submissionResult?.warningNote || "No special notes."}</span>
                                </td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border-r border-gray-300">General Notes</td>
                                <td className="p-3">- Max altitude: 120m - Avoid wildlife zones - Maintain VLOS</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {viewState === 'RESTRICTED' && flightDetails && submissionResult && (
            <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <Ban className="h-8 w-8 text-red-600" />
                            <h2 className="text-2xl font-bold text-red-600">Flight Not Approved</h2>
                        </div>
                        <div className="flex items-start gap-2 max-w-2xl text-center font-medium text-lg justify-center">
                            <p>
                                Your requested flight location falls within a <span className="font-bold">restricted airspace</span>: <span className="font-bold text-red-600">{submissionResult.reason || "Restricted Zone"}</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border border-gray-300 rounded-sm overflow-hidden shadow-sm bg-white mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0088cc] text-white">
                                <th className="p-3 border-r border-blue-400 w-1/3">Field</th>
                                <th className="p-3">Details</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-800">
                            <tr className="border-b border-gray-300 bg-gray-50">
                                <td className="p-3 font-bold border-r border-gray-300">Status</td>
                                <td className="p-3 font-medium italic flex items-center gap-2 text-red-600">
                                    <Ban className="h-4 w-4" />
                                    Flight Restricted – <span className="font-bold">Not Approved</span>
                                </td>
                            </tr>
                            <tr className="border-b border-gray-300">
                                <td className="p-3 font-bold border-r border-gray-300">Restricted Zone</td>
                                <td className="p-3 font-medium">{submissionResult.reason || "Unknown Zone"}</td>
                            </tr>
                            <tr className="border-b border-gray-300 bg-gray-50">
                                <td className="p-3 font-bold border-r border-gray-300">Reason</td>
                                <td className="p-3">{submissionResult.reason || "Falls within a restricted airspace"}</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-bold border-r border-gray-300">Coordinates</td>
                                <td className="p-3 font-medium">{flightDetails.coords.lat.toFixed(4)}, {flightDetails.coords.lng.toFixed(4)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col items-center text-center gap-2 max-w-2xl mx-auto p-4">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <AlertTriangle className="h-6 w-6 text-black" />
                        WARNING:
                    </div>
                    <p className="font-medium leading-relaxed">
                        Flying here is illegal. Violations may lead to <span className="font-bold">fines, drone seizure, or imprisonment</span> under Sri Lanka’s aviation safety and anti-terrorism laws.
                    </p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;