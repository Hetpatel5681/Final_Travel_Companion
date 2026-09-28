// Assume custom components map these to standard UI libraries natively

interface DashboardProps {
  profile: any;
}

export const TravelPersonalityDashboard: React.FC<DashboardProps> = ({ profile }) => {
  if (!profile) return <div>Loading Travel Intelligence...</div>;

  const topHistory = profile.personalityHistory?.[profile.personalityHistory.length - 1];
  const scores = profile.personalityScores || {};
  
  // Safety checks converting JSON floats smoothly mapping 0.91 => 91%
  const renderBar = (label: string, decimal: number) => {
     const percentage = Math.round((decimal || 0) * 100);
     return (
       <div key={label} className="mb-4">
         <div className="flex justify-between mb-1 text-sm font-medium">
           <span className="capitalize">{label}</span>
           <span>{percentage}%</span>
         </div>
         <div className="w-full bg-gray-200 rounded-full h-2">
           <div 
             className="bg-indigo-600 h-2 rounded-full" 
             style={{ width: `${percentage}%` }}
           ></div>
         </div>
       </div>
     );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
       <h2 className="text-2xl font-bold mb-6 text-gray-800">Travel Intelligence Center</h2>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* ML Personality Metrics */}
         <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Personality Vector Profile</h3>
            {Object.entries(scores).map(([key, val]) => renderBar(key, val as number))}
         </div>

         {/* Explainable AI Block */}
         <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-2 text-indigo-700">Explaining: <span className="capitalize">{topHistory?.topPersonality || 'Analyzing...'}</span></h3>
            <p className="text-sm text-gray-500 mb-4">
               ML Confidence: <strong>{topHistory?.confidence || 0}%</strong>
            </p>
            
            <div className="mb-4">
               <h4 className="font-medium text-gray-700 text-sm mb-2">Primary Reasons:</h4>
               <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                 {topHistory?.reasons?.map((r: string, i: number) => <li key={i}>{r}</li>)}
               </ul>
            </div>
            
            <div>
               <h4 className="font-medium text-gray-700 text-sm mb-2">Top ML Contributors:</h4>
               <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                 {topHistory?.contributingFeatures?.map((f: string, i: number) => <li key={i}>{f}</li>)}
               </ul>
            </div>
         </div>
       </div>

       {/* Diagnostics Block */}
       <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
             <h4 className="text-sm font-semibold text-blue-800">Dataset Completeness</h4>
             <p className="text-2xl font-bold text-blue-600">{profile.learningProgress?.datasetCompleteness || 0}%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
             <h4 className="text-sm font-semibold text-purple-800">Trips Evaluated</h4>
             <p className="text-2xl font-bold text-purple-600">{profile.learningProgress?.tripsAnalyzed || 0}</p>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg">
             <h4 className="text-sm font-semibold text-emerald-800">Python Schema Vectors Valid</h4>
             <p className="text-2xl font-bold text-emerald-600">v{profile.modelCompatibility?.featureVectorVersion || '1.0'}</p>
          </div>
       </div>
    </div>
  );
};
